-- Document Service Database
CREATE DATABASE IF NOT EXISTS documents;
USE documents;

CREATE TABLE IF NOT EXISTS documents (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    document_type VARCHAR(20) NOT NULL,
    storage_path TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    fields_json JSON NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sample records
INSERT INTO documents (
    application_id, document_type, storage_path, status, fields_json, uploaded_at
) VALUES
(
    1001,
    'income',
    '/data/documents/f8fb51382d183fd5d7c23563cc1276cf62c0e5c69b0f3929b2f0bb59ad72fb91.pdf',
    'processed',
    '{"main_applicant_name":"AARON TAN","main_applicant_nric":"S8501234A","main_applicant_date_of_birth":"12 April 1985","main_applicant_nationality":"Singaporean","main_applicant_residency_status":"Citizen","main_applicant_employer_name":"Singtel Telecommunications Pte Ltd","main_applicant_employer_uen":"199201624D","main_applicant_employment_type":"Full-Time Permanent","main_applicant_occupation":"Senior Network Engineer","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_date_of_birth":null,"co_applicant_nationality":null,"co_applicant_residency_status":null,"co_applicant_employer_name":null,"co_applicant_employer_uen":null,"co_applicant_employment_type":null,"co_applicant_occupation":null,"template":"income_single_applicant","document_variant":"standard_income_statement","statement_reference":"CPF-2025-STM-00841","statement_period":"01 Jan 2024 - 31 Dec 2024","date_of_issue":"27 March 2025","total_ordinary_wages":74400.0,"total_additional_wages":12400.0,"total_gross_income":86800.0,"average_monthly_income":7233.33,"cpf_medisave_contribution":null,"business_entity":null,"business_uen":null,"years_in_operation":null,"net_self_employed_income":null}',
    '2026-03-30 09:00:00'
),
(
    1001,
    'hfe',
    '/data/documents/680f0088996184fbaf52b56f142c8e0375b67682f34b3a2d641208246242cf4b.pdf',
    'processed',
    '{"main_applicant_name":"AARON TAN WEI MING","main_applicant_nric":"S8501234A","main_applicant_role":"Main Applicant","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_role":null,"template":"hfe_single_applicant","hfe_reference_no":"25189218A","mydoc_reference_no":"20250101-153001-8501234A","date_of_issue":"01 January 2025","valid_until":"30 September 2025","eligible_flat_types":"3-Room, 4-Room","application_scheme":"Single Singapore Citizen (SSC) Scheme","hdb_loan_ceiling":180000,"total_household_income":7233.33,"assessment_outcome":"ELIGIBLE (3-Room)","total_grants_eligible":55000}',
    '2026-03-30 09:05:00'
),
(
    1002,
    'income',
    '',
    'uploaded',
    NULL,
    '2026-03-30 09:10:00'
),
(
    1003,
    'hfe',
    '',
    'failed',
    NULL,
    '2026-03-30 09:15:00'
);
