package com.library.service.impl;

import com.library.dto.request.IssueRequest;
import com.library.dto.request.ReturnRequest;
import com.library.dto.response.FinesSummaryResponse;
import com.library.dto.response.TransactionResponse;
import com.library.entity.Book;
import com.library.entity.Transaction;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import com.library.service.TransactionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private static final int    LOAN_PERIOD_DAYS = 7;
    private static final double FINE_PER_DAY_RS   = 5.0;

    /** How many times a single issue request will retry after an optimistic-lock clash. */
    private static final int    MAX_ISSUE_ATTEMPTS = 5;

    private final TransactionRepository transactionRepository;
    private final BookRepository        bookRepository;
    private final UserRepository        userRepository;
    private final PlatformTransactionManager transactionManager;

    /**
     * Runs each issue attempt in its OWN transaction (REQUIRES_NEW). This is
     * essential for the retry loop: with open-session-in-view enabled, a plain
     * REQUIRED transaction would reuse the request-bound persistence context, so
     * a retry's {@code findById} would return the stale, first-level-cached Book
     * (same version) and spin forever. A brand-new transaction gets a fresh
     * persistence context and re-reads the current row from the database.
     */
    private TransactionTemplate issueInNewTx;

    @PostConstruct
    void initTxTemplate() {
        this.issueInNewTx = new TransactionTemplate(transactionManager);
        this.issueInNewTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    // ── Issue ─────────────────────────────────────────────────────────────────

    /**
     * Issues a copy of a book to a user, safely under concurrency.
     *
     * <p><b>The race being defended against:</b> the naive flow reads the book,
     * checks {@code availableCopies > 0}, decrements, and writes. Two requests
     * for the last copy can both read {@code 1}, both pass the check, and both
     * write a loan — issuing a book that does not physically exist.
     *
     * <p><b>Chosen fix — optimistic locking + retry.</b> {@link Book} carries a
     * {@code @Version} column, so Hibernate emits {@code UPDATE ... WHERE id = ?
     * AND version = ?}. The first committer wins; the loser matches zero rows and
     * Hibernate throws an optimistic-lock exception. We then retry in a fresh
     * transaction (see {@link #issueInNewTx}), where the re-read now sees the
     * decremented count and correctly rejects with "no copies available".
     *
     * <p><b>Alternatives considered and rejected:</b>
     * <ul>
     *   <li><i>Pessimistic write lock</i> ({@code SELECT ... FOR UPDATE} via
     *       {@code @Lock(PESSIMISTIC_WRITE)}): correct, but every issue serializes
     *       on a row lock held for the whole transaction and it risks deadlocks
     *       under load. Contention on a single title is low here, so paying that
     *       cost on every request is the wrong trade. It becomes the better choice
     *       if issue conflicts become frequent (hot titles).</li>
     *   <li><i>Atomic conditional update</i> ({@code UPDATE books SET
     *       available_copies = available_copies - 1 WHERE id = ? AND
     *       available_copies > 0}, acting on the affected-row count): the most
     *       efficient single-statement option, but it sidesteps the entity model
     *       and would still need bespoke handling to build the loan row. Kept as
     *       the go-to optimization if this ever becomes a throughput hot path.</li>
     * </ul>
     */
    @Override
    public TransactionResponse issueBook(IssueRequest request) {
        int attempt = 0;
        while (true) {
            attempt++;
            try {
                return issueInNewTx.execute(status -> doIssueBook(request));
            } catch (OptimisticLockingFailureException ex) {
                if (attempt >= MAX_ISSUE_ATTEMPTS) {
                    log.warn("Giving up issuing book {} after {} optimistic-lock retries",
                            request.getBookId(), attempt);
                    throw ex; // -> GlobalExceptionHandler maps to 409 Conflict
                }
                log.debug("Optimistic-lock conflict issuing book {} (attempt {}/{}); retrying",
                        request.getBookId(), attempt, MAX_ISSUE_ATTEMPTS);
                backoffBeforeRetry(attempt);
            }
        }
    }

    /**
     * The actual issue unit of work. Runs inside {@link #issueInNewTx}, so the
     * book decrement and the loan insert commit (or roll back) atomically.
     */
    private TransactionResponse doIssueBook(IssueRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with id: " + request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException(
                    "Book '" + book.getTitle() + "' has no available copies for issue");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getUserId()));

        LocalDate today   = LocalDate.now();
        LocalDate dueDate = today.plusDays(LOAN_PERIOD_DAYS);

        // Decrement available copies. On flush, Hibernate guards this with the
        // version check; a concurrent issue that already committed makes this
        // fail with an optimistic-lock exception rather than over-issuing.
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Transaction tx = Transaction.builder()
                .user(user)
                .book(book)
                .issueDate(today)
                .dueDate(dueDate)
                .build();

        Transaction saved = transactionRepository.save(tx);
        log.info("Book '{}' issued to user '{}'. Due: {} (copies remaining: {})",
                book.getTitle(), user.getEmail(), dueDate, book.getAvailableCopies());
        return toResponse(saved);
    }

    /** Small jittered pause so retrying threads don't stampede the same row in lockstep. */
    private void backoffBeforeRetry(int attempt) {
        try {
            long jitterMs = ThreadLocalRandom.current().nextLong(5L, 15L * attempt);
            Thread.sleep(jitterMs);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while retrying book issue", ie);
        }
    }

    // ── Return ────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public TransactionResponse returnBook(ReturnRequest request) {
        // Use JOIN FETCH so user and book are loaded within this transaction
        Transaction tx = transactionRepository.findByIdWithDetails(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + request.getTransactionId()));

        if (tx.getReturnDate() != null) {
            throw new BadRequestException(
                    "Book has already been returned on " + tx.getReturnDate());
        }

        LocalDate returnDate = LocalDate.now();
        tx.setReturnDate(returnDate);

        // ── Fine calculation: ₹5 per day after due date ──────────────────────
        double fine = 0.0;
        if (returnDate.isAfter(tx.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(tx.getDueDate(), returnDate);
            fine = overdueDays * FINE_PER_DAY_RS;
            log.info("Fine applied: ₹{} ({} overdue days) for transaction {}",
                    fine, overdueDays, tx.getId());
        }
        tx.setFine(fine > 0 ? fine : null);

        // Increment available copies
        Book book = tx.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        transactionRepository.save(tx);
        log.info("Book '{}' returned by user '{}'", book.getTitle(), tx.getUser().getEmail());
        return toResponse(tx);
    }

    // ── Fine Collection ───────────────────────────────────────────────────────
    @Override
    @Transactional
    public TransactionResponse collectFine(Long transactionId) {
        Transaction tx = transactionRepository.findByIdWithDetails(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId));

        if (tx.getFine() == null || tx.getFine() <= 0) {
            throw new BadRequestException("No fine to collect for this transaction");
        }
        if (tx.isFinePaid()) {
            throw new BadRequestException("Fine has already been collected for this transaction");
        }

        tx.setFinePaid(true);
        tx.setFinePaymentDate(LocalDate.now());
        transactionRepository.save(tx);

        log.info("Fine of ₹{} collected for transaction {}", tx.getFine(), tx.getId());
        return toResponse(tx);
    }

    @Override
    @Transactional(readOnly = true)
    public FinesSummaryResponse getOutstandingFines() {
        List<Transaction> allWithFines = transactionRepository.findAllWithDetails()
                .stream()
                .filter(tx -> tx.getFine() != null && tx.getFine() > 0)
                .toList();

        double totalOutstanding = allWithFines.stream()
                .filter(tx -> !tx.isFinePaid())
                .mapToDouble(Transaction::getFine)
                .sum();

        double totalCollected = allWithFines.stream()
                .filter(Transaction::isFinePaid)
                .mapToDouble(Transaction::getFine)
                .sum();

        long outstandingCount = allWithFines.stream()
                .filter(tx -> !tx.isFinePaid())
                .count();

        long collectedCount = allWithFines.stream()
                .filter(Transaction::isFinePaid)
                .count();

        return FinesSummaryResponse.builder()
                .totalOutstanding(totalOutstanding)
                .totalCollected(totalCollected)
                .outstandingCount(outstandingCount)
                .collectedCount(collectedCount)
                .build();
    }

    // ── Queries ───────────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        // Use JOIN FETCH query to avoid LazyInitializationException
        return transactionRepository.findByUserIdWithDetails(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        // Use JOIN FETCH query to avoid LazyInitializationException
        // (user and book are LAZY — plain findAll() closes the session before mapping)
        return transactionRepository.findAllWithDetails()
                .stream().map(this::toResponse).toList();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────
    private TransactionResponse toResponse(Transaction tx) {
        String status;
        if (tx.getReturnDate() != null) {
            status = "RETURNED";
        } else if (LocalDate.now().isAfter(tx.getDueDate())) {
            status = "OVERDUE";
        } else {
            status = "ACTIVE";
        }

        return TransactionResponse.builder()
                .id(tx.getId())
                .userId(tx.getUser().getId())
                .userName(tx.getUser().getName())
                .bookId(tx.getBook().getId())
                .bookTitle(tx.getBook().getTitle())
                .issueDate(tx.getIssueDate())
                .dueDate(tx.getDueDate())
                .returnDate(tx.getReturnDate())
                .fine(tx.getFine())
                .finePaid(tx.isFinePaid())
                .finePaymentDate(tx.getFinePaymentDate())
                .status(status)
                .build();
    }
}

