-- Document Service Database
CREATE DATABASE IF NOT EXISTS documents;
USE documents;

CREATE TABLE IF NOT EXISTS documents (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    document_type VARCHAR(20) NOT NULL,
    storage_path TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    fields_json JSON DEFAULT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sample records aligned to the seeded applications table
INSERT INTO documents (
    document_id, application_id, document_type, storage_path, status, fields_json, uploaded_at
) VALUES
(
    1,
    2001,
    'income',
    '/data/documents/sample-income-2001.pdf',
    'processed',
    '{"main_applicant_name":"TAN HENG HUAT","main_applicant_nric":"S9812381D","main_applicant_date_of_birth":"06 June 1998","main_applicant_nationality":"Singaporean","main_applicant_residency_status":"Citizen","main_applicant_employer_name":"HDB Services Pte Ltd","main_applicant_employer_uen":"201912345K","main_applicant_employment_type":"Full-Time Permanent","main_applicant_occupation":"Operations Executive","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_date_of_birth":null,"co_applicant_nationality":null,"co_applicant_residency_status":null,"co_applicant_employer_name":null,"co_applicant_employer_uen":null,"co_applicant_employment_type":null,"co_applicant_occupation":null,"template":"income_single_applicant","document_variant":"standard_income_statement","statement_reference":"CPF-2026-STM-02001","statement_period":"01 Jan 2025 - 31 Dec 2025","date_of_issue":"27 March 2026","total_ordinary_wages":59988.0,"total_additional_wages":0.0,"total_gross_income":59988.0,"average_monthly_income":4999.0,"cpf_medisave_contribution":null,"business_entity":null,"business_uen":null,"years_in_operation":null,"net_self_employed_income":null}',
    '2026-03-30 09:00:00'
),
(
    2,
    2001,
    'hfe',
    '/data/documents/sample-hfe-2001.pdf',
    'processed',
    '{"main_applicant_name":"TAN HENG HUAT","main_applicant_nric":"S9812381D","main_applicant_role":"Main Applicant","co_applicant_name":"FREYA LIM GUO EN","co_applicant_nric":"S9812382B","co_applicant_role":"Co-Applicant","template":"hfe_joint_applicants","hfe_reference_no":"HFE-2001","mydoc_reference_no":"MYDOC-2001","date_of_issue":"25 March 2026","valid_until":"25 September 2026","eligible_flat_types":"3-Room, 4-Room","application_scheme":"Fiance/Fiancee Scheme","hdb_loan_ceiling":240000,"total_household_income":4999.0,"assessment_outcome":"ELIGIBLE","total_grants_eligible":80000}',
    '2026-03-30 09:05:00'
),
(
    3,
    2002,
    'income',
    '/data/documents/sample-income-2002.pdf',
    'processed',
    '{"main_applicant_name":"BERNARD WONG","main_applicant_nric":"S9912375C","main_applicant_date_of_birth":"10 September 1948","main_applicant_nationality":"Singaporean","main_applicant_residency_status":"Citizen","main_applicant_employer_name":"Retired","main_applicant_employer_uen":null,"main_applicant_employment_type":"Retired","main_applicant_occupation":"Retired","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_date_of_birth":null,"co_applicant_nationality":null,"co_applicant_residency_status":null,"co_applicant_employer_name":null,"co_applicant_employer_uen":null,"co_applicant_employment_type":null,"co_applicant_occupation":null,"template":"income_single_applicant","document_variant":"standard_income_statement","statement_reference":"CPF-2026-STM-02002","statement_period":"01 Jan 2025 - 31 Dec 2025","date_of_issue":"14 February 2026","total_ordinary_wages":0.0,"total_additional_wages":0.0,"total_gross_income":0.0,"average_monthly_income":0.0,"cpf_medisave_contribution":null,"business_entity":null,"business_uen":null,"years_in_operation":null,"net_self_employed_income":null}',
    '2026-02-14 10:00:00'
),
(
    4,
    2002,
    'hfe',
    '/data/documents/sample-hfe-2002.pdf',
    'processed',
    '{"main_applicant_name":"BERNARD WONG","main_applicant_nric":"S9912375C","main_applicant_role":"Main Applicant","co_applicant_name":"CHENG MEI QIN","co_applicant_nric":"S9912365F","co_applicant_role":"Co-Applicant","template":"hfe_joint_applicants","hfe_reference_no":"HFE-2002","mydoc_reference_no":"MYDOC-2002","date_of_issue":"10 February 2026","valid_until":"10 August 2026","eligible_flat_types":"2-Room Flexi, 3-Room","application_scheme":"Joint Singles Scheme","hdb_loan_ceiling":180000,"total_household_income":0.0,"assessment_outcome":"ELIGIBLE","total_grants_eligible":45000}',
    '2026-02-14 10:02:00'
),
(
    5,
    2003,
    'income',
    '/data/documents/sample-income-2003.pdf',
    'processed',
    '{"main_applicant_name":"SAM YEE","main_applicant_nric":"S9812346F","main_applicant_date_of_birth":"06 December 1989","main_applicant_nationality":"Singaporean","main_applicant_residency_status":"Citizen","main_applicant_employer_name":"N/A","main_applicant_employer_uen":null,"main_applicant_employment_type":"Unemployed","main_applicant_occupation":"Unemployed","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_date_of_birth":null,"co_applicant_nationality":null,"co_applicant_residency_status":null,"co_applicant_employer_name":null,"co_applicant_employer_uen":null,"co_applicant_employment_type":null,"co_applicant_occupation":null,"template":"income_single_applicant","document_variant":"standard_income_statement","statement_reference":"CPF-2025-STM-02003","statement_period":"01 Jan 2024 - 31 Dec 2024","date_of_issue":"18 November 2025","total_ordinary_wages":0.0,"total_additional_wages":0.0,"total_gross_income":0.0,"average_monthly_income":0.0,"cpf_medisave_contribution":null,"business_entity":null,"business_uen":null,"years_in_operation":null,"net_self_employed_income":null}',
    '2025-11-18 13:42:00'
),
(
    6,
    2003,
    'hfe',
    '/data/documents/sample-hfe-2003.pdf',
    'processed',
    '{"main_applicant_name":"SAM YEE","main_applicant_nric":"S9812346F","main_applicant_role":"Main Applicant","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_role":null,"template":"hfe_single_applicant","hfe_reference_no":"HFE-2003","mydoc_reference_no":"MYDOC-2003","date_of_issue":"10 November 2025","valid_until":"10 May 2026","eligible_flat_types":"4-Room, 5-Room","application_scheme":"Married Couple Scheme","hdb_loan_ceiling":220000,"total_household_income":0.0,"assessment_outcome":"ELIGIBLE","total_grants_eligible":60000}',
    '2025-11-18 13:45:00'
);
