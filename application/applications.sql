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
    draft_payload JSON DEFAULT NULL,
    application_status ENUM('DRAFT', 'SUBMITTED', 'SUCCESSFUL', 'UNSUCCESSFUL', 'CANCELLED') NOT NULL DEFAULT 'SUBMITTED',
    active_main_applicant_nric VARCHAR(20)
        GENERATED ALWAYS AS (
            CASE
                WHEN application_status IN ('DRAFT', 'SUBMITTED') THEN main_applicant_nric
                ELSE NULL
            END
        ) STORED,
    submitted_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_active_main_applicant_nric (active_main_applicant_nric)
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
    is_pregnant BOOLEAN NOT NULL DEFAULT FALSE,
    income_amount DECIMAL(12,2) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES application(application_id) ON DELETE CASCADE
);

-- Sample records
INSERT INTO application (
    application_id,
    exercise_id,
    project_id,
    flat_type,
    main_applicant_nric,
    income_document_id,
    hfe_document_id,
    draft_payload,
    application_status,
    submitted_at,
    created_at,
    updated_at
) VALUES
(
    2001,
    202601,
    51,
    '4-Room',
    'S9812381D',
    1,
    2,
    '{"form":{"fullName":"TAN HENG HUAT","nric":"S9812381D","dateOfBirth":"1998-06-06","contactNumber":"97399245","email":"myinfotesting@gmail.com","maritalStatus":"Married","preferredTown":"Queenstown","flatType":"4-Room"},"documents":{"incomePdfName":"income_doc_tan_heng_huat.pdf","hfeLetterPdfName":"hfe_tan_heng_huat.pdf"},"saved_step":"payment","saved_at":"2026-03-31T08:40:00"}',
    'DRAFT',
    NULL,
    '2026-03-30 09:15:00',
    '2026-03-31 08:40:00'
),
(
    2002,
    202511,
    52,
    '3-Room',
    'S9912375C',
    3,
    4,
    '{"form":{"fullName":"BERNARD WONG","nric":"S9912375C","dateOfBirth":"1948-09-10","contactNumber":"81234567","email":"bernard.wong@example.com","maritalStatus":"Single","preferredTown":"Kallang/Whampoa","flatType":"3-Room"},"documents":{"incomePdfName":"income_doc_bernard_wong.pdf","hfeLetterPdfName":"hfe_bernard_wong.pdf"},"saved_step":"submitted","saved_at":"2026-02-14T10:20:00"}',
    'SUBMITTED',
    '2026-02-14 10:20:00',
    '2026-02-14 10:18:00',
    '2026-02-14 10:20:00'
),
(
    2003,
    202510,
    21,
    '5-Room',
    'S9812346F',
    5,
    6,
    '{"form":{"fullName":"SAM YEE","nric":"S9812346F","dateOfBirth":"1989-12-06","contactNumber":"92345678","email":"sam.yee@example.com","maritalStatus":"Married","preferredTown":"Punggol","flatType":"5-Room"},"documents":{"incomePdfName":"income_doc_sam_yee.pdf","hfeLetterPdfName":"hfe_sam_yee.pdf"},"saved_step":"submitted","saved_at":"2025-11-18T14:05:00"}',
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
    is_pregnant,
    income_amount,
    created_at,
    updated_at
) VALUES
(
    3001,
    2001,
    'MAIN_APPLICANT',
    'S9812381D',
    'TAN HENG HUAT',
    'Self',
    '1998-06-06',
    'Citizen',
    'Married',
    FALSE,
    4999.00,
    '2026-03-30 09:15:00',
    '2026-03-31 08:40:00'
),
(
    3002,
    2001,
    'CO_APPLICANT',
    'S9812382B',
    'FREYA LIM GUO EN',
    'Spouse',
    '1960-04-19',
    'Foreigner',
    'Married',
    FALSE,
    3999.00,
    '2026-03-30 09:15:00',
    '2026-03-31 08:40:00'
),
(
    3003,
    2002,
    'MAIN_APPLICANT',
    'S9912375C',
    'BERNARD WONG',
    'Self',
    '1948-09-10',
    'Citizen',
    'Single',
    FALSE,
    0.00,
    '2026-02-14 10:18:00',
    '2026-02-14 10:20:00'
),
(
    3004,
    2002,
    'CO_APPLICANT',
    'S9912365F',
    'CHENG MEI QIN',
    'Sister',
    '1961-06-17',
    'Citizen',
    'Single',
    FALSE,
    0.00,
    '2026-02-14 10:18:00',
    '2026-02-14 10:20:00'
),
(
    3005,
    2003,
    'MAIN_APPLICANT',
    'S9812346F',
    'SAM YEE',
    'Self',
    '1989-12-06',
    'Citizen',
    'Married',
    FALSE,
    0.00,
    '2025-11-18 13:40:00',
    '2025-12-02 09:10:00'
);
