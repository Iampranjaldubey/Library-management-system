package com.library.service;

import com.library.dto.request.IssueRequest;
import com.library.entity.Book;
import com.library.entity.Role;
import com.library.entity.User;
import com.library.repository.BookRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Regression guard for the "over-issue" race in {@code issueBook}.
 *
 * <p>The original implementation did read → check {@code availableCopies > 0} →
 * decrement → save with no locking. When two requests raced for the last copy,
 * both read {@code availableCopies == 1}, both passed the check, and both created
 * a loan — issuing a book that physically did not exist.
 *
 * <p>This test fires {@value #CONCURRENT_REQUESTS} concurrent {@code issueBook}
 * calls against a book with a single copy and asserts that <b>exactly one</b>
 * succeeds. It fails on the unlocked code (multiple successes) and passes once
 * optimistic locking with retry is in place.
 *
 * <p>Runs against the H2 test profile. {@code @Version} optimistic locking is
 * enforced by Hibernate at the application layer (a versioned {@code UPDATE ...
 * WHERE version = ?}), so it is exercised faithfully here regardless of the
 * underlying database. Milestone 2 will additionally pin this down against real
 * MySQL via Testcontainers.
 */
@SpringBootTest
@ActiveProfiles("test")
class TransactionConcurrencyTest {

    private static final int CONCURRENT_REQUESTS = 12;

    @Autowired private TransactionService     transactionService;
    @Autowired private BookRepository          bookRepository;
    @Autowired private UserRepository          userRepository;
    @Autowired private TransactionRepository   transactionRepository;

    private Long bookId;
    private Long userId;

    // Deliberately NOT @Transactional: the setup writes must be committed so the
    // worker threads (each in their own transaction/connection) can see them, and
    // so we can observe the real committed state after the race resolves.
    @BeforeEach
    void seedSingleCopyBook() {
        User user = userRepository.save(User.builder()
                .name("Concurrency Tester")
                .email("concurrency-" + UUID.randomUUID() + "@example.com")
                .password("bcrypt-placeholder-hash")
                .role(Role.USER)
                .active(true)
                .emailVerified(true)
                .build());

        Book book = bookRepository.save(Book.builder()
                .title("The Only Copy")
                .author("A. Author")
                .isbn("CC-" + UUID.randomUUID())
                .category("Fiction")
                .totalCopies(1)
                .availableCopies(1)
                .build());

        this.userId = user.getId();
        this.bookId = book.getId();
    }

    @AfterEach
    void cleanUp() {
        // FK order: transactions reference book_id and user_id.
        transactionRepository.deleteAll(transactionRepository.findByBookId(bookId));
        bookRepository.deleteById(bookId);
        userRepository.deleteById(userId);
    }

    @Test
    void onlyOneOfManyConcurrentIssuesSucceedsForTheLastCopy() throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(CONCURRENT_REQUESTS);
        CountDownLatch ready    = new CountDownLatch(CONCURRENT_REQUESTS);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch done      = new CountDownLatch(CONCURRENT_REQUESTS);

        AtomicInteger successes = new AtomicInteger();
        AtomicInteger failures  = new AtomicInteger();
        ConcurrentLinkedQueue<String> failureTypes = new ConcurrentLinkedQueue<>();

        try {
            for (int i = 0; i < CONCURRENT_REQUESTS; i++) {
                pool.submit(() -> {
                    IssueRequest request = new IssueRequest();
                    request.setBookId(bookId);
                    request.setUserId(userId);

                    ready.countDown();
                    try {
                        startGate.await();      // release all threads at the same instant
                        transactionService.issueBook(request);
                        successes.incrementAndGet();
                    } catch (Throwable t) {
                        failures.incrementAndGet();
                        failureTypes.add(t.getClass().getSimpleName());
                    } finally {
                        done.countDown();
                    }
                    return null;
                });
            }

            assertThat(ready.await(10, TimeUnit.SECONDS))
                    .as("all worker threads should reach the start gate").isTrue();
            startGate.countDown();
            assertThat(done.await(30, TimeUnit.SECONDS))
                    .as("all issue attempts should finish").isTrue();
        } finally {
            pool.shutdownNow();
        }

        // Exactly one loan is created; the rest are rejected.
        assertThat(successes.get())
                .as("exactly one concurrent issue should succeed for a single copy (failures: %s)",
                        failureTypes)
                .isEqualTo(1);
        assertThat(failures.get()).isEqualTo(CONCURRENT_REQUESTS - 1);

        // The committed state must agree: no copies left and a single transaction row.
        Book after = bookRepository.findById(bookId).orElseThrow();
        assertThat(after.getAvailableCopies())
                .as("available copies must never go negative or leave phantom stock")
                .isZero();

        List<?> loans = transactionRepository.findByBookId(bookId);
        assertThat(loans)
                .as("only one physical copy exists, so only one loan may be recorded")
                .hasSize(1);
    }
}
