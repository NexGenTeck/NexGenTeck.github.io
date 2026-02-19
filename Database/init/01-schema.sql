-- MySQL schema for Hostinger database
-- Run this once via Hostinger cPanel → phpMyAdmin

CREATE TABLE IF NOT EXISTS contact_submissions (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME     NOT NULL DEFAULT NOW(),
    name       VARCHAR(200) NOT NULL,
    email      VARCHAR(320) NOT NULL,
    phone      VARCHAR(50)  DEFAULT NULL,
    subject    VARCHAR(200) DEFAULT NULL,
    message    TEXT         NOT NULL,
    ip_address VARCHAR(45)  DEFAULT NULL,
    user_agent TEXT         DEFAULT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'new',
    notes      TEXT         DEFAULT NULL
);

CREATE INDEX idx_contact_created_at ON contact_submissions (created_at DESC);
CREATE INDEX idx_contact_status     ON contact_submissions (status);
CREATE INDEX idx_contact_email      ON contact_submissions (email);
