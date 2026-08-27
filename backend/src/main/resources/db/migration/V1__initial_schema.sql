-- V1: Initial schema — mirrors the JPA entities as of v1.0.0
-- This migration is safe to run on a fresh database or an existing one
-- (Flyway baseline-on-migrate handles the latter case).

CREATE TABLE IF NOT EXISTS users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100)  NOT NULL,
    email    VARCHAR(100)  NOT NULL,
    password VARCHAR(60)   NOT NULL,
    role     VARCHAR(20)   NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS books (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    title     VARCHAR(255) NOT NULL,
    author    VARCHAR(255) NOT NULL,
    isbn      VARCHAR(255) NOT NULL,
    category  VARCHAR(255) NOT NULL,
    available BIT(1)       NOT NULL DEFAULT 1,
    CONSTRAINT uk_books_isbn UNIQUE (isbn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    book_id     BIGINT NOT NULL,
    issue_date  DATE   NOT NULL,
    due_date    DATE   NOT NULL,
    return_date DATE   NULL,
    fine        DOUBLE NULL,
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_transactions_book FOREIGN KEY (book_id) REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_book_id ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_return_date ON transactions(return_date);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(available);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
