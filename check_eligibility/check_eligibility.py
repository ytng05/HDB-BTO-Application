"""Eligibility checking service for BTO applications."""

from datetime import datetime
import os
import re

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from flasgger import Swagger

SINGPASS_SERVICE_URL = os.environ.get("SINGPASS_SERVICE_URL", "http://localhost:5007")
HFE_APPLICATION_SERVICE_URL = os.environ.get("HFE_APPLICATION_SERVICE_URL", "http://localhost:5009")
REQUEST_TIMEOUT_SECONDS = float(os.environ.get("REQUEST_TIMEOUT_SECONDS", "15"))

SINGPASS_MARITAL_STATUS_CODES = {
    "1": "SINGLE",
    "2": "MARRIED",
    "3": "WIDOWED",
    "4": "SEPARATED",
    "5": "DIVORCED",
    "6": "SINGLE",
    "9": "SINGLE",
}

app = Flask(__name__)
CORS(app)

app.config["SWAGGER"] = {
    "title": "Check Eligibility API",
    "version": 1.0,
    "openapi": "3.0.2",
    "description": "Compares posted application details and OCR results against Singpass and HFE application records.",
}
swagger = Swagger(app)


def normalize_text(value):
    if value is None:
        return None

    normalized = str(value).strip().upper()
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized or None


def normalize_nric(value):
    if value is None:
        return None

    normalized = str(value).strip().upper()
    return normalized or None


def normalize_marital_status(value):
    if value is None:
        return None

    raw_value = str(value).strip().upper()
    if raw_value in SINGPASS_MARITAL_STATUS_CODES:
        return SINGPASS_MARITAL_STATUS_CODES[raw_value]

    return raw_value or None


def normalize_float(value):
    if value is None or value == "":
        return None

    try:
        return round(float(str(value).replace(",", "").strip()), 2)
    except ValueError:
        return None


def normalize_flat_type(value):
    return normalize_text(value)


def normalize_date(value):
    if value is None:
        return None

    raw_value = str(value).strip()
    if not raw_value:
        return None

    supported_formats = (
        "%Y-%m-%d",
        "%d %B %Y",
        "%d %b %Y",
    )

    for date_format in supported_formats:
        try:
            return datetime.strptime(raw_value, date_format).date().isoformat()
        except ValueError:
            continue

    return None


def parse_eligible_flat_types(value):
    if not value:
        return []

    return [normalize_flat_type(part) for part in str(value).split(",") if normalize_flat_type(part)]


def get_json(url, params=None):
    response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


def get_singpass_profile(nric):
    return get_json(f"{SINGPASS_SERVICE_URL}/singpass/profile", params={"nric": nric})


def get_hfe_application(nric):
    return get_json(
        f"{HFE_APPLICATION_SERVICE_URL}/hfe-applications",
        params={"main_applicant_nric": nric},
    )


def get_singpass_name(profile):
    return profile.get("name", {}).get("value")


def get_singpass_nric(profile):
    return profile.get("uinfin", {}).get("value")


def get_singpass_dob(profile):
    return profile.get("dob", {}).get("value")


def get_singpass_marital_status(profile):
    marital = profile.get("marital", {})
    return marital.get("desc") or marital.get("code")


def get_singpass_household_income(profile):
    return profile.get("householdincome", {}).get("high", {}).get("value")


def compare_value(
    checks,
    blocking_reasons,
    field_name,
    left_label,
    left_value,
    right_label,
    right_value,
    normalizer,
    required=True,
):
    normalized_left = normalizer(left_value)
    normalized_right = normalizer(right_value)

    if normalized_left is None or normalized_right is None:
        checks.append(
            {
                "field": field_name,
                "left_label": left_label,
                "left_value": left_value,
                "right_label": right_label,
                "right_value": right_value,
                "status": "missing",
                "matched": False,
                "blocking": required,
            }
        )
        if required:
            blocking_reasons.append(
                f"Missing {field_name} while comparing {left_label} and {right_label}."
            )
        return False

    matched = normalized_left == normalized_right
    checks.append(
        {
            "field": field_name,
            "left_label": left_label,
            "left_value": left_value,
            "right_label": right_label,
            "right_value": right_value,
            "status": "matched" if matched else "mismatched",
            "matched": matched,
            "blocking": required,
        }
    )

    if required and not matched:
        blocking_reasons.append(
            f"{field_name} mismatch between {left_label} and {right_label}."
        )

    return matched


def append_logic_check(logic_checks, blocking_reasons, name, passed, message):
    logic_checks.append(
        {
            "check": name,
            "passed": passed,
            "message": message,
            "blocking": True,
        }
    )
    if not passed:
        blocking_reasons.append(message)


@app.route("/check-eligibility", methods=["POST"])
def check_eligibility():
    """
    Check posted application details against Singpass and HFE application records
    ---
    tags:
      - Eligibility
    summary: Compare posted application and OCR details with Singpass and HFE application data
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - application
              - income_document
            properties:
              application:
                type: object
                required:
                  - main_applicant_nric
                  - full_name
                  - date_of_birth
                  - marital_status
                  - flat_type
              income_document:
                type: object
                required:
                  - document_type
                  - fields
    responses:
      200:
        description: Eligibility check completed
      400:
        description: Missing or invalid payload
      502:
        description: Upstream service call failed
    """
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    application = payload.get("application")
    income_document = payload.get("income_document")

    if not isinstance(application, dict):
        return jsonify({"error": "application must be an object."}), 400

    if not isinstance(income_document, dict):
        return jsonify({"error": "income_document must be an object."}), 400

    application_id = application.get("application_id")
    main_applicant_nric = application.get("main_applicant_nric")
    full_name = application.get("full_name")
    date_of_birth = application.get("date_of_birth")
    marital_status = application.get("marital_status")
    flat_type = application.get("flat_type")
    income_document_type = income_document.get("document_type")
    income_fields = income_document.get("fields")

    errors = []
    if not normalize_nric(main_applicant_nric):
        errors.append("application.main_applicant_nric is required.")
    if not normalize_text(full_name):
        errors.append("application.full_name is required.")
    if not normalize_date(date_of_birth):
        errors.append("application.date_of_birth is required and must be a valid date.")
    if not normalize_marital_status(marital_status):
        errors.append("application.marital_status is required.")
    if not normalize_flat_type(flat_type):
        errors.append("application.flat_type is required.")
    if not isinstance(income_fields, dict):
        errors.append("income_document.fields is required and must be an object.")
    if not normalize_text(income_document_type):
        errors.append("income_document.document_type is required.")

    if errors:
        return jsonify({"error": "Validation error.", "details": errors}), 400

    try:
        singpass_profile = get_singpass_profile(main_applicant_nric)
        hfe_application = get_hfe_application(main_applicant_nric)
    except requests.RequestException as exc:
        return jsonify({"error": f"Upstream service call failed: {exc}"}), 502

    application_form = {
        "nric": normalize_nric(main_applicant_nric),
        "fullName": full_name,
        "dateOfBirth": date_of_birth,
        "maritalStatus": marital_status,
        "flatType": flat_type,
    }

    field_checks = []
    logic_checks = []
    blocking_reasons = []

    compare_value(
        field_checks,
        blocking_reasons,
        "NRIC",
        "Application",
        application_form.get("nric"),
        "Singpass",
        get_singpass_nric(singpass_profile),
        normalize_nric,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "Full Name",
        "Application",
        application_form.get("fullName"),
        "Singpass",
        get_singpass_name(singpass_profile),
        normalize_text,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "Date of Birth",
        "Application",
        application_form.get("dateOfBirth"),
        "Singpass",
        get_singpass_dob(singpass_profile),
        normalize_date,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "Marital Status",
        "Application",
        application_form.get("maritalStatus"),
        "Singpass",
        get_singpass_marital_status(singpass_profile),
        normalize_marital_status,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "Income NRIC",
        "Application",
        application_form.get("nric"),
        "Income Document",
        income_fields.get("main_applicant_nric"),
        normalize_nric,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "Income Name",
        "Application",
        application_form.get("fullName"),
        "Income Document",
        income_fields.get("main_applicant_name"),
        normalize_text,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "Income Date of Birth",
        "Application",
        application_form.get("dateOfBirth"),
        "Income Document",
        income_fields.get("main_applicant_date_of_birth"),
        normalize_date,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "HFE NRIC",
        "Application",
        application_form.get("nric"),
        "HFE Application",
        hfe_application.get("main_applicant_nric"),
        normalize_nric,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "HFE Name",
        "Application",
        application_form.get("fullName"),
        "HFE Application",
        hfe_application.get("main_applicant_name"),
        normalize_text,
    )

    singpass_income = normalize_float(get_singpass_household_income(singpass_profile))
    income_document_income = normalize_float(
        income_fields.get("average_monthly_income")
        or income_fields.get("main_applicant_average_monthly_income")
        or income_fields.get("combined_average_monthly_income")
    )
    hfe_income = normalize_float(hfe_application.get("total_household_income"))

    compare_value(
        field_checks,
        blocking_reasons,
        "Income Amount",
        "Income Document",
        income_document_income,
        "Singpass",
        singpass_income,
        normalize_float,
    )
    compare_value(
        field_checks,
        blocking_reasons,
        "HFE Household Income",
        "HFE Application",
        hfe_income,
        "Income Document",
        income_document_income,
        normalize_float,
    )

    selected_flat_type = normalize_flat_type(application_form.get("flatType"))
    eligible_flat_types = parse_eligible_flat_types(hfe_application.get("eligible_flat_types"))
    assessment_outcome = normalize_text(hfe_application.get("assessment_outcome"))

    append_logic_check(
        logic_checks,
        blocking_reasons,
        "income_document_type",
        normalize_text(income_document_type) == "INCOME",
        "The posted OCR result must come from an income document.",
    )
    append_logic_check(
        logic_checks,
        blocking_reasons,
        "hfe_assessment_outcome",
        assessment_outcome is not None and "ELIGIBLE" in assessment_outcome,
        "The HFE assessment outcome does not show the application as eligible.",
    )
    append_logic_check(
        logic_checks,
        blocking_reasons,
        "flat_type_allowed",
        selected_flat_type is not None and selected_flat_type in eligible_flat_types,
        "The selected flat type is not listed in the HFE eligible flat types.",
    )

    eligible = len(blocking_reasons) == 0
    summary = (
        "Application is eligible based on the current Singpass, income document, and HFE application checks."
        if eligible
        else "Application is not eligible based on the current Singpass, income document, and HFE application checks."
    )

    return jsonify(
        {
            "application_id": application_id,
            "eligible": eligible,
            "summary": summary,
            "blocking_reasons": blocking_reasons,
            "field_checks": field_checks,
            "logic_checks": logic_checks,
            "compared_values": {
                "application_flat_type": application_form.get("flatType"),
                "eligible_flat_types": hfe_application.get("eligible_flat_types"),
                "singpass_income": singpass_income,
                "income_document_income": income_document_income,
                "hfe_household_income": hfe_income,
                "assessment_outcome": hfe_application.get("assessment_outcome"),
                "hfe_application_id": hfe_application.get("hfe_application_id"),
            },
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5008, debug=False)
