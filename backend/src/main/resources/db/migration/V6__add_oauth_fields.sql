-- V6: Add OAuth fields to users table

ALTER TABLE users
ADD COLUMN provider VARCHAR(20) DEFAULT 'LOCAL' NOT NULL,
ADD COLUMN provider_id VARCHAR(255) NULL;
