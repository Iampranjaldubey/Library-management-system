-- V4: Phase 3 — Operations
-- Adds reservations, audit logging, and loan renewal tracking.

-- ── 1. Reservations table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reservations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    book_id     BIGINT       NOT NULL,
    reserved_at DATETIME     NOT NULL,
    expires_at  DATETIME     NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'WAITING',
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservations_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reservations_book_status ON reservations(book_id, status);
CREATE INDEX idx_reservations_user_status ON reservations(user_id, status);

-- ── 2. Audit logs table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    action            VARCHAR(50)  NOT NULL,
    performed_by      VARCHAR(100) NOT NULL,
    performed_by_role VARCHAR(20)  NULL,
    entity_type       VARCHAR(50)  NOT NULL,
    entity_id         BIGINT       NULL,
    details           TEXT         NULL,
    ip_address        VARCHAR(50)  NULL,
    timestamp         DATETIME     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ── 3. Loan renewal tracking ─────────────────────────────────────────────────

ALTER TABLE transactions
    ADD COLUMN renewal_count INT NOT NULL DEFAULT 0;
