package com.library.integration;

import com.library.dto.request.IssueRequest;
import com.library.entity.Book;
import com.library.entity.Role;
import com.library.entity.User;
import com.library.repository.BookRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import com.library.service.TransactionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

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
 * The definitive proof of the concurrency fix: the same over-issue race asserted
 * by {@code TransactionConcurrencyTest}, but against REAL MySQL (via Testcontainers)
 * with Flyway-managed schema — not H2.
 *
 * <p>H2 exercises the {@code @Version} optimistic lock faithfully at the Hibernate
 * layer, but only MySQL confirms the behavior on the actual production engine and
 * its InnoDB row locking. This class runs in CI and anywhere Docker is available;
 * it skips (does not fail) when there's no Docker daemon.
 */
@SpringBootTest
@ActiveProfiles("mysqltest")
@Testcontainers(disabledWithoutDocker = true)
class TransactionConcurrencyMySQLTest {

    private static final int CONCURRENT_REQUESTS = 12;

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
    }

    @Autowired private TransactionService   transactionService;
    @Autowired private BookRepository        bookRepository;
    @Autowired private UserRepository        userRepository;
    @Autowired private TransactionRepository transactionRepository;

    private Long bookId;
    private Long userId;

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
        transactionRepository.deleteAll(transactionRepository.findByBookId(bookId));
        bookRepository.deleteById(bookId);
        userRepository.deleteById(userId);
    }

    @Test
    void onlyOneOfManyConcurrentIssuesSucceedsForTheLastCopy() throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(CONCURRENT_REQUESTS);
        CountDownLatch ready     = new CountDownLatch(CONCURRENT_REQUESTS);
        CountDownLatch startGate  = new CountDownLatch(1);
        CountDownLatch done       = new CountDownLatch(CONCURRENT_REQUESTS);

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
                        startGate.await();
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

            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            startGate.countDown();
            assertThat(done.await(30, TimeUnit.SECONDS)).isTrue();
        } finally {
            pool.shutdownNow();
        }

        assertThat(successes.get())
                .as("exactly one concurrent issue should succeed for a single copy (failures: %s)",
                        failureTypes)
                .isEqualTo(1);
        assertThat(failures.get()).isEqualTo(CONCURRENT_REQUESTS - 1);

        Book after = bookRepository.findById(bookId).orElseThrow();
        assertThat(after.getAvailableCopies()).isZero();

        List<?> loans = transactionRepository.findByBookId(bookId);
        assertThat(loans).hasSize(1);
    }
}
