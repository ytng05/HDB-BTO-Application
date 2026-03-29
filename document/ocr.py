"""OCR service for income statements and HFE letters."""

import re

try:
    import pymupdf as fitz  # PyMuPDF
except ImportError:
    import fitz  # type: ignore[no-redef]

import pytesseract
from flask import Flask, jsonify, request
from flask_cors import CORS
from flasgger import Swagger
from pdf2image import convert_from_bytes
from PIL import Image, ImageFilter

app = Flask(__name__)
CORS(app)

app.config['SWAGGER'] = {
    'title': 'OCR Service API',
    'version': 1.0,
    'openapi': '3.0.2',
    'description': 'Extracts structured fields from income PDFs and HFE letters'
}
swagger = Swagger(app)


def _preprocess(img: Image.Image) -> Image.Image:
    """Improve OCR accuracy for scanned PDFs."""
    return img.convert("L").point(lambda p: 255 if p > 180 else 0).filter(ImageFilter.SHARPEN)


def _normalize_text(text: str) -> str:
    text = text.replace("\r", "\n").replace("\xa0", " ")
    text = text.replace("â€“", "-").replace("â€”", "-")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _looks_like_usable_text(text: str) -> bool:
    stripped = text.strip()
    if len(stripped) < 80:
        return False

    alpha_count = sum(ch.isalpha() for ch in stripped)
    return alpha_count >= 40


def pdf_bytes_to_text(pdf_bytes: bytes, dpi: int = 200) -> str:
    """Extract text from a PDF with OCR fallback for scanned pages."""
    direct_text = ""

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        direct_text = "\n\n".join(page.get_text() for page in doc)
        doc.close()
        direct_text = _normalize_text(direct_text)
        if _looks_like_usable_text(direct_text):
            return direct_text
    except Exception:
        pass

    images = convert_from_bytes(pdf_bytes, dpi=dpi)
    ocr_text = "\n\n".join(
        pytesseract.image_to_string(_preprocess(img), lang="eng")
        for img in images
    )
    ocr_text = _normalize_text(ocr_text)

    if _looks_like_usable_text(ocr_text):
        return ocr_text

    return direct_text or ocr_text


def _find(pattern: str, text: str, flags: int = re.IGNORECASE) -> str | None:
    match = re.search(pattern, text, flags)
    return match.group(1).strip() if match else None


def _find_money(pattern: str, text: str) -> float | None:
    raw = _find(pattern, text)
    if not raw:
        return None

    try:
        return float(re.sub(r"[^\d.]", "", raw))
    except ValueError:
        return None


def _next_non_empty_line(lines: list[str], start_index: int) -> tuple[str | None, int]:
    for idx in range(start_index, len(lines)):
        value = lines[idx].strip()
        if value:
            return value, idx
    return None, start_index


def _find_multiline_value(pattern: str, text: str, flags: int = re.IGNORECASE) -> str | None:
    """Extract a value that may span multiple lines after a label."""
    match = re.search(pattern, text, flags)
    if not match:
        return None

    value = match.group(1).strip()
    value = re.sub(r"\s*\n\s*", " ", value)
    value = re.sub(r"\s{2,}", " ", value)
    return value or None


def extract_standard_income(text: str) -> dict:
    employer_raw = (
        _find_multiline_value(
            r"Employer(?: Name)?[:\s]*(.+?)(?:\n(?:Employer UEN|Employment Type|Designation|Occupation|Years of Service)|$)",
            text,
            re.IGNORECASE | re.DOTALL,
        )
        or _find(r"Employment Income\s*\(([^)]+)\)", text)
    )

    full_name = _find_multiline_value(
        r"(?:Full Name(?: \(as per NRIC\))?|Employee Name)[:\s]*(.+?)(?:\n(?:Application Ref(?:erence)?(?: No\.?)?|NRIC|Date of Birth|Date of Issue|Employer|Designation)|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    total_gross = (
        _find_money(r"TOTAL GROSS INCOME[^:]*:\s+S?\$?\s*([\d,]+\.?\d*)", text)
        or _find_money(r"TOTAL INCOME[:\s]+([\d,]+\.?\d*)", text)
        or _find_money(r"Total Gross Revenue.*?:\s+S?\$?\s*([\d,]+\.?\d*)", text)
    )

    avg_monthly = (
        _find_money(r"Average Monthly(?:\s+Gross)?\s+Income[^:]*:\s+S?\$?\s*([\d,]+\.?\d*)", text)
        or _find_money(r"Average Monthly Gross[:\s]+S?\$?\s*([\d,]+\.?\d*)", text)
        or _find_money(r"Average Monthly Net Income[:\s]+S?\$?\s*([\d,]+\.?\d*)", text)
    )

    doc_ref = (
        _find(r"Statement Reference[:\s]+(CPF-[\w-]+)", text)
        or _find(r"(?:Document Ref|NOA Reference|Application Ref(?:erence)?(?: No\.?)?)[:\s]+([\w-]+)", text)
    )

    period = (
        _find(r"Statement Period[:\s]+([^\n]+)", text)
        or _find(r"Employment Period[:\s]+([^\n]+)", text)
        or _find(r"Year of Assessment[:\s]+(\d{4})", text)
        or _find(r"INCOME DECLARATION\s*-\s*([A-Z]{3}\s+\d{4}\s*-\s*[A-Z]{3}\s+\d{4})", text)
    )

    return {
        "document_variant": "standard_income_statement",
        "full_name": full_name,
        "nric": _find(r"NRIC(?:/UIN)?(?:\s+(?:Number|No\.?))?[:\s]+([A-Z]\d{7}[A-Z])", text),
        "date_of_birth": _find(r"Date of Birth[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
        "nationality": _find(r"Nationality[:\s]+([^\n]+)", text),
        "residency_status": _find(r"Resid(?:ency|ential)\s+Status[:\s]+([^\n]+)", text),
        "employer_name": " ".join(employer_raw.split()) if employer_raw else None,
        "employer_uen": _find(r"Employer UEN[:\s]+(\w+)", text),
        "employment_type": _find(r"Employment Type[:\s]+([^\n]+)", text),
        "occupation": _find(r"(?:Occupation|Designation)[:\s]+([^\n]+)", text),
        "total_ordinary_wages": _find_money(r"Total Ordinary Wages[^:]*:\s+S?\$?\s*([\d,]+\.\d{2})", text),
        "total_additional_wages": _find_money(r"Total Additional Wages[^:]*:\s+S?\$?\s*([\d,]+\.\d{2})", text),
        "total_gross_income": total_gross,
        "average_monthly_income": avg_monthly,
        "statement_reference": doc_ref,
        "statement_period": period,
        "date_of_issue": _find(r"Date of Issue[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
    }


def extract_self_employed_income(text: str) -> dict:
    return {
        "document_variant": "self_employed_income_declaration",
        "full_name": _find_multiline_value(
            r"Full Name \(as per NRIC\)[:\s]*(.+?)(?:\n(?:Application Ref(?: No\.?)?|NRIC Number|Date of Submission)|$)",
            text,
            re.IGNORECASE | re.DOTALL,
        ),
        "nric": _find(r"NRIC(?: Number)?[:\s]+([A-Z]\d{7}[A-Z])", text),
        "date_of_birth": _find(r"Date of Birth[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
        "residency_status": _find(r"Residential Status[:\s]+([^\n]+)", text),
        "employment_type": "Self-Employed",
        "occupation": _find_multiline_value(
            r"Nature of Business[:\s]*(.+?)(?:\n(?:Business Entity|UEN|Business Address)|$)",
            text,
            re.IGNORECASE | re.DOTALL,
        ),
        "business_entity": _find(r"Business Entity[:\s]+([^\n]+)", text),
        "business_uen": _find(r"UEN \(if registered\)[:\s]+([A-Z0-9]+)", text),
        "years_in_operation": _find(r"Years in Operation[:\s]+([^\n]+)", text),
        "total_gross_income": _find_money(r"Total Gross Revenue \(2024\)[:\s]+S?\$?\s*([\d,]+\.?\d*)", text),
        "total_business_expenses": _find_money(r"Total Business Expenses \(2024\)[:\s]+S?\$?\s*([\d,]+\.?\d*)", text),
        "net_self_employed_income": _find_money(r"NET SELF-EMPLOYED INCOME \(2024\)[:\s]+S?\$?\s*([\d,]+\.?\d*)", text),
        "average_monthly_income": _find_money(r"Average Monthly Net Income[:\s]+S?\$?\s*([\d,]+\.?\d*)", text),
        "statement_reference": _find(r"(?:Application Ref(?: No\.?)?|Ref)[:\s]+([\w-]+)", text),
        "statement_period": (
            _find(r"INCOME DECLARATION\s*-\s*([A-Z]{3}\s+\d{4}\s+TO\s+[A-Z]{3}\s+\d{4})", text)
            or _find(r"INCOME DECLARATION\s*-\s*([A-Z]{3}\s+\d{4}\s*-\s*[A-Z]{3}\s+\d{4})", text)
        ),
        "date_of_issue": _find(r"Date of Submission[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
        "cpf_medisave_contribution": _find_money(
            r"CPF MediSave Contribution \(2024\)[:\s]+S?\$?\s*([\d,]+\.?\d*)",
            text,
        ),
    }


def _extract_joint_income_applicants(text: str) -> list[dict]:
    applicants = []

    for applicant_number in (1, 2):
        header_pattern = rf"APPLICANT {applicant_number}.*?(?=APPLICANT {applicant_number} - MONTHLY INCOME|JOINT HOUSEHOLD INCOME SUMMARY|$)"
        block_match = re.search(header_pattern, text, re.IGNORECASE | re.DOTALL)
        if not block_match:
            continue

        block = block_match.group(0)
        annual_gross = _find_money(
            rf"Applicant {applicant_number} Annual Gross.*?:\s+S?\$?\s*([\d,]+\.?\d*)",
            text,
        )
        average_monthly = _find_money(
            rf"Bank Account \(Applicant {applicant_number}\):.*?Average Monthly Gross:\s+S?\$?\s*([\d,]+\.?\d*)",
            text,
        )

        applicants.append({
            "applicant_number": applicant_number,
            "name": _find_multiline_value(
                r"Full Name[:\s]*(.+?)(?:\n(?:Application Ref|NRIC|Date of Issue|Date of Birth|Nationality|Employer)|$)",
                block,
                re.IGNORECASE | re.DOTALL,
            ),
            "nric": _find(r"NRIC[:\s]+([A-Z]\d{7}[A-Z])", block),
            "date_of_birth": _find(r"Date of Birth[:\s]+(\d{1,2}\s+\w+\s+\d{4})", block),
            "nationality": _find(r"Nationality[:\s]+([^\n]+)", block),
            "employer_name": _find_multiline_value(
                r"Employer[:\s]*(.+?)(?:\n(?:Designation|Employment Type|Years of Service|APPLICANT \d+ - MONTHLY INCOME)|$)",
                block,
                re.IGNORECASE | re.DOTALL,
            ),
            "employment_type": _find(r"Employment Type[:\s]+([^\n]+)", block),
            "occupation": _find(r"Designation[:\s]+([^\n]+)", block),
            "annual_gross_income": annual_gross,
            "average_monthly_income": average_monthly,
        })

    return applicants


def extract_joint_income(text: str) -> dict:
    applicants = _extract_joint_income_applicants(text)
    main_applicant = applicants[0] if applicants else {}

    return {
        "document_variant": "joint_household_income_statement",
        "full_name": main_applicant.get("name"),
        "nric": main_applicant.get("nric"),
        "date_of_birth": main_applicant.get("date_of_birth"),
        "employer_name": main_applicant.get("employer_name"),
        "employment_type": main_applicant.get("employment_type"),
        "occupation": main_applicant.get("occupation"),
        "statement_reference": _find(r"(?:Application Ref|Ref)[:\s]+([\w-]+)", text),
        "statement_period": _find(r"MONTHLY INCOME \(([A-Z]{3}\s+\d{4}\s*-\s*[A-Z]{3}\s+\d{4})\)", text),
        "date_of_issue": _find(r"Date of Issue[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
        "total_gross_income": _find_money(r"COMBINED ANNUAL GROSS INCOME[:\s]+S?\$?\s*([\d,]+\.?\d*)", text),
        "average_monthly_income": _find_money(r"COMBINED AVERAGE MONTHLY GROSS[:\s]+S?\$?\s*([\d,]+\.?\d*)", text),
        "hdb_income_ceiling_status": _find_multiline_value(
            r"HDB Income Ceiling Compliance[:\s]*(.+?)(?:\n(?:This joint income statement|Housing & Development Board)|$)",
            text,
            re.IGNORECASE | re.DOTALL,
        ),
        "applicants": applicants,
    }


def extract_income(text: str) -> dict:
    """Extract fields from the supported income document variants."""
    if re.search(r"JOINT\s+INCOME\s+STATEMENT|JOINT\s+HOUSEHOLD\s+INCOME\s+DECLARATION", text, re.IGNORECASE):
        return extract_joint_income(text)

    if re.search(r"SELF-EMPLOYED\s+INCOME\s+DECLARATION|NET\s+SELF-EMPLOYED\s+INCOME", text, re.IGNORECASE):
        return extract_self_employed_income(text)

    return extract_standard_income(text)


def _extract_applicants(text: str) -> list[dict]:
    """Parse applicant blocks from an HFE letter line by line."""
    applicants = []
    lines = [line.strip() for line in text.splitlines()]
    i = 0

    while i < len(lines):
        line = lines[i]
        name_match = re.search(r"Applicant\s+(\d+)\s+Name[:\s]*(.*)", line, re.IGNORECASE)
        if not name_match:
            i += 1
            continue

        applicant_num = int(name_match.group(1))
        name = name_match.group(2).strip() or None
        nric = None
        role = None

        if not name:
            name, i = _next_non_empty_line(lines, i + 1)
            if name and re.fullmatch(r"Applicant\s+\d+", name, re.IGNORECASE):
                name, i = _next_non_empty_line(lines, i + 1)

        j = i + 1
        while j < len(lines):
            current = lines[j]
            if re.search(r"Applicant\s+\d+\s+Name", current, re.IGNORECASE):
                break
            if re.search(r"HFE\s+Reference\s+No", current, re.IGNORECASE):
                break

            if re.search(r"NRIC/UIN\s+No\.?", current, re.IGNORECASE):
                same_line = _find(r"NRIC/UIN\s+No\.?[:\s]+([A-Z]\d{7}[A-Z])", current)
                if same_line:
                    nric = same_line
                else:
                    nric, j = _next_non_empty_line(lines, j + 1)
            elif not nric and re.fullmatch(r"[A-Z]\d{7}[A-Z]", current):
                nric = current

            if re.search(r"Role[:\s]*", current, re.IGNORECASE):
                same_line = _find(r"Role[:\s]+(.+)", current)
                if same_line:
                    role = same_line
                else:
                    role, j = _next_non_empty_line(lines, j + 1)

            j += 1

        if name or nric or role:
            applicants.append({
                "applicant_number": applicant_num,
                "name": name,
                "nric": nric,
                "role": role,
            })

        i = j

    return applicants


def extract_hfe(text: str) -> dict:
    return {
        "applicants": _extract_applicants(text),
        "hfe_reference_no": _find(r"HFE\s+Reference\s+No\.?\s*[:\s]+(\S+)", text),
        "mydoc_reference_no": _find(r"MyDoc\s+Reference\s+No\.?\s*[:\s]+(\S+)", text),
        "date_of_issue": _find(r"Date\s+of\s+Issue[:\s]+(\d{1,2}\s+\w+\s+\d{4})", text),
        "valid_until": _find(r"[Vv]alid\s+until\s+(\d{1,2}\s+\w+\s+\d{4})", text),
        "eligible_flat_types": _find(r"Eligible\s+Flat\s+Type[s]?\s*\([sS]\)\s*[:\s]+([^\n]+)", text),
        "application_scheme": _find(r"Application\s+Scheme[:\s]+([^\n]+)", text),
        "hdb_loan_ceiling": _find_money(r"HDB\s+Loan\s+Ceiling[:\s]+S?\$?\s*([\d,]+)", text),
        "total_household_income": _find_money(
            r"Total\s+Household\s+(?:Monthly\s+)?Income\s*[:\s]*([\d,]+\.?\d*)",
            text,
        ),
        "assessment_outcome": _find(r"Assessment\s+Outcome\s*[:\s]+([^\n]+)", text),
        "total_grants_eligible": _find_money(
            r"Total\s+Grants?\s+Eligible[:\s]+(?:Up\s+to\s+)?S?\$?\s*([\d,]+)",
            text,
        ),
    }


def detect_doc_type(text: str) -> str:
    # Check income variants first so HDB-branded income letters are not
    # mistaken for HFE letters.
    if re.search(r"JOINT\s+INCOME\s+STATEMENT|JOINT\s+HOUSEHOLD\s+INCOME\s+DECLARATION", text, re.IGNORECASE):
        return "income"
    if re.search(r"SELF-EMPLOYED\s+INCOME\s+DECLARATION|INCOME\s+DECLARATION\s+FOR\s+BTO", text, re.IGNORECASE):
        return "income"
    if re.search(r"CPF\s+CONTRIBUTION\s+HISTORY", text, re.IGNORECASE):
        return "income"
    if re.search(r"CENTRAL\s+PROVIDENT\s+FUND", text, re.IGNORECASE) and re.search(
        r"income|wages|contribution", text, re.IGNORECASE
    ):
        return "income"
    if re.search(r"EMPLOYEE\s+INCOME\s+STATEMENT", text, re.IGNORECASE):
        return "income"
    if re.search(r"PAYSLIP\s+SUMMARY", text, re.IGNORECASE):
        return "income"
    if re.search(r"NOTICE\s+OF\s+ASSESSMENT", text, re.IGNORECASE) and re.search(
        r"INLAND\s+REVENUE|IRAS", text, re.IGNORECASE
    ):
        return "income"
    if re.search(r"INLAND\s+REVENUE\s+AUTHORITY", text, re.IGNORECASE) and re.search(
        r"income|assessment", text, re.IGNORECASE
    ):
        return "income"
    if re.search(r"HDB\s+Flat\s+Eligibility\s+\(HFE\)\s+Letter", text, re.IGNORECASE):
        return "hfe"
    if re.search(r"HDB\s+Flat\s+Eligib", text, re.IGNORECASE):
        return "hfe"
    if re.search(r"HFE\s+letter", text, re.IGNORECASE):
        return "hfe"
    if re.search(r"Flat\s+Eligibility\s+(Letter|Assessment)", text, re.IGNORECASE):
        return "hfe"
    if re.search(r"HFE\s+Reference\s+No", text, re.IGNORECASE):
        return "hfe"
    if re.search(r"Housing\s+&\s+Development\s+Board", text, re.IGNORECASE) and re.search(
        r"eligible\s+flat\s+type|hdb\s+loan\s+ceiling|total\s+grants?\s+eligible|assessment\s+outcome",
        text,
        re.IGNORECASE,
    ):
        return "hfe"
    return "unknown"


@app.route("/health", methods=["GET"])
def health():
    """
    Health check
    ---
    tags:
      - OCR
    summary: Check whether the OCR service is running
    responses:
      200:
        description: Service is healthy.
    """
    return jsonify({"status": "ok", "service": "ocr"})


@app.route("/extract", methods=["POST"])
def extract():
    """
    Extract structured fields from a PDF
    ---
    tags:
      - OCR
    summary: Extract document fields from an income PDF or HFE letter
    description: |
      Main OCR endpoint used by the frontend upload flow.

      Send a PDF file as multipart form-data. The optional `doc_kind` hint helps the service
      prefer the expected parser when the document type is already known by the caller.
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            required:
              - file
            properties:
              file:
                type: string
                format: binary
                description: PDF file to extract.
              doc_kind:
                type: string
                enum:
                  - income
                  - hfe
                description: Optional frontend hint for the expected document type.
              document_type:
                type: string
                enum:
                  - income
                  - hfe
                description: Legacy alias for doc_kind.
    responses:
      200:
        description: OCR extraction completed successfully.
      400:
        description: Missing file or unsupported upload type.
      422:
        description: Document type could not be identified from the PDF contents.
      500:
        description: Unexpected OCR processing failure.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send a PDF as form-data field 'file'."}), 400

    uploaded = request.files["file"]
    hinted_doc_type = (request.form.get("doc_kind") or request.form.get("document_type") or "").strip().lower()

    if not uploaded.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    pdf_bytes = uploaded.read()

    try:
        text = pdf_bytes_to_text(pdf_bytes)
    except Exception as exc:
        return jsonify({"error": f"Failed to process PDF: {exc}"}), 500

    detected_doc_type = detect_doc_type(text)
    doc_type = hinted_doc_type if hinted_doc_type in {"income", "hfe"} and detected_doc_type != hinted_doc_type else detected_doc_type

    if doc_type == "income":
        fields = extract_income(text)
    elif doc_type == "hfe":
        fields = extract_hfe(text)
    else:
        return jsonify({
            "error": "Could not identify document type. Expected an income document or HFE letter."
        }), 422

    return jsonify({
        "doc_type": doc_type,
        "detected_doc_type": detected_doc_type,
        "source": uploaded.filename,
        "fields": fields,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=False)
