package com.library.repository;

import com.library.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Fetch a single transaction with user and book eagerly loaded.
     */
    @Query("SELECT t FROM Transaction t JOIN FETCH t.user JOIN FETCH t.book WHERE t.id = :id")
    Optional<Transaction> findByIdWithDetails(@Param("id") Long id);

    /**
     * Fetch all transactions with user and book eagerly loaded in a single query.
     * Prevents LazyInitializationException when mapping outside a Hibernate session.
     */
    @Query("SELECT t FROM Transaction t JOIN FETCH t.user JOIN FETCH t.book")
    List<Transaction> findAllWithDetails();

    /**
     * Fetch transactions for a specific user with relations eagerly loaded.
     */
    @Query("SELECT t FROM Transaction t JOIN FETCH t.user JOIN FETCH t.book WHERE t.user.id = :userId")
    List<Transaction> findByUserIdWithDetails(@Param("userId") Long userId);

    // ── Legacy methods kept for compatibility ─────────────────────────────────

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByBookId(Long bookId);

    // Active issue = returnDate is null
    Optional<Transaction> findByBookIdAndReturnDateIsNull(Long bookId);

    List<Transaction> findByUserIdAndReturnDateIsNull(Long userId);
}
