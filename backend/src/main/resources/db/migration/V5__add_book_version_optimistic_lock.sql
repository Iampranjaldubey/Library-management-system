-- V5: Optimistic-locking version column for concurrency-safe circulation.
--
-- The book issue/return flow reads availableCopies, checks it, decrements, and
-- writes. Under concurrent requests for the last copy this is a classic
-- lost-update race that lets a book be issued more times than it physically
-- exists. Adding a JPA @Version column makes Hibernate issue a versioned
-- UPDATE (... WHERE id = ? AND version = ?); the second writer to commit
-- matches zero rows and fails with an optimistic-lock exception, which the
-- service retries in a fresh transaction.
--
-- Existing rows default to 0; Hibernate takes over the value from then on.

ALTER TABLE books
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
