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

-- -----------------------------------------------------------------------
-- Six documents aligned to the three demo applications.
--
-- Doc 1 — App 2001, income  : Kevin + Elaine joint income statement
-- Doc 2 — App 2001, HFE     : Kevin + Elaine HFE letter
-- Doc 3 — App 2002, income  : Aaron Tan CPF contribution history
-- Doc 4 — App 2002, HFE     : Aaron Tan HFE letter
-- Doc 5 — App 2003, income  : Sam Yee CPF contribution history
-- Doc 6 — App 2003, HFE     : Sam Yee HFE letter (expired 2020)
--
-- fields_json matches the output of normalize_income_result /
-- normalize_hfe_result in documents.py, so check_eligibility can use
-- these records without re-uploading the PDFs.
-- -----------------------------------------------------------------------
INSERT INTO documents (
    document_id, application_id, document_type, storage_path, status, fields_json, uploaded_at
) VALUES

-- -----------------------------------------------------------------------
-- Doc 1: Kevin + Elaine joint income statement (App 2001)
-- Source PDF: income_doc_5_kevin_elaine_couple.pdf
-- Template: income_joint_applicants (joint_household_income_statement)
-- -----------------------------------------------------------------------
(
    1,
    2001,
    'income',
    '/data/documents/income_doc_5_kevin_elaine_couple.pdf',
    'processed',
    '{"main_applicant_name":"KEVIN TAN WEI JIAN","main_applicant_nric":"S9701234K","main_applicant_date_of_birth":"08 October 1997","main_applicant_nationality":"Singapore Citizen","main_applicant_employer_name":"GovTech Singapore Pte Ltd","main_applicant_employment_type":"Full-Time / Permanent","main_applicant_occupation":"Software Engineer","main_applicant_average_monthly_income":5491.67,"co_applicant_name":"ELAINE KOH MEI LING","co_applicant_nric":"S8805678E","co_applicant_date_of_birth":"30 September 1988","co_applicant_nationality":"Singapore Citizen","co_applicant_employer_name":"National University Hospital (NUH)","co_applicant_employment_type":"Full-Time / Permanent","co_applicant_occupation":"Senior Staff Nurse","co_applicant_average_monthly_income":4929.17,"template":"income_joint_applicants","document_variant":"joint_household_income_statement","statement_reference":"HDB-BTO-2025-06-00551","statement_period":"01 Jan 2024 - 31 Dec 2024","date_of_issue":"27 March 2025","combined_total_gross_income":125900.04,"combined_average_monthly_income":10420.83,"hdb_income_ceiling_status":null}',
    '2026-03-15 09:50:00'
),

-- -----------------------------------------------------------------------
-- Doc 2: Kevin + Elaine HFE letter (App 2001)
-- Source PDF: hfe_5_kevin_elaine_couple.pdf
-- HFE Reference: 25412788K | Valid until: 26 Nov 2025
-- -----------------------------------------------------------------------
(
    2,
    2001,
    'hfe',
    '/data/documents/hfe_5_kevin_elaine_couple.pdf',
    'processed',
    '{"main_applicant_name":"KEVIN TAN WEI JIAN","main_applicant_nric":"S9701234K","main_applicant_role":"Main Applicant","co_applicant_name":"ELAINE KOH MEI LING","co_applicant_nric":"S8805678E","co_applicant_role":"Co-Applicant (Spouse)","template":"hfe_joint_applicants","hfe_reference_no":"25412788K","mydoc_reference_no":"20250227-153533-9701234K","date_of_issue":"27 February 2025","valid_until":"26 November 2025","eligible_flat_types":"4-Room, 5-Room","application_scheme":"Public Scheme (Married Couple / Singapore Citizen)","hdb_loan_ceiling":360000,"total_household_income":10420.83,"assessment_outcome":"ELIGIBLE","total_grants_eligible":100000}',
    '2026-03-15 09:52:00'
),

-- -----------------------------------------------------------------------
-- Doc 3: Aaron Tan CPF contribution history (App 2002)
-- Source PDF: income_doc_1_aaron_tan.pdf
-- Avg monthly: $7,233.33 | Period: Jan-Dec 2024
-- -----------------------------------------------------------------------
(
    3,
    2002,
    'income',
    '/data/documents/income_doc_1_aaron_tan.pdf',
    'processed',
    '{"main_applicant_name":"AARON TAN","main_applicant_nric":"S8501234A","main_applicant_date_of_birth":"12 April 1985","main_applicant_nationality":"Singaporean","main_applicant_residency_status":"Citizen","main_applicant_employer_name":"Singtel Telecommunications Pte Ltd","main_applicant_employer_uen":"199201624D","main_applicant_employment_type":"Full-Time Permanent","main_applicant_occupation":"Senior Network Engineer","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_date_of_birth":null,"co_applicant_nationality":null,"co_applicant_residency_status":null,"co_applicant_employer_name":null,"co_applicant_employer_uen":null,"co_applicant_employment_type":null,"co_applicant_occupation":null,"template":"income_single_applicant","document_variant":"cpf_contribution_history","statement_reference":"CPF-2025-STM-00841","statement_period":"01 Jan 2024 - 31 Dec 2024","date_of_issue":"27 March 2025","total_ordinary_wages":74400.00,"total_additional_wages":12400.00,"total_gross_income":86800.00,"average_monthly_income":7233.33,"cpf_medisave_contribution":null,"business_entity":null,"business_uen":null,"years_in_operation":null,"net_self_employed_income":null}',
    '2026-03-20 14:20:00'
),

-- -----------------------------------------------------------------------
-- Doc 4: Aaron Tan HFE letter (App 2002)
-- Source PDF: hfe_1_aaron_tan.pdf
-- HFE Reference: 25189218A | Valid until: 30 Sep 2025
-- Income exceeded 4-Room SSC ceiling — only 3-Room approved.
-- -----------------------------------------------------------------------
(
    4,
    2002,
    'hfe',
    '/data/documents/hfe_1_aaron_tan.pdf',
    'processed',
    '{"main_applicant_name":"AARON TAN WEI MING","main_applicant_nric":"S8501234A","main_applicant_role":"Main Applicant","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_role":null,"template":"hfe_single_applicant","hfe_reference_no":"25189218A","mydoc_reference_no":"20250101-153001-8501234A","date_of_issue":"01 January 2025","valid_until":"30 September 2025","eligible_flat_types":"3-Room, 4-Room","application_scheme":"Single Singapore Citizen (SSC) Scheme","hdb_loan_ceiling":180000,"total_household_income":7233.33,"assessment_outcome":"ELIGIBLE (3-Room)","total_grants_eligible":55000}',
    '2026-03-20 14:22:00'
),

-- -----------------------------------------------------------------------
-- Doc 5: Sam Yee CPF contribution history (App 2003)
-- Source PDF: income_doc_6_sam_yee.pdf
-- Avg monthly: $2,673.70 | Period: Aug 2019 - Apr 2020
-- -----------------------------------------------------------------------
(
    5,
    2003,
    'income',
    '/data/documents/income_doc_6_sam_yee.pdf',
    'processed',
    '{"main_applicant_name":"SAM YEE","main_applicant_nric":"S9812346F","main_applicant_date_of_birth":"06 December 1989","main_applicant_nationality":"Singaporean","main_applicant_residency_status":"Citizen","main_applicant_employer_name":"DBS Bank Ltd","main_applicant_employer_uen":"196800306E","main_applicant_employment_type":"Full-Time Permanent","main_applicant_occupation":"Bank Officer","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_date_of_birth":null,"co_applicant_nationality":null,"co_applicant_residency_status":null,"co_applicant_employer_name":null,"co_applicant_employer_uen":null,"co_applicant_employment_type":null,"co_applicant_occupation":null,"template":"income_single_applicant","document_variant":"cpf_contribution_history","statement_reference":"CPF-2020-STM-09812","statement_period":"01 Aug 2019 - 30 Apr 2020","date_of_issue":"16 April 2020","total_ordinary_wages":24063.30,"total_additional_wages":0.00,"total_gross_income":24063.30,"average_monthly_income":2673.70,"cpf_medisave_contribution":null,"business_entity":null,"business_uen":null,"years_in_operation":null,"net_self_employed_income":null}',
    '2025-11-18 13:42:00'
),

-- -----------------------------------------------------------------------
-- Doc 6: Sam Yee HFE letter (App 2003)
-- Source PDF: hfe_6_sam_yee.pdf
-- HFE Reference: 20189812A | Valid until: 30 Sep 2020 (EXPIRED)
-- This is why application 2003 is UNSUCCESSFUL.
-- -----------------------------------------------------------------------
(
    6,
    2003,
    'hfe',
    '/data/documents/hfe_6_sam_yee.pdf',
    'processed',
    '{"main_applicant_name":"SAM YEE","main_applicant_nric":"S9812346F","main_applicant_role":"Main Applicant","co_applicant_name":null,"co_applicant_nric":null,"co_applicant_role":null,"template":"hfe_single_applicant","hfe_reference_no":"20189812A","mydoc_reference_no":"20200416-160001-9812346F","date_of_issue":"16 April 2020","valid_until":"30 September 2020","eligible_flat_types":"4-Room, 5-Room","application_scheme":"Public Scheme (Married Couple)","hdb_loan_ceiling":385000,"total_household_income":2673.70,"assessment_outcome":"ELIGIBLE (4-Room and 5-Room)","total_grants_eligible":130000}',
    '2025-11-18 13:45:00'
);
