-- Application Service Database
CREATE DATABASE IF NOT EXISTS applications;
USE applications;

CREATE TABLE IF NOT EXISTS application (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT NOT NULL,
    project_id INT NOT NULL,
    flat_type VARCHAR(50) NOT NULL,
    main_applicant_nric VARCHAR(20) NOT NULL,
    income_document_id INT DEFAULT NULL,
    hfe_document_id INT DEFAULT NULL,
    application_status ENUM('SUBMITTED', 'SUCCESSFUL', 'UNSUCCESSFUL', 'CANCELLED') NOT NULL DEFAULT 'SUBMITTED',
    submitted_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS application_member (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    member_role ENUM('MAIN_APPLICANT', 'CO_APPLICANT', 'OCCUPANT') NOT NULL,
    nric_fin VARCHAR(20) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship_to_main VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    citizenship_status VARCHAR(20) NOT NULL,
    marital_status VARCHAR(20) DEFAULT NULL,
    contact_number VARCHAR(30) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    income_amount DECIMAL(12,2) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES application(application_id) ON DELETE CASCADE
);

SET @add_application_member_contact_number = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'application_member'
              AND COLUMN_NAME = 'contact_number'
        ),
        'SELECT 1',
        'ALTER TABLE application_member ADD COLUMN contact_number VARCHAR(30) DEFAULT NULL AFTER marital_status'
    )
);
PREPARE stmt FROM @add_application_member_contact_number;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_application_member_email = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'application_member'
              AND COLUMN_NAME = 'email'
        ),
        'SELECT 1',
        'ALTER TABLE application_member ADD COLUMN email VARCHAR(255) DEFAULT NULL AFTER contact_number'
    )
);
PREPARE stmt FROM @add_application_member_email;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_application_member_is_pregnant = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'application_member'
              AND COLUMN_NAME = 'is_pregnant'
        ),
        'ALTER TABLE application_member DROP COLUMN is_pregnant',
        'SELECT 1'
    )
);
PREPARE stmt FROM @drop_application_member_is_pregnant;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------------------------
-- Three demo applications aligned to the dummy variable PDF personas.
--
-- App 2001 — Kevin Tan + Elaine Koh applying for 5-Room (SUBMITTED).
--            Happy path: married couple, valid HFE, income within ceiling.
--            Documents: income doc 1 (joint), HFE doc 2 (Kevin+Elaine).
--
-- App 2002 — Aaron Tan applying for 3-Room (SUBMITTED).
--            Single applicant, valid HFE, eligible for 3-Room only.
--            Documents: income doc 3 (Aaron CPF), HFE doc 4 (Aaron).
--
-- App 2003 — Sam Yee applying for 5-Room (UNSUCCESSFUL).
--            Failing path: HFE letter expired in September 2020.
--            Documents: income doc 5 (Sam CPF), HFE doc 6 (Sam).
-- -----------------------------------------------------------------------
INSERT INTO application (
    application_id,
    exercise_id,
    project_id,
    flat_type,
    main_applicant_nric,
    income_document_id,
    hfe_document_id,
    application_status,
    submitted_at,
    created_at,
    updated_at
) VALUES
(
    2001,
    202601,
    51,
    '5-Room',
    'S9701234K',
    1,
    2,
    'SUBMITTED',
    '2026-03-15 10:00:00',
    '2026-03-15 09:45:00',
    '2026-03-15 10:00:00'
),
(
    2002,
    202601,
    21,
    '3-Room',
    'S8501234A',
    3,
    4,
    'SUBMITTED',
    '2026-03-20 14:30:00',
    '2026-03-20 14:15:00',
    '2026-03-20 14:30:00'
),
(
    2003,
    202510,
    32,
    '5-Room',
    'S9812346F',
    5,
    6,
    'UNSUCCESSFUL',
    '2025-11-18 14:05:00',
    '2025-11-18 13:40:00',
    '2025-12-02 09:10:00'
);

INSERT INTO application_member (
    member_id,
    application_id,
    member_role,
    nric_fin,
    full_name,
    relationship_to_main,
    date_of_birth,
    citizenship_status,
    marital_status,
    contact_number,
    email,
    income_amount,
    created_at,
    updated_at
) VALUES
-- App 2001: Kevin + Elaine
(
    3001,
    2001,
    'MAIN_APPLICANT',
    'S9701234K',
    'KEVIN TAN WEI JIAN',
    'Self',
    '1997-10-08',
    'Citizen',
    'Married',
    '+65 9123 4567',
    'kevin.tan@example.com',
    5491.67,
    '2026-03-15 09:45:00',
    '2026-03-15 10:00:00'
),
(
    3002,
    2001,
    'CO_APPLICANT',
    'S8805678E',
    'ELAINE KOH MEI LING',
    'Spouse',
    '1988-09-30',
    'Citizen',
    'Married',
    '+65 9234 5678',
    'elaine.koh@example.com',
    4929.17,
    '2026-03-15 09:45:00',
    '2026-03-15 10:00:00'
),
-- App 2002: Aaron Tan (solo)
(
    3003,
    2002,
    'MAIN_APPLICANT',
    'S8501234A',
    'AARON TAN WEI MING',
    'Self',
    '1985-04-12',
    'Citizen',
    'Single',
    '+65 9345 6789',
    'aaron.tan@example.com',
    7233.33,
    '2026-03-20 14:15:00',
    '2026-03-20 14:30:00'
),
-- App 2003: Sam Yee (solo — expired HFE)
(
    3004,
    2003,
    'MAIN_APPLICANT',
    'S9812346F',
    'SAM YEE',
    'Self',
    '1989-12-06',
    'Citizen',
    'Married',
    '+65 9456 7890',
    'sam.yee@example.com',
    2673.70,
    '2025-11-18 13:40:00',
    '2025-12-02 09:10:00'
);
