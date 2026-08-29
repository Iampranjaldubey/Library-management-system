-- V2: Add refresh_tokens table for extended session management

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(255) NOT NULL,
    user_id     BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    revoked     BIT(1) NOT NULL DEFAULT 0,
    CONSTRAINT uk_refresh_tokens_token UNIQUE (token),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
