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
     * Backward-compatible convenience method.
     * A book is "available" if at least one copy can be issued.
     */
    public boolean isAvailable() {
        return availableCopies > 0;
    }
}
