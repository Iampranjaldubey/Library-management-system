-- V3: Phase 2 — Core Library Features
-- Adds multi-copy tracking, user management fields, fine payment tracking,
-- password reset tokens, and email verification tokens.

-- ── 1. Multi-copy book tracking ──────────────────────────────────────────────
-- Add totalCopies and availableCopies columns, then backfill from the existing
-- 'available' flag, and finally drop the old boolean column.

ALTER TABLE books
    ADD COLUMN total_copies     INT NOT NULL DEFAULT 1,
    ADD COLUMN available_copies INT NOT NULL DEFAULT 1;

-- Backfill: books that were marked unavailable get availableCopies = 0
UPDATE books SET available_copies = 0 WHERE available = 0;

-- Drop the old boolean column (no longer needed; availability is derived)
ALTER TABLE books DROP COLUMN available;

-- ── 2. User management fields ────────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN active         BIT(1)      NOT NULL DEFAULT 1,
    ADD COLUMN email_verified BIT(1)      NOT NULL DEFAULT 0,
    ADD COLUMN created_at     DATETIME    NULL,
    ADD COLUMN member_id      VARCHAR(20) NULL;

-- Backfill: existing users are considered verified and active
UPDATE users SET email_verified = 1, active = 1;

-- Generate member IDs for existing users based on their auto-increment id
UPDATE users SET member_id = CONCAT('LIB-', LPAD(id, 5, '0')) WHERE member_id IS NULL;

-- Make member_id unique after backfill
ALTER TABLE users ADD CONSTRAINT uk_users_member_id UNIQUE (member_id);

-- ── 3. Fine payment tracking ─────────────────────────────────────────────────

ALTER TABLE transactions
    ADD COLUMN fine_paid         BIT(1) NOT NULL DEFAULT 0,
    ADD COLUMN fine_payment_date DATE   NULL;

-- ── 4. Password reset tokens ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(255) NOT NULL,
    user_id     BIGINT       NOT NULL,
    expiry_date DATETIME     NOT NULL,
    used        BIT(1)       NOT NULL DEFAULT 0,
    CONSTRAINT uk_password_reset_tokens_token UNIQUE (token),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- ── 5. Email verification tokens ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(255) NOT NULL,
    user_id     BIGINT       NOT NULL,
    expiry_date DATETIME     NOT NULL,
    CONSTRAINT uk_email_verification_tokens_token UNIQUE (token),
    CONSTRAINT fk_email_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
