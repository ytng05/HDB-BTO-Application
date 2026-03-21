-- Application Service Database
CREATE DATABASE IF NOT EXISTS application_service;
USE application_service;

-- Applicants table
CREATE TABLE IF NOT EXISTS application (
    application_id VARCHAR(20) PRIMARY KEY,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_nric VARCHAR(9) NOT NULL,
    co_applicant_name VARCHAR(100),
    co_applicant_nric VARCHAR(9),
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('submitted', 'balloted', 'selecting', 'reserved', 'paid', 'forfeited') NOT NULL DEFAULT 'submitted',
    queue_number INT DEFAULT NULL,
    flat_id INT DEFAULT NULL,
    reserved_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data - applicants who have already been balloted and are ready to select flats
INSERT INTO application (application_id, applicant_name, applicant_nric, co_applicant_name, co_applicant_nric, email, phone, status, queue_number) VALUES
('APP-2025-001', 'Marcus Tan', 'S9012345A', 'Sarah Lim', 'S9112345B', 'marcus.tan@email.com', '91234567', 'balloted', 1),
('APP-2025-002', 'James Wong', 'S8812345C', 'Emily Chen', 'S8912345D', 'james.wong@email.com', '92345678', 'balloted', 2),
('APP-2025-003', 'David Lee', 'S9212345E', 'Rachel Ng', 'S9312345F', 'david.lee@email.com', '93456789', 'balloted', 3),
('APP-2025-004', 'Kevin Loh', 'S9412345G', 'Amanda Teo', 'S9512345H', 'kevin.loh@email.com', '94567890', 'balloted', 4);