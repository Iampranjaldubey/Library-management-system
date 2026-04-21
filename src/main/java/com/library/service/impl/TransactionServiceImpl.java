package com.library.service.impl;

import com.library.dto.request.IssueRequest;
import com.library.dto.request.ReturnRequest;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private static final int    LOAN_PERIOD_DAYS = 7;
    private static final double FINE_PER_DAY_RS   = 5.0;

    private final TransactionRepository transactionRepository;
    private final BookRepository        bookRepository;
    private final UserRepository        userRepository;

    // ── Issue ─────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public TransactionResponse issueBook(IssueRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with id: " + request.getBookId()));

        if (!book.isAvailable()) {
            throw new BadRequestException(
                    "Book '" + book.getTitle() + "' is currently not available for issue");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getUserId()));

        LocalDate today   = LocalDate.now();
        LocalDate dueDate = today.plusDays(LOAN_PERIOD_DAYS);

        // Mark book as unavailable
        book.setAvailable(false);
        bookRepository.save(book);

        Transaction tx = Transaction.builder()
                .user(user)
                .book(book)
                .issueDate(today)
                .dueDate(dueDate)
                .build();

        Transaction saved = transactionRepository.save(tx);
        log.info("Book '{}' issued to user '{}'. Due: {}", book.getTitle(), user.getEmail(), dueDate);
        return toResponse(saved);
    }

    // ── Return ────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public TransactionResponse returnBook(ReturnRequest request) {
        Transaction tx = transactionRepository.findById(request.getTransactionId())
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

        // Mark book as available again
        Book book = tx.getBook();
        book.setAvailable(true);
        bookRepository.save(book);

        transactionRepository.save(tx);
        log.info("Book '{}' returned by user '{}'", book.getTitle(), tx.getUser().getEmail());
        return toResponse(tx);
    }

    // ── Queries ───────────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return transactionRepository.findByUserId(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll()
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
                .status(status)
                .build();
    }
}
