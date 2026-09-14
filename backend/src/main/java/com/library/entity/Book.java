package com.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "books",
        uniqueConstraints = @UniqueConstraint(columnNames = "isbn"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, unique = true)
    private String isbn;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    @Builder.Default
    private int totalCopies = 1;

    @Column(nullable = false)
    @Builder.Default
    private int availableCopies = 1;

    /**
     * Optimistic-locking version. Hibernate appends {@code AND version = ?} to
     * every UPDATE and bumps the value on write, so two transactions that both
     * read the same row cannot both commit — the loser gets an
     * {@code OptimisticLockException}. This is what makes concurrent book
     * issue/return safe against the lost-update (over-issue) race.
     * Managed entirely by the persistence provider; never set it by hand.
     */
    @Version
    @Column(nullable = false)
    private Long version;

    /**
     * Backward-compatible convenience method.
     * A book is "available" if at least one copy can be issued.
     */
    public boolean isAvailable() {
        return availableCopies > 0;
    }
}
