"""
OCR microservice for HDB document processing.

Accepts PDF uploads and extracts structured fields from:
  - CPF Income Statements  (CENTRAL PROVIDENT FUND BOARD)
  - HDB HFE Letters        (HDB Flat Eligibility Letter)

Runs inside Docker — Tesseract and Poppler are installed in the container.

Endpoints:
    POST /extract          — auto-detect doc type and extract fields
    GET  /health           — health check

Run locally via Docker:
    docker build -f Dockerfile.ocr -t ocr-service .
    docker run -p 5050:5050 ocr-service

    curl -F "file=@income_doc_1_aaron_tan.pdf" http://localhost:5050/extract
    curl -F "file=@hfe_1_aaron_tan.pdf"        http://localhost:5050/extract
"""

import re

import pytesseract
from flask import Flask, jsonify, request
from pdf2image import convert_from_bytes
from PIL import Image, ImageFilter

app = Flask(__name__)

# ─── PDF → text ───────────────────────────────────────────────────────────────

def _preprocess(img: Image.Image) -> Image.Image:
    """Greyscale + sharpen for better Tesseract accuracy on printed documents."""
    return img.convert("L").filter(ImageFilter.SHARPEN)


def pdf_bytes_to_text(pdf_bytes: bytes, dpi: int = 200) -> str:
    """200 DPI is sufficient for clean printed PDFs and is ~2x faster than 300."""
    images = convert_from_bytes(pdf_bytes, dpi=dpi)
    return "\n\n".join(
        pytesseract.image_to_string(_preprocess(img), lang="eng")
        for img in images
    )


# ─── Regex helpers ────────────────────────────────────────────────────────────

def _find(pattern: str, text: str, flags: int = re.IGNORECASE) -> str | None:
    m = re.search(pattern, text, flags)
    return m.group(1).strip() if m else None


def _find_money(pattern: str, text: str) -> float | None:
    raw = _find(pattern, text)
    if not raw:
        return None
    try:
        return float(re.sub(r"[^\d.]", "", raw))
    except ValueError:
        return None


# ─── Income document ──────────────────────────────────────────────────────────

def extract_income(text: str) -> dict:
    """
    Extract fields from a CPF Contribution History income statement.

    Key fields consumed by backend services:
      - average_monthly_income  → Eligibility Service income ceiling check
      - nric, full_name         → identity cross-check with MyInfo
      - employer_name/uen       → CPF Board API verification
    """
    employer_raw = _find(
        r"Employer Name[:\s\n]+(.+?)(?:\s{2,}|Employer UEN|\n\n)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    return {
        # Identity
        "full_name":              _find(r"Full Name[:\s]+([A-Z][A-Z ]+?)(?:\s{2,}|Statement)", text),
        "nric":                   _find(r"NRIC(?:\s+Number)?[:\s]+([A-Z]\d{7}[A-Z])", text),
        "date_of_birth":          _find(r"Date of Birth[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
        "nationality":            _find(r"Nationality[:\s]+(\w+)", text),
        "residency_status":       _find(r"Residency Status[:\s]+(\w+)", text),
        # Employer
        "employer_name":          " ".join(employer_raw.split()) if employer_raw else None,
        "employer_uen":           _find(r"Employer UEN[:\s]+(\w+)", text),
        "employment_type":        _find(r"Employment Type[:\s]+(.+?)(?:\s{2,}|Occupation|\n)", text),
        "occupation":             _find(r"Occupation[:\s]+(.+?)(?:\n|$)", text),
        # Income
        "total_ordinary_wages":   _find_money(r"Total Ordinary Wages[^:]*:\s+S\$\s*([\d,]+\.\d{2})", text),
        "total_additional_wages": _find_money(r"Total Additional Wages[^:]*:\s+S\$\s*([\d,]+\.\d{2})", text),
        "total_gross_income":     _find_money(r"TOTAL GROSS INCOME[^:]*:\s+S\$\s*([\d,]+\.\d{2})", text),
        "average_monthly_income": _find_money(r"Average Monthly Income[^:]*:\s+S\$\s*([\d,]+\.\d{2})", text),
        # Document meta
        "statement_reference":    _find(r"Statement Reference[:\s]+(CPF-[\w-]+)", text),
        "statement_period":       _find(r"Statement Period[:\s]+([\w\s\u2013\-]+?)(?:\n|$)", text),
        "date_of_issue":          _find(r"Date of Issue[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
    }


# ─── HFE letter ───────────────────────────────────────────────────────────────

def _extract_applicants(text: str) -> list[dict]:
    """
    Parse applicant blocks from an HFE letter line by line.
    Returns a list — 1 entry for single applicants, 2 for couples.
    Avoids regex backtracking on large multi-page text.
    """
    applicants = []
    lines = text.splitlines()

    i = 0
    while i < len(lines):
        # Look for "Applicant N Name: FULL NAME"
        name_match = re.match(r"Applicant\s+(\d+)\s+Name[:\s]+([A-Z][A-Z ]+)", lines[i], re.IGNORECASE)
        if name_match:
            applicant_num = int(name_match.group(1))
            name = name_match.group(2).strip()
            nric = None
            role = None

            # Scan the next 10 lines for NRIC and Role
            for j in range(i + 1, min(i + 10, len(lines))):
                if not nric:
                    nric_match = re.search(r"NRIC/UIN No\.?\s+([A-Z]\d{7}[A-Z])", lines[j], re.IGNORECASE)
                    if nric_match:
                        nric = nric_match.group(1).strip()
                if not role:
                    role_match = re.match(r"Role[:\s]+(.+)", lines[j], re.IGNORECASE)
                    if role_match:
                        role = role_match.group(1).strip()
                if nric and role:
                    break

            if nric:  # only add if we at least found the NRIC
                applicants.append({
                    "applicant_number": applicant_num,
                    "name":             name,
                    "nric":             nric,
                    "role":             role,
                })
        i += 1

    return applicants


def extract_hfe(text: str) -> dict:
    """
    Extract fields from an HDB HFE Letter.

    Key fields consumed by backend services:
      - hfe_reference_no, valid_until  → HFE Service validation
      - eligible_flat_types            → BTO application gate
      - total_household_income         → Eligibility Service
      - total_grants_eligible          → Notification / payment calculations
    """
    return {
        # Applicants (1 for single, 2 for couple)
        "applicants":             _extract_applicants(text),
        # Letter meta
        "hfe_reference_no":       _find(r"HFE Reference No\.?\s*[:\s]+(\w+)", text),
        "mydoc_reference_no":     _find(r"MyDoc Reference No\.?\s*[:\s]+(\S+)", text),
        "date_of_issue":          _find(r"Date of Issue[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
        "valid_until":            _find(r"[Vv]alid until\s+(\d{1,2}\s+\w+\s+\d{4})", text),
        # Eligibility
        "eligible_flat_types":    _find(r"Eligible Flat Type\(s\)[:\s]+(.+?)(?:\n|Application Scheme)", text),
        "application_scheme":     _find(r"Application Scheme[:\s]+(.+?)(?:\n|HDB Loan)", text),
        "hdb_loan_ceiling":       _find_money(r"HDB Loan Ceiling[:\s]+S\$\s*([\d,]+)", text),
        # Income
        "total_household_income": _find_money(r"Total Household Monthly Income\s+([\d,]+\.\d{2})", text),
        # Assessment
        "assessment_outcome":     _find(r"Assessment Outcome\s+(.+?)(?:\n|Housing)", text),
        # Grants
        "total_grants_eligible":  _find_money(r"Total Grants Eligible[:\s]+Up to S\$\s*([\d,]+)", text),
    }


# ─── Document type detection ─────────────────────────────────────────────────

def detect_doc_type(text: str) -> str:
    if re.search(r"CPF CONTRIBUTION HISTORY", text, re.IGNORECASE):
        return "income"
    if re.search(r"HDB Flat Eligibility", text, re.IGNORECASE):
        return "hfe"
    return "unknown"


# ─── Flask routes ─────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ocr"})


@app.route("/debug", methods=["POST"])
def debug():
    """Returns the raw OCR text — useful for checking what Tesseract actually read."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400
    pdf_bytes = request.files["file"].read()
    try:
        text = pdf_bytes_to_text(pdf_bytes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"raw_text": text})


@app.route("/extract", methods=["POST"])
def extract():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send a PDF as form-data field 'file'."}), 400

    uploaded = request.files["file"]
    if not uploaded.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    pdf_bytes = uploaded.read()

    try:
        text = pdf_bytes_to_text(pdf_bytes)
    except Exception as e:
        return jsonify({"error": f"Failed to process PDF: {str(e)}"}), 500

    doc_type = detect_doc_type(text)

    if doc_type == "income":
        fields = extract_income(text)
    elif doc_type == "hfe":
        fields = extract_hfe(text)
    else:
        return jsonify({
            "error": "Could not identify document type. Expected CPF income statement or HFE letter."
        }), 422

    return jsonify({
        "doc_type": doc_type,
        "source":   uploaded.filename,
        "fields":   fields,
    })


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=False)
