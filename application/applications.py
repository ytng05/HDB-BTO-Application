"""Application service for BTO applications and nested members."""

from datetime import datetime
from decimal import Decimal, InvalidOperation
import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from sqlalchemy.orm import selectinload

ALLOWED_APPLICATION_STATUSES = (
    "DRAFT",
    "SUBMITTED",
    "SUCCESSFUL",
    "UNSUCCESSFUL",
    "CANCELLED",
)

ALLOWED_MEMBER_ROLES = (
    "MAIN_APPLICANT",
    "CO_APPLICANT",
    "OCCUPANT",
)

REQUIRED_SUBMISSION_FORM_FIELDS = (
    "fullName",
    "nric",
    "dateOfBirth",
    "contactNumber",
    "email",
    "maritalStatus",
    "preferredTown",
    "flatType",
)

REQUIRED_SUBMISSION_DOCUMENT_FIELDS = (
    "incomePdfName",
    "hfeLetterPdfName",
)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = os.environ.get("DB_PORT", "3306")
    db_name = os.environ.get("DB_NAME", "applications")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    credentials = f"{db_user}:{db_password}" if db_password else db_user
    DATABASE_URL = f"mysql+mysqlconnector://{credentials}@{db_host}:{db_port}/{db_name}"

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_recycle": 299}

app.config["SWAGGER"] = {
    "title": "Applications Microservice API",
    "version": 1.0,
    "openapi": "3.0.2",
    "description": "Manages BTO applications and nested application members",
}
swagger = Swagger(app)

db = SQLAlchemy(app)


class Application(db.Model):
    __tablename__ = "application"

    application_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    exercise_id = db.Column(db.Integer, nullable=False)
    project_id = db.Column(db.Integer, nullable=False)
    flat_type = db.Column(db.String(50), nullable=False)
    main_applicant_nric = db.Column(db.String(20), nullable=False)
    income_document_id = db.Column(db.Integer, nullable=True)
    hfe_document_id = db.Column(db.Integer, nullable=True)
    draft_payload = db.Column(db.JSON, nullable=True)
    application_status = db.Column(
        db.Enum(*ALLOWED_APPLICATION_STATUSES, name="application_status_enum"),
        nullable=False,
        default="SUBMITTED",
    )
    submitted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.now,
        onupdate=datetime.now,
    )

    members = db.relationship(
        "ApplicationMember",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ApplicationMember.member_id",
    )

    def to_dict(self, include_members=True):
        payload = {
            "application_id": self.application_id,
            "exercise_id": self.exercise_id,
            "project_id": self.project_id,
            "flat_type": self.flat_type,
            "main_applicant_nric": self.main_applicant_nric,
            "income_document_id": self.income_document_id,
            "hfe_document_id": self.hfe_document_id,
            "draft_payload": self.draft_payload,
            "application_status": self.application_status,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_members:
            payload["members"] = [member.to_dict() for member in self.members]

        return payload


class ApplicationMember(db.Model):
    __tablename__ = "application_member"

    member_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(
        db.Integer,
        db.ForeignKey("application.application_id", ondelete="CASCADE"),
        nullable=False,
    )
    member_role = db.Column(
        db.Enum(*ALLOWED_MEMBER_ROLES, name="application_member_role_enum"),
        nullable=False,
    )
    nric_fin = db.Column(db.String(20), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    relationship_to_main = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    citizenship_status = db.Column(db.String(20), nullable=False)
    marital_status = db.Column(db.String(20), nullable=True)
    is_pregnant = db.Column(db.Boolean, nullable=False, default=False)
    income_amount = db.Column(db.Numeric(12, 2), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.now,
        onupdate=datetime.now,
    )

    application = db.relationship("Application", back_populates="members")

    def to_dict(self):
        return {
            "member_id": self.member_id,
            "application_id": self.application_id,
            "member_role": self.member_role,
            "nric_fin": self.nric_fin,
            "full_name": self.full_name,
            "relationship_to_main": self.relationship_to_main,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "citizenship_status": self.citizenship_status,
            "marital_status": self.marital_status,
            "is_pregnant": self.is_pregnant,
            "income_amount": float(self.income_amount) if self.income_amount is not None else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


def is_non_empty_string(value):
    return isinstance(value, str) and value.strip() != ""


def parse_date(value):
    if not is_non_empty_string(value):
        return None

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def parse_int(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    return None


def parse_optional_int(value):
    if value is None:
        return None, None

    parsed = parse_int(value)
    if parsed is None:
        return None, "must be an integer or null."

    return parsed, None


def parse_decimal(value):
    if value is None or isinstance(value, bool):
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def get_application_record(application_id):
    query = (
        db.select(Application)
        .options(selectinload(Application.members))
        .where(Application.application_id == application_id)
    )
    return db.session.scalar(query)


def get_active_application_for_nric(nric):
    query = (
        db.select(Application)
        .options(selectinload(Application.members))
        .outerjoin(ApplicationMember)
        .where(
            Application.application_status.in_(("DRAFT", "SUBMITTED")),
            or_(
                Application.main_applicant_nric == nric,
                ApplicationMember.nric_fin == nric,
            ),
        )
        .order_by(Application.updated_at.desc(), Application.application_id.desc())
    )
    return db.session.scalars(query).unique().first()


def build_member_models(members_payload):
    return [
        ApplicationMember(
            member_role=member_payload["member_role"],
            nric_fin=member_payload["nric_fin"],
            full_name=member_payload["full_name"],
            relationship_to_main=member_payload["relationship_to_main"],
            date_of_birth=member_payload["date_of_birth"],
            citizenship_status=member_payload["citizenship_status"],
            marital_status=member_payload["marital_status"],
            is_pregnant=member_payload["is_pregnant"],
            income_amount=member_payload["income_amount"],
        )
        for member_payload in members_payload
    ]


def validate_member(member, index):
    if not isinstance(member, dict):
        return None, [f"members[{index}] must be an object."]

    errors = []
    cleaned = {}

    required_string_fields = (
        "member_role",
        "nric_fin",
        "full_name",
        "relationship_to_main",
        "citizenship_status",
    )

    for field_name in required_string_fields:
        if not is_non_empty_string(member.get(field_name)):
            errors.append(f"members[{index}].{field_name} is required.")
        else:
            cleaned[field_name] = member[field_name].strip()

    if "member_role" in cleaned and cleaned["member_role"] not in ALLOWED_MEMBER_ROLES:
        errors.append(
            "members[{index}].member_role must be one of: {roles}.".format(
                index=index,
                roles=", ".join(ALLOWED_MEMBER_ROLES),
            )
        )

    date_of_birth = parse_date(member.get("date_of_birth"))
    if date_of_birth is None:
        errors.append(f"members[{index}].date_of_birth must be a valid date in YYYY-MM-DD format.")
    else:
        cleaned["date_of_birth"] = date_of_birth

    marital_status = member.get("marital_status")
    if marital_status is not None and not is_non_empty_string(marital_status):
        errors.append(f"members[{index}].marital_status must be a non-empty string or null.")
    else:
        cleaned["marital_status"] = marital_status.strip() if isinstance(marital_status, str) else None

    is_pregnant = member.get("is_pregnant", False)
    if not isinstance(is_pregnant, bool):
        errors.append(f"members[{index}].is_pregnant must be a boolean.")
    else:
        cleaned["is_pregnant"] = is_pregnant

    income_amount = parse_decimal(member.get("income_amount"))
    if member.get("income_amount") is not None and income_amount is None:
        errors.append(f"members[{index}].income_amount must be a valid number.")
    else:
        cleaned["income_amount"] = income_amount

    return cleaned, errors


def validate_application_payload(data, existing_application=None):
    if not isinstance(data, dict):
        return None, ["Request body must be a JSON object."]

    errors = []
    cleaned = {}

    for field_name in ("exercise_id", "project_id", "income_document_id", "hfe_document_id"):
        value = parse_int(data.get(field_name))
        if value is None:
            errors.append(f"{field_name} is required and must be an integer.")
        else:
            cleaned[field_name] = value

    for field_name in ("flat_type", "main_applicant_nric"):
        if not is_non_empty_string(data.get(field_name)):
            errors.append(f"{field_name} is required.")
        else:
            cleaned[field_name] = data[field_name].strip()

    application_status = data.get("application_status")
    if application_status is None:
        if existing_application is not None:
            cleaned["application_status"] = existing_application.application_status
        else:
            cleaned["application_status"] = "SUBMITTED"
    elif not is_non_empty_string(application_status):
        errors.append("application_status must be a non-empty string.")
    else:
        application_status = application_status.strip()
        if application_status not in ALLOWED_APPLICATION_STATUSES:
            errors.append(
                "application_status must be one of: {statuses}.".format(
                    statuses=", ".join(ALLOWED_APPLICATION_STATUSES)
                )
            )
        else:
            cleaned["application_status"] = application_status

    members = data.get("members")
    if not isinstance(members, list) or not members:
        errors.append("members is required and must be a non-empty array.")
        return cleaned, errors

    cleaned_members = []
    seen_nric_fin = set()
    main_applicant_count = 0
    main_applicant_member_nric = None

    for index, member in enumerate(members):
        cleaned_member, member_errors = validate_member(member, index)
        errors.extend(member_errors)

        if cleaned_member is None:
            continue

        nric_fin = cleaned_member["nric_fin"]
        if nric_fin in seen_nric_fin:
            errors.append(f"Duplicate nric_fin found in members: {nric_fin}.")
        else:
            seen_nric_fin.add(nric_fin)

        if cleaned_member["member_role"] == "MAIN_APPLICANT":
            main_applicant_count += 1
            main_applicant_member_nric = nric_fin

        cleaned_members.append(cleaned_member)

    if main_applicant_count != 1:
        errors.append("There must be exactly one member with member_role MAIN_APPLICANT.")

    main_applicant_nric = cleaned.get("main_applicant_nric")
    if main_applicant_nric and main_applicant_member_nric and main_applicant_nric != main_applicant_member_nric:
        errors.append("MAIN_APPLICANT member nric_fin must match main_applicant_nric.")

    cleaned["members"] = cleaned_members
    return cleaned, errors


def validate_submission_payload(application):
    errors = []

    if not is_non_empty_string(application.flat_type) or application.flat_type == "Draft":
        errors.append("flat_type must be selected before submission.")

    if not isinstance(application.project_id, int) or application.project_id <= 0:
        errors.append("project_id must be set before submission.")

    if not isinstance(application.income_document_id, int) or application.income_document_id <= 0:
        errors.append("income_document_id must be linked before submission.")

    if not isinstance(application.hfe_document_id, int) or application.hfe_document_id <= 0:
        errors.append("hfe_document_id must be linked before submission.")

    payload = application.draft_payload if isinstance(application.draft_payload, dict) else {}
    form_payload = payload.get("form") if isinstance(payload.get("form"), dict) else {}
    documents_payload = payload.get("documents") if isinstance(payload.get("documents"), dict) else {}

    for field_name in REQUIRED_SUBMISSION_FORM_FIELDS:
        if not is_non_empty_string(form_payload.get(field_name)):
            errors.append(f"draft_payload.form.{field_name} is required before submission.")

    for field_name in REQUIRED_SUBMISSION_DOCUMENT_FIELDS:
        if not is_non_empty_string(documents_payload.get(field_name)):
            errors.append(f"draft_payload.documents.{field_name} is required before submission.")

    if is_non_empty_string(form_payload.get("nric")) and form_payload.get("nric").strip().upper() != application.main_applicant_nric:
        errors.append("draft_payload.form.nric must match main_applicant_nric.")

    if is_non_empty_string(form_payload.get("flatType")) and form_payload.get("flatType").strip() != application.flat_type:
        errors.append("draft_payload.form.flatType must match flat_type.")

    if not parse_date(form_payload.get("dateOfBirth")):
        errors.append("draft_payload.form.dateOfBirth must be a valid date in YYYY-MM-DD format.")

    return errors


def validate_status_payload(data):
    if not isinstance(data, dict):
        return None, ["Request body must be a JSON object."]

    errors = []
    application_status = data.get("status")
    if not is_non_empty_string(application_status):
        errors.append("status is required.")
    else:
        application_status = application_status.strip().upper()
        if application_status not in ALLOWED_APPLICATION_STATUSES:
            errors.append(
                "status must be one of: {statuses}.".format(
                    statuses=", ".join(ALLOWED_APPLICATION_STATUSES)
                )
            )

    extra_fields = [key for key in data.keys() if key != "status"]
    if extra_fields:
        errors.append(
            "Only status can be updated here. Unexpected fields: {fields}.".format(
                fields=", ".join(extra_fields)
            )
        )

    return application_status, errors


def validate_draft_payload(data, existing_application=None):
    if not isinstance(data, dict):
        return None, ["Request body must be a JSON object."]

    errors = []
    cleaned = {}

    main_applicant_nric = data.get("main_applicant_nric")
    if not is_non_empty_string(main_applicant_nric):
        errors.append("main_applicant_nric is required.")
    else:
        cleaned["main_applicant_nric"] = main_applicant_nric.strip().upper()

    draft_payload = data.get("draft_payload")
    if draft_payload is not None and not isinstance(draft_payload, dict):
        errors.append("draft_payload must be an object.")
    else:
        cleaned["draft_payload"] = draft_payload or {}

    exercise_id = data.get("exercise_id")
    if exercise_id is None:
        cleaned["exercise_id"] = existing_application.exercise_id if existing_application else 202601
    else:
        parsed = parse_int(exercise_id)
        if parsed is None:
            errors.append("exercise_id must be an integer.")
        else:
            cleaned["exercise_id"] = parsed

    project_id = data.get("project_id")
    if project_id is None:
        cleaned["project_id"] = existing_application.project_id if existing_application else 0
    else:
        parsed = parse_int(project_id)
        if parsed is None:
            errors.append("project_id must be an integer.")
        else:
            cleaned["project_id"] = parsed

    income_document_id = data.get("income_document_id")
    if income_document_id is None:
        cleaned["income_document_id"] = existing_application.income_document_id if existing_application else None
    else:
        parsed, parse_error = parse_optional_int(income_document_id)
        if parse_error:
            errors.append(f"income_document_id {parse_error}")
        cleaned["income_document_id"] = parsed

    hfe_document_id = data.get("hfe_document_id")
    if hfe_document_id is None:
        cleaned["hfe_document_id"] = existing_application.hfe_document_id if existing_application else None
    else:
        parsed, parse_error = parse_optional_int(hfe_document_id)
        if parse_error:
            errors.append(f"hfe_document_id {parse_error}")
        cleaned["hfe_document_id"] = parsed

    flat_type = data.get("flat_type")
    if flat_type is None:
        cleaned["flat_type"] = existing_application.flat_type if existing_application else "Draft"
    elif not is_non_empty_string(flat_type):
        errors.append("flat_type must be a non-empty string.")
    else:
        cleaned["flat_type"] = flat_type.strip()

    return cleaned, errors


@app.route("/applications", methods=["POST"])
def create_application():
    """
    Create a full application with nested members
    ---
    tags:
      - Applications
    summary: Create application
    description: Creates one application record and all nested application members in a single transaction.
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - exercise_id
              - project_id
              - flat_type
              - main_applicant_nric
              - income_document_id
              - hfe_document_id
              - members
    responses:
      201:
        description: Application created successfully
      400:
        description: Validation error
      500:
        description: Internal server error
    """
    payload = request.get_json(silent=True)
    cleaned, errors = validate_application_payload(payload)
    if errors:
        return jsonify({"error": "Validation error.", "details": errors}), 400

    application = Application(
        exercise_id=cleaned["exercise_id"],
        project_id=cleaned["project_id"],
        flat_type=cleaned["flat_type"],
        main_applicant_nric=cleaned["main_applicant_nric"],
        income_document_id=cleaned["income_document_id"],
        hfe_document_id=cleaned["hfe_document_id"],
        application_status=cleaned["application_status"],
    )
    if application.application_status == "SUBMITTED":
        application.submitted_at = datetime.now()

    application.members = build_member_models(cleaned["members"])

    try:
        db.session.add(application)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Error creating application: {exc}"}), 500

    row = get_application_record(application.application_id)
    return jsonify(row.to_dict(include_members=True)), 201


@app.route("/applications/drafts", methods=["POST"])
def create_draft():
    """
    Create or continue a draft application
    ---
    tags:
      - Applications
    summary: Save a new draft
    description: Creates a draft application, or returns the existing active application already linked to the same NRIC.
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - main_applicant_nric
            properties:
              main_applicant_nric:
                type: string
              exercise_id:
                type: integer
              project_id:
                type: integer
              flat_type:
                type: string
              income_document_id:
                type: integer
              hfe_document_id:
                type: integer
              draft_payload:
                type: object
    responses:
      200:
        description: Existing draft returned successfully
      201:
        description: Draft created successfully
      400:
        description: Validation error
      500:
        description: Internal server error
    """
    payload = request.get_json(silent=True)
    cleaned, errors = validate_draft_payload(payload)
    if errors:
        return jsonify({"error": "Validation error.", "details": errors}), 400

    existing_application = get_active_application_for_nric(cleaned["main_applicant_nric"])
    if existing_application is not None:
        if existing_application.application_status == "DRAFT":
            existing_application.exercise_id = cleaned["exercise_id"]
            existing_application.project_id = cleaned["project_id"]
            existing_application.flat_type = cleaned["flat_type"]
            existing_application.income_document_id = cleaned["income_document_id"]
            existing_application.hfe_document_id = cleaned["hfe_document_id"]
            existing_application.draft_payload = cleaned["draft_payload"]

            try:
                db.session.commit()
            except Exception as exc:
                db.session.rollback()
                return jsonify({"error": f"Error saving draft: {exc}"}), 500

        row = get_application_record(existing_application.application_id)
        return jsonify(row.to_dict(include_members=True))

    draft = Application(
        exercise_id=cleaned["exercise_id"],
        project_id=cleaned["project_id"],
        flat_type=cleaned["flat_type"],
        main_applicant_nric=cleaned["main_applicant_nric"],
        income_document_id=cleaned["income_document_id"],
        hfe_document_id=cleaned["hfe_document_id"],
        draft_payload=cleaned["draft_payload"],
        application_status="DRAFT",
    )

    try:
        db.session.add(draft)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Error creating draft: {exc}"}), 500

    row = get_application_record(draft.application_id)
    return jsonify(row.to_dict(include_members=True)), 201


@app.route("/applications/<int:application_id>", methods=["GET"])
def get_application(application_id):
    """
    Get one application with nested members
    ---
    tags:
      - Applications
    summary: Get application by id
    description: Returns a single application and all of its members.
    responses:
      200:
        description: Application retrieved successfully
      404:
        description: Application not found
    """
    row = get_application_record(application_id)
    if row is None:
        return jsonify({"error": "Application not found."}), 404

    return jsonify(row.to_dict(include_members=True))


@app.route("/applications/<int:application_id>/draft", methods=["PUT"])
def update_draft(application_id):
    """
    Update a draft application
    ---
    tags:
      - Applications
    summary: Update draft
    description: Updates the saved draft payload and summary fields for a draft application.
    parameters:
      - in: path
        name: application_id
        required: true
        schema:
          type: integer
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - main_applicant_nric
    responses:
      200:
        description: Draft updated successfully
      400:
        description: Validation error
      404:
        description: Application not found
      500:
        description: Internal server error
    """
    row = get_application_record(application_id)
    if row is None:
        return jsonify({"error": "Application not found."}), 404

    payload = request.get_json(silent=True)
    cleaned, errors = validate_draft_payload(payload, existing_application=row)
    if errors:
        return jsonify({"error": "Validation error.", "details": errors}), 400

    row.exercise_id = cleaned["exercise_id"]
    row.project_id = cleaned["project_id"]
    row.flat_type = cleaned["flat_type"]
    row.main_applicant_nric = cleaned["main_applicant_nric"]
    row.income_document_id = cleaned["income_document_id"]
    row.hfe_document_id = cleaned["hfe_document_id"]
    row.draft_payload = cleaned["draft_payload"]
    if row.application_status == "DRAFT":
        row.submitted_at = None

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Error updating draft: {exc}"}), 500

    updated_row = get_application_record(application_id)
    return jsonify(updated_row.to_dict(include_members=True))


@app.route("/applications/<int:application_id>/status", methods=["PUT"])
def update_application_status(application_id):
    """
    Update application status only
    ---
    tags:
      - Applications
    summary: Update application status
    description: Updates only the status field for an application.
    parameters:
      - in: path
        name: application_id
        required: true
        schema:
          type: integer
        description: Application id of application to update
        example: 2
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - status
            properties:
              status:
                type: string
                example: SUBMITTED
          example:
            status: SUBMITTED
    responses:
      200:
        description: Application status updated successfully
      400:
        description: Validation error
      404:
        description: Application not found
      500:
        description: Internal server error
    """
    row = get_application_record(application_id)
    if row is None:
        return jsonify({"error": "Application not found."}), 404

    application_status, errors = validate_status_payload(request.get_json(silent=True))
    if errors:
        return jsonify({"error": "Validation error.", "details": errors}), 400

    if application_status == "SUBMITTED":
        submission_errors = validate_submission_payload(row)
        if submission_errors:
            return jsonify({"error": "Submission is incomplete.", "details": submission_errors}), 400

    row.application_status = application_status
    if row.application_status == "SUBMITTED" and row.submitted_at is None:
        row.submitted_at = datetime.now()

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Error updating application status: {exc}"}), 500

    updated_row = get_application_record(application_id)
    return jsonify(updated_row.to_dict(include_members=True))


@app.route("/applications", methods=["GET"])
def list_applications():
    """
    List or search applications
    ---
    tags:
      - Applications
    summary: List applications
    description: Returns applications filtered by any provided query parameters.
    parameters:
      - in: query
        name: nric
        required: false
        schema:
          type: string
        description: Returns all applications linked to this NRIC, whether as the main applicant or a member.
      - in: query
        name: main_applicant_nric
        required: false
        schema:
          type: string
        description: Filters by main applicant NRIC only.
      - in: query
        name: exercise_id
        required: false
        schema:
          type: integer
      - in: query
        name: project_id
        required: false
        schema:
          type: integer
      - in: query
        name: application_status
        required: false
        schema:
          type: string
    responses:
      200:
        description: Applications retrieved successfully
      400:
        description: Invalid query parameters
    """
    query = db.select(Application).options(selectinload(Application.members))
    errors = []

    nric = request.args.get("nric")
    if nric is not None:
        nric = nric.strip().upper()
        if not nric:
            errors.append("nric must be a non-empty string.")
        else:
            query = query.outerjoin(ApplicationMember).where(
                or_(
                    Application.main_applicant_nric == nric,
                    ApplicationMember.nric_fin == nric,
                )
            )

    main_applicant_nric = request.args.get("main_applicant_nric")
    if main_applicant_nric:
        query = query.where(Application.main_applicant_nric == main_applicant_nric.strip().upper())

    exercise_id = request.args.get("exercise_id")
    if exercise_id is not None:
        if not exercise_id.isdigit():
            errors.append("exercise_id must be an integer.")
        else:
            query = query.where(Application.exercise_id == int(exercise_id))

    project_id = request.args.get("project_id")
    if project_id is not None:
        if not project_id.isdigit():
            errors.append("project_id must be an integer.")
        else:
            query = query.where(Application.project_id == int(project_id))

    application_status = request.args.get("application_status")
    if application_status:
        if application_status not in ALLOWED_APPLICATION_STATUSES:
            errors.append(
                "application_status must be one of: {statuses}.".format(
                    statuses=", ".join(ALLOWED_APPLICATION_STATUSES)
                )
            )
        else:
            query = query.where(Application.application_status == application_status)

    if errors:
        return jsonify({"error": "Validation error.", "details": errors}), 400

    query = query.order_by(Application.created_at.desc(), Application.application_id.desc())
    rows = db.session.scalars(query).unique().all()
    response_payload = {"applications": [row.to_dict(include_members=True) for row in rows]}
    if nric:
        response_payload["nric"] = nric
    return jsonify(response_payload)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=False)
