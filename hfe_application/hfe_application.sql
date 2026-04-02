CREATE DATABASE IF NOT EXISTS hfe_applications;
USE hfe_applications;

CREATE TABLE IF NOT EXISTS hfe_application (
    hfe_application_id INT AUTO_INCREMENT PRIMARY KEY,
    main_applicant_nric VARCHAR(20) NOT NULL UNIQUE,
    main_applicant_name VARCHAR(255) NOT NULL,
    co_applicant_nric VARCHAR(20) DEFAULT NULL,
    co_applicant_name VARCHAR(255) DEFAULT NULL,
    total_household_income DECIMAL(12,2) DEFAULT NULL,
    assessment_outcome VARCHAR(255) NOT NULL,
    eligible_flat_types VARCHAR(255) NOT NULL,
    application_scheme VARCHAR(100) DEFAULT NULL,
    hdb_loan_ceiling DECIMAL(12,2) DEFAULT NULL,
    total_grants_eligible DECIMAL(12,2) DEFAULT NULL,
    date_of_issue DATE DEFAULT NULL,
    valid_until DATE DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO hfe_application (
    hfe_application_id,
    main_applicant_nric,
    main_applicant_name,
    co_applicant_nric,
    co_applicant_name,
    total_household_income,
    assessment_outcome,
    eligible_flat_types,
    application_scheme,
    hdb_loan_ceiling,
    total_grants_eligible,
    date_of_issue,
    valid_until
) VALUES
(
    1,
    'S9812381D',
    'TAN HENG HUAT',
    'S9812382B',
    'FREYA LIM GUO EN',
    4999.00,
    'ELIGIBLE',
    '3-Room, 4-Room',
    'Fiance/Fiancee Scheme',
    240000.00,
    80000.00,
    '2026-03-25',
    '2026-09-25'
),
(
    2,
    'S9912375C',
    'BERNARD WONG',
    'S9912365F',
    'CHENG MEI QIN',
    0.00,
    'ELIGIBLE',
    '2-Room Flexi, 3-Room',
    'Joint Singles Scheme',
    180000.00,
    45000.00,
    '2026-02-10',
    '2026-08-10'
),
(
    3,
    'S9812346F',
    'SAM YEE',
    NULL,
    NULL,
    0.00,
    'ELIGIBLE',
    '4-Room, 5-Room',
    'Married Couple Scheme',
    220000.00,
    60000.00,
    '2025-11-10',
    '2026-05-10'
)
ON DUPLICATE KEY UPDATE
    main_applicant_name = VALUES(main_applicant_name),
    co_applicant_nric = VALUES(co_applicant_nric),
    co_applicant_name = VALUES(co_applicant_name),
    total_household_income = VALUES(total_household_income),
    assessment_outcome = VALUES(assessment_outcome),
    eligible_flat_types = VALUES(eligible_flat_types),
    application_scheme = VALUES(application_scheme),
    hdb_loan_ceiling = VALUES(hdb_loan_ceiling),
    total_grants_eligible = VALUES(total_grants_eligible),
    date_of_issue = VALUES(date_of_issue),
    valid_until = VALUES(valid_until);
