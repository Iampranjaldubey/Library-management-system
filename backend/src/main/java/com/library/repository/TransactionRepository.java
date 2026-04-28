package com.library.repository;

import com.library.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByBookId(Long bookId);

    // Active issue = returnDate is null
    Optional<Transaction> findByBookIdAndReturnDateIsNull(Long bookId);

    List<Transaction> findByUserIdAndReturnDateIsNull(Long userId);
}
