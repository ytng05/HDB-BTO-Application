"""
Generate test PDF documents for 5 BTO application scenarios.

Each scenario produces two PDFs:
  - An income document  (CPF Contribution History or Joint Income Statement)
  - An HFE letter       (HDB Flat Eligibility Letter)

The text content is aligned exactly to the regex patterns used by
documents.py (detect_doc_type / extract_income / extract_hfe /
normalize_income_result / normalize_hfe_result) so that the Document
Service can extract all required fields without OCR.

Scenarios
---------
1  LENA ONG + SARAH LIM      Couple   2-Room  PASS   co-applicant present, valid HFE
2  RYAN TAN + SARAH LIM      Couple   4-Room  PASS   combined income < ceiling, valid HFE
3  DANIEL GOH + MARCUS LIM   Couple   3-Room  FAIL   income rose to $8,500 after HFE issued at $6,500
4  JASMINE TAN + MARCUS LIM  Couple   4-Room  FAIL   HFE expired June 2024
5  WENDY CHEN + RYAN TAN     Couple   4-Room  FAIL   4-Room not in HFE eligible list
"""

import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm

OUT_DIR = os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------------------
# Low-level helper
# ---------------------------------------------------------------------------

def make_pdf(filename: str, lines: list[str]) -> str:
    """Write a simple single-column PDF with the given text lines."""
    path = os.path.join(OUT_DIR, filename)
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    x = 2 * cm
    y = height - 2 * cm
    line_height = 14  # points

    for line in lines:
        if y < 2 * cm:        # start a new page when near the bottom
            c.showPage()
            y = height - 2 * cm

        if line == "---PAGE---":
            c.showPage()
            y = height - 2 * cm
            continue

        # Section headers rendered bold
        if line.isupper() and len(line) > 4:
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFont("Helvetica", 10)

        c.drawString(x, y, line)
        y -= line_height

    c.save()
    print(f"  Written: {filename}")
    return path


# ---------------------------------------------------------------------------
# Income document templates
# ---------------------------------------------------------------------------

def cpf_contribution_history(
    filename: str,
    full_name: str,
    nric: str,
    dob: str,
    nationality: str,
    residency_status: str,
    employer_name: str,
    employer_uen: str,
    employment_type: str,
    occupation: str,
    ordinary_wages: float,
    additional_wages: float,
    statement_ref: str,
    statement_period: str,
    date_of_issue: str,
) -> str:
    """Single-applicant CPF Contribution History income document."""
    total_gross = ordinary_wages + additional_wages
    avg_monthly = total_gross / 12

    lines = [
        "CENTRAL PROVIDENT FUND BOARD",
        "CPF CONTRIBUTION HISTORY",
        "",
        "PERSONAL DETAILS",
        f"Full Name (as per NRIC): {full_name}",
        f"NRIC: {nric}",
        f"Date of Birth: {dob}",
        f"Nationality: {nationality}",
        f"Residency Status: {residency_status}",
        "",
        "EMPLOYER DETAILS",
        f"Employer Name: {employer_name}",
        f"Employer UEN: {employer_uen}",
        f"Employment Type: {employment_type}",
        f"Occupation: {occupation}",
        "",
        "INCOME SUMMARY",
        f"Statement Reference: {statement_ref}",
        f"Statement Period: {statement_period}",
        f"Date of Issue: {date_of_issue}",
        "",
        f"Total Ordinary Wages: S$ {ordinary_wages:,.2f}",
        f"Total Additional Wages: S$ {additional_wages:,.2f}",
        f"TOTAL GROSS INCOME: S$ {total_gross:,.2f}",
        f"Average Monthly Gross Income: S$ {avg_monthly:,.2f}",
        "",
        "This statement is issued by the Central Provident Fund Board.",
        "It is for use in HDB flat application processes.",
    ]
    return make_pdf(filename, lines)


def joint_income_statement(
    filename: str,
    main_name: str,
    main_nric: str,
    main_dob: str,
    main_nationality: str,
    main_employer: str,
    main_employment_type: str,
    main_occupation: str,
    main_annual_gross: float,
    co_name: str,
    co_nric: str,
    co_dob: str,
    co_nationality: str,
    co_employer: str,
    co_employment_type: str,
    co_occupation: str,
    co_annual_gross: float,
    statement_ref: str,
    statement_period: str,
    date_of_issue: str,
) -> str:
    """Joint household income statement for a couple."""
    main_monthly = main_annual_gross / 12
    co_monthly   = co_annual_gross / 12
    combined_annual  = main_annual_gross + co_annual_gross
    combined_monthly = combined_annual / 12

    lines = [
        "JOINT INCOME STATEMENT",
        "JOINT HOUSEHOLD INCOME DECLARATION FOR HDB BTO APPLICATION",
        "",
        f"Application Ref: {statement_ref}",
        f"Date of Issue: {date_of_issue}",
        "",
        "APPLICANT 1",
        f"Full Name: {main_name}",
        f"NRIC: {main_nric}",
        f"Date of Birth: {main_dob}",
        f"Nationality: {main_nationality}",
        f"Employer: {main_employer}",
        f"Employment Type: {main_employment_type}",
        f"Designation: {main_occupation}",
        f"Applicant 1 Annual Gross Income: S$ {main_annual_gross:,.2f}",
        "",
        "APPLICANT 1 - MONTHLY INCOME",
        f"Bank Account (Applicant 1): Average Monthly Gross: S$ {main_monthly:,.2f}",
        "",
        "APPLICANT 2",
        f"Full Name: {co_name}",
        f"NRIC: {co_nric}",
        f"Date of Birth: {co_dob}",
        f"Nationality: {co_nationality}",
        f"Employer: {co_employer}",
        f"Employment Type: {co_employment_type}",
        f"Designation: {co_occupation}",
        f"Applicant 2 Annual Gross Income: S$ {co_annual_gross:,.2f}",
        "",
        "APPLICANT 2 - MONTHLY INCOME",
        f"Bank Account (Applicant 2): Average Monthly Gross: S$ {co_monthly:,.2f}",
        "",
        "JOINT HOUSEHOLD INCOME SUMMARY",
        f"Statement Period: MONTHLY INCOME ({statement_period})",
        f"COMBINED ANNUAL GROSS INCOME: S$ {combined_annual:,.2f}",
        f"COMBINED AVERAGE MONTHLY GROSS: S$ {combined_monthly:,.2f}",
        "",
        "This joint income statement is issued for HDB BTO application purposes.",
    ]
    return make_pdf(filename, lines)


# ---------------------------------------------------------------------------
# HFE letter templates
# ---------------------------------------------------------------------------

def hfe_single(
    filename: str,
    applicant_name: str,
    applicant_nric: str,
    hfe_ref: str,
    mydoc_ref: str,
    date_of_issue: str,
    valid_until: str,
    eligible_flat_types: str,
    application_scheme: str,
    hdb_loan_ceiling: int,
    total_household_income: float,
    assessment_outcome: str,
    total_grants: int,
) -> str:
    lines = [
        "Housing & Development Board",
        "HDB Flat Eligibility (HFE) Letter",
        "",
        "APPLICANT DETAILS",
        f"Applicant 1 Name: {applicant_name}",
        f"NRIC/UIN No.: {applicant_nric}",
        f"Role: Main Applicant",
        "",
        "HFE DETAILS",
        f"HFE Reference No.: {hfe_ref}",
        f"MyDoc Reference No.: {mydoc_ref}",
        f"Date of Issue: {date_of_issue}",
        f"Valid until {valid_until}",
        "",
        "ELIGIBILITY ASSESSMENT",
        f"Eligible Flat Type(s): {eligible_flat_types}",
        f"Application Scheme: {application_scheme}",
        f"HDB Loan Ceiling: S$ {hdb_loan_ceiling:,}",
        f"Total Household Income: S$ {total_household_income:,.2f}",
        f"Assessment Outcome: {assessment_outcome}",
        f"Total Grants Eligible: S$ {total_grants:,}",
        "",
        "This HFE letter is issued by the Housing & Development Board.",
        "Please retain this letter for your BTO application.",
    ]
    return make_pdf(filename, lines)


def hfe_couple(
    filename: str,
    main_name: str,
    main_nric: str,
    co_name: str,
    co_nric: str,
    hfe_ref: str,
    mydoc_ref: str,
    date_of_issue: str,
    valid_until: str,
    eligible_flat_types: str,
    application_scheme: str,
    hdb_loan_ceiling: int,
    total_household_income: float,
    assessment_outcome: str,
    total_grants: int,
) -> str:
    lines = [
        "Housing & Development Board",
        "HDB Flat Eligibility (HFE) Letter",
        "",
        "APPLICANT DETAILS",
        f"Applicant 1 Name: {main_name}",
        f"NRIC/UIN No.: {main_nric}",
        f"Role: Main Applicant",
        "",
        f"Applicant 2 Name: {co_name}",
        f"NRIC/UIN No.: {co_nric}",
        f"Role: Co-Applicant (Spouse)",
        "",
        "HFE DETAILS",
        f"HFE Reference No.: {hfe_ref}",
        f"MyDoc Reference No.: {mydoc_ref}",
        f"Date of Issue: {date_of_issue}",
        f"Valid until {valid_until}",
        "",
        "ELIGIBILITY ASSESSMENT",
        f"Eligible Flat Type(s): {eligible_flat_types}",
        f"Application Scheme: {application_scheme}",
        f"HDB Loan Ceiling: S$ {hdb_loan_ceiling:,}",
        f"Total Household Income: S$ {total_household_income:,.2f}",
        f"Assessment Outcome: {assessment_outcome}",
        f"Total Grants Eligible: S$ {total_grants:,}",
        "",
        "This HFE letter is issued by the Housing & Development Board.",
        "Please retain this letter for your BTO application.",
    ]
    return make_pdf(filename, lines)


# ---------------------------------------------------------------------------
# Generate all 5 scenarios
# ---------------------------------------------------------------------------

def main():
    print("Generating test scenario PDFs...\n")

    # -----------------------------------------------------------------------
    # Scenario 1: LENA ONG + SARAH LIM — Couple, 2-Room Flexi, PASS
    # Combined income $5,500/month < $7,000 ceiling. HFE valid until Dec 2026.
    # Lena $5,000/month + Sarah $500/month = $5,500/month combined.
    # -----------------------------------------------------------------------
    print("Scenario 1: Lena Ong + Sarah Lim — Couple, 2-Room Flexi, PASS")
    joint_income_statement(
        filename="scenario_1_lena_ong_income.pdf",
        main_name="LENA ONG JIA HUI",
        main_nric="S9401234L",
        main_dob="15 June 1994",
        main_nationality="Singapore Citizen",
        main_employer="Shopee Singapore Pte Ltd",
        main_employment_type="Full-Time Permanent",
        main_occupation="Product Manager",
        main_annual_gross=60_000.00,
        co_name="SARAH LIM MEI YEN",
        co_nric="S9601234S",
        co_dob="10 August 1996",
        co_nationality="Singapore Citizen",
        co_employer="Ministry of Education",
        co_employment_type="Part-Time",
        co_occupation="Relief Teacher",
        co_annual_gross=6_000.00,
        statement_ref="HDB-BTO-2026-03-00101",
        statement_period="JAN 2025 - DEC 2025",
        date_of_issue="05 March 2026",
    )
    hfe_couple(
        filename="scenario_1_lena_ong_hfe.pdf",
        main_name="LENA ONG JIA HUI",
        main_nric="S9401234L",
        co_name="SARAH LIM MEI YEN",
        co_nric="S9601234S",
        hfe_ref="26100001L",
        mydoc_ref="20260115-090000-9401234L",
        date_of_issue="15 January 2026",
        valid_until="31 December 2026",
        eligible_flat_types="2-Room Flexi",
        application_scheme="Public Scheme (Married Couple / Singapore Citizen)",
        hdb_loan_ceiling=120_000,
        total_household_income=5_500.00,
        assessment_outcome="ELIGIBLE",
        total_grants=55_000,
    )

    # -----------------------------------------------------------------------
    # Scenario 2: RYAN TAN + SARAH LIM — Couple, 4-Room, PASS
    # Combined income $9,800/month < $14,000 ceiling. HFE valid Dec 2026.
    # -----------------------------------------------------------------------
    print("\nScenario 2: Ryan Tan + Sarah Lim — Couple, 4-Room, PASS")
    joint_income_statement(
        filename="scenario_2_ryan_sarah_income.pdf",
        main_name="RYAN TAN JIAN HUI",
        main_nric="S9501234R",
        main_dob="22 March 1995",
        main_nationality="Singapore Citizen",
        main_employer="DBS Bank Ltd",
        main_employment_type="Full-Time Permanent",
        main_occupation="Senior Analyst",
        main_annual_gross=72_000.00,
        co_name="SARAH LIM MEI YEN",
        co_nric="S9601234S",
        co_dob="10 August 1996",
        co_nationality="Singapore Citizen",
        co_employer="Singapore General Hospital",
        co_employment_type="Full-Time Permanent",
        co_occupation="Staff Nurse",
        co_annual_gross=45_600.00,
        statement_ref="HDB-BTO-2026-01-00123",
        statement_period="JAN 2025 - DEC 2025",
        date_of_issue="10 March 2026",
    )
    hfe_couple(
        filename="scenario_2_ryan_sarah_hfe.pdf",
        main_name="RYAN TAN JIAN HUI",
        main_nric="S9501234R",
        co_name="SARAH LIM MEI YEN",
        co_nric="S9601234S",
        hfe_ref="26200002R",
        mydoc_ref="20260115-100000-9501234R",
        date_of_issue="15 January 2026",
        valid_until="31 December 2026",
        eligible_flat_types="4-Room, 5-Room",
        application_scheme="Public Scheme (Married Couple / Singapore Citizen)",
        hdb_loan_ceiling=270_000,
        total_household_income=9_800.00,
        assessment_outcome="ELIGIBLE",
        total_grants=80_000,
    )

    # -----------------------------------------------------------------------
    # Scenario 3: DANIEL GOH + MARCUS LIM — Couple, 3-Room, FAIL (income ceiling)
    # HFE was issued when income was $6,500/month (within $7,000 ceiling).
    # Current income document shows $8,500/month — ceiling now breached at application time.
    # -----------------------------------------------------------------------
    print("\nScenario 3: Daniel Goh + Marcus Lim — Couple, 3-Room, FAIL (income exceeds ceiling)")
    joint_income_statement(
        filename="scenario_3_daniel_goh_income.pdf",
        main_name="DANIEL GOH WEI MING",
        main_nric="S8901234D",
        main_dob="03 November 1989",
        main_nationality="Singapore Citizen",
        main_employer="Accenture Pte Ltd",
        main_employment_type="Full-Time Permanent",
        main_occupation="IT Consultant",
        main_annual_gross=96_000.00,
        co_name="MARCUS LIM CHENG WEI",
        co_nric="S9101234M",
        co_dob="27 July 1991",
        co_nationality="Singapore Citizen",
        co_employer="Freelance",
        co_employment_type="Contract",
        co_occupation="Graphic Designer",
        co_annual_gross=6_000.00,
        statement_ref="HDB-BTO-2026-03-00303",
        statement_period="JAN 2025 - DEC 2025",
        date_of_issue="05 March 2026",
    )
    hfe_couple(
        filename="scenario_3_daniel_goh_hfe.pdf",
        main_name="DANIEL GOH WEI MING",
        main_nric="S8901234D",
        co_name="MARCUS LIM CHENG WEI",
        co_nric="S9101234M",
        hfe_ref="26300003D",
        mydoc_ref="20260115-110000-8901234D",
        date_of_issue="15 January 2026",
        valid_until="31 December 2026",
        eligible_flat_types="3-Room",
        application_scheme="Public Scheme (Married Couple / Singapore Citizen)",
        hdb_loan_ceiling=180_000,
        total_household_income=6_500.00,   # income at time of HFE — within $7,000 ceiling
        assessment_outcome="ELIGIBLE",
        total_grants=35_000,
    )

    # -----------------------------------------------------------------------
    # Scenario 4: JASMINE TAN + MARCUS LIM — Couple, 4-Room, FAIL (HFE expired)
    # HFE valid_until = 30 June 2024 (expired). Income is fine.
    # -----------------------------------------------------------------------
    print("\nScenario 4: Jasmine Tan + Marcus Lim — Couple, 4-Room, FAIL (expired HFE)")
    joint_income_statement(
        filename="scenario_4_jasmine_marcus_income.pdf",
        main_name="JASMINE TAN SHU MIN",
        main_nric="S9001234J",
        main_dob="18 February 1990",
        main_nationality="Singapore Citizen",
        main_employer="OCBC Bank",
        main_employment_type="Full-Time Permanent",
        main_occupation="Relationship Manager",
        main_annual_gross=84_000.00,
        co_name="MARCUS LIM CHENG WEI",
        co_nric="S9101234M",
        co_dob="27 July 1991",
        co_nationality="Singapore Citizen",
        co_employer="Grab Holdings Pte Ltd",
        co_employment_type="Full-Time Permanent",
        co_occupation="Software Engineer",
        co_annual_gross=48_000.00,
        statement_ref="HDB-BTO-2024-06-00456",
        statement_period="JAN 2024 - DEC 2024",
        date_of_issue="15 January 2024",
    )
    hfe_couple(
        filename="scenario_4_jasmine_marcus_hfe.pdf",
        main_name="JASMINE TAN SHU MIN",
        main_nric="S9001234J",
        co_name="MARCUS LIM CHENG WEI",
        co_nric="S9101234M",
        hfe_ref="24400004J",
        mydoc_ref="20231115-120000-9001234J",
        date_of_issue="15 November 2023",
        valid_until="30 June 2024",      # EXPIRED — today is April 2026
        eligible_flat_types="4-Room, 5-Room",
        application_scheme="Public Scheme (Married Couple / Singapore Citizen)",
        hdb_loan_ceiling=270_000,
        total_household_income=11_000.00,
        assessment_outcome="ELIGIBLE",
        total_grants=80_000,
    )

    # -----------------------------------------------------------------------
    # Scenario 5: WENDY CHEN + RYAN TAN — Couple, 4-Room, FAIL (flat type not in HFE)
    # HFE only approves 2-Room Flexi and 3-Room. The household applies for 4-Room.
    # -----------------------------------------------------------------------
    print("\nScenario 5: Wendy Chen + Ryan Tan — Couple, 4-Room, FAIL (flat type not in HFE)")
    joint_income_statement(
        filename="scenario_5_wendy_chen_income.pdf",
        main_name="WENDY CHEN XIN HUI",
        main_nric="S9201234W",
        main_dob="09 April 1992",
        main_nationality="Singapore Citizen",
        main_employer="Mediacorp Pte Ltd",
        main_employment_type="Full-Time Permanent",
        main_occupation="Content Producer",
        main_annual_gross=44_400.00,
        co_name="RYAN TAN JIAN HUI",
        co_nric="S9501234R",
        co_dob="22 March 1995",
        co_nationality="Singapore Citizen",
        co_employer="Freelance",
        co_employment_type="Part-Time",
        co_occupation="Freelance Consultant",
        co_annual_gross=6_000.00,
        statement_ref="HDB-BTO-2026-03-00505",
        statement_period="JAN 2025 - DEC 2025",
        date_of_issue="05 March 2026",
    )
    hfe_couple(
        filename="scenario_5_wendy_chen_hfe.pdf",
        main_name="WENDY CHEN XIN HUI",
        main_nric="S9201234W",
        co_name="RYAN TAN JIAN HUI",
        co_nric="S9501234R",
        hfe_ref="26500005W",
        mydoc_ref="20260115-140000-9201234W",
        date_of_issue="15 January 2026",
        valid_until="31 December 2026",
        eligible_flat_types="2-Room Flexi, 3-Room",  # 4-Room is NOT included
        application_scheme="Public Scheme (Married Couple / Singapore Citizen)",
        hdb_loan_ceiling=135_000,
        total_household_income=4_200.00,
        assessment_outcome="ELIGIBLE",
        total_grants=55_000,
    )

    print("\nDone! All 10 PDFs written to:", OUT_DIR)


if __name__ == "__main__":
    main()
