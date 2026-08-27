package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);
    Optional<Book> findByIsbn(String isbn);

    // ── Availability queries (multi-copy) ─────────────────────────────────────
    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0")
    List<Book> findAvailable();

    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0")
    Page<Book> findAvailable(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.availableCopies = 0")
    Page<Book> findUnavailable(Pageable pageable);

    List<Book> findByCategoryIgnoreCase(String category);

    // ── Paginated queries ─────────────────────────────────────────────────────

    /**
     * Full-text search across title, author, isbn, and category.
     * Case-insensitive partial matching.
     */
    @Query("""
            SELECT b FROM Book b
            WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(b.category) LIKE LOWER(CONCAT('%', :q, '%'))
            """)
    Page<Book> searchBooks(@Param("q") String query, Pageable pageable);

    /**
     * Search with availability filter (available = copies > 0).
     */
    @Query("""
            SELECT b FROM Book b
            WHERE b.availableCopies > 0
              AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.category) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Book> searchAvailableBooks(@Param("q") String query, Pageable pageable);

    /**
     * Search unavailable books.
     */
    @Query("""
            SELECT b FROM Book b
            WHERE b.availableCopies = 0
              AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.category) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Book> searchUnavailableBooks(@Param("q") String query, Pageable pageable);
}


