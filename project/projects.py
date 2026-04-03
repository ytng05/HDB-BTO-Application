"""Project service for BTO project listings."""

import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = os.environ.get("DB_PORT", "3306")
    db_name = os.environ.get("DB_NAME", "projects")
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
    "title": "Project Microservice API",
    "version": 1.0,
    "openapi": "3.0.2",
    "description": "Manages BTO projects.",
}
swagger = Swagger(app)

db = SQLAlchemy(app)

ALLOWED_PROJECT_STATUSES = ("open", "closed")


class Project(db.Model):
    __tablename__ = "project"

    project_id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, nullable=False, index=True)
    project_name = db.Column(db.String(120), nullable=False)
    town_name = db.Column(db.String(80), nullable=False)
    flat_types = db.Column(db.String(120), nullable=False)
    status = db.Column(
        db.Enum(*ALLOWED_PROJECT_STATUSES, name="project_status_enum"),
        nullable=False,
        default="open",
    )

    # Handles to dict.
    def to_dict(self):
        return {
            "project_id": self.project_id,
            "exercise_id": self.exercise_id,
            "project_name": self.project_name,
            "town_name": self.town_name,
            "flat_types": self.flat_types,
            "status": self.status,
        }


# Parses positive int.
def parse_positive_int(raw_value, field_name):
    if raw_value is None:
        return None, None
    if not raw_value.isdigit():
        return None, f"{field_name} must be an integer."
    value = int(raw_value)
    if value <= 0:
        return None, f"{field_name} must be greater than 0."
    return value, None


# Lists projects.
@app.route("/projects", methods=["GET"])
def list_projects():
    """List projects with optional filters."""
    query = db.select(Project)
    errors = []

    exercise_id, exercise_id_error = parse_positive_int(request.args.get("exercise_id"), "exercise_id")
    if exercise_id_error:
        errors.append(exercise_id_error)
    elif exercise_id is not None:
        query = query.where(Project.exercise_id == exercise_id)

    status = request.args.get("status")
    if status is not None:
        if status not in ALLOWED_PROJECT_STATUSES:
            errors.append(f"status must be one of: {', '.join(ALLOWED_PROJECT_STATUSES)}.")
        else:
            query = query.where(Project.status == status)

    if errors:
        return jsonify({"code": 400, "message": "Validation error.", "errors": errors}), 400

    rows = db.session.scalars(query.order_by(Project.exercise_id.desc(), Project.project_id.asc())).all()
    if not rows:
        return jsonify({"code": 404, "message": "No projects found."}), 404

    return jsonify({"code": 200, "data": [row.to_dict() for row in rows]}), 200


# Gets project.
@app.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    """Get one project."""
    row = db.session.get(Project, project_id)
    if row is None:
        return jsonify({"code": 404, "message": "Project not found."}), 404
    return jsonify({"code": 200, "data": row.to_dict()}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5012, debug=False)
