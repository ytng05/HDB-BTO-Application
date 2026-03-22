"""Atomic microservice (port 5011)"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'mysql+mysqlconnector://root@localhost:3306/hfe_application'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 299}

db = SQLAlchemy(app)

app.config['SWAGGER'] = {
    'title': 'HFE Application Service API',
    'version': '1.0',
    'openapi': '3.0.2',
    'description': 'Atomic service – manages HFE letter records (Steps 2 & 9 of Apply-for-BTO).'
}
swagger = Swagger(app)

HFE_VALIDITY_MONTHS = 9


class HFEApplication(db.Model):
    __tablename__ = 'hfe_application'

    hfe_id            = db.Column(db.Integer,   primary_key=True, autoincrement=True)
    applicant_id      = db.Column(db.Integer,   nullable=False)
    co_applicant_id   = db.Column(db.Integer,   nullable=True)
    flat_type         = db.Column(db.String(20), nullable=False)
    status            = db.Column(db.String(20), nullable=False, default='SUBMITTED')
    max_loan_amount   = db.Column(db.Float,     nullable=True)
    estimated_grant   = db.Column(db.Float,     nullable=True)
    validity_start    = db.Column(db.DateTime,  nullable=True)
    rejection_reason  = db.Column(db.Text,      nullable=True)
    created_at        = db.Column(db.DateTime,  nullable=False, default=datetime.utcnow)
    updated_at        = db.Column(db.DateTime,  nullable=False, default=datetime.utcnow,
                                  onupdate=datetime.utcnow)

    def __init__(self, applicant_id, flat_type, co_applicant_id=None):
        self.applicant_id    = applicant_id
        self.co_applicant_id = co_applicant_id
        self.flat_type       = flat_type

    def json(self):
        return {
            'hfe_id':          self.hfe_id,
            'hfe_letter_id':   self.hfe_letter_id,
            'applicant_id':    self.applicant_id,
            'co_applicant_id': self.co_applicant_id,
            'flat_type':       self.flat_type,
            'status':          self.status,
            'max_loan_amount': self.max_loan_amount,
            'estimated_grant': self.estimated_grant,
            'validity_start':  str(self.validity_start) if self.validity_start else None,
            'validity_end':    str(self.validity_end)   if self.validity_end   else None,
            'rejection_reason':self.rejection_reason,
            'created_at':      str(self.created_at),
            'updated_at':      str(self.updated_at),
        }


@app.route('/hfe-application', methods=['GET'])
def get_all():
    """
    Get all HFE applications
        ---
    responses:
      200:
        description: List returned
      404:
        description: None found
    """
    records = db.session.scalars(db.select(HFEApplication)).all()
    if records:
        return jsonify({'code': 200, 'data': {'hfe_applications': [r.json() for r in records]}})
    return jsonify({'code': 404, 'message': 'No HFE applications found.'}), 404


@app.route('/hfe-application/<int:hfe_id>', methods=['GET'])
def get_by_id(hfe_id):
    """
    Get a HFE application by its primary key
        ---
    parameters:
      - name: hfe_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Record found
      404:
        description: Not found
    """
    record = db.session.get(HFEApplication, hfe_id)
    if record:
        return jsonify({'code': 200, 'data': record.json()})
    return jsonify({'code': 404, 'message': 'HFE application not found.'}), 404


@app.route('/hfe-application/applicant/<int:applicant_id>', methods=['GET'])
def get_by_applicant(applicant_id):
    """
    Get HFE applications for a specific applicant
        ---
    parameters:
      - name: applicant_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Records found
      404:
        description: None found
    """
    records = db.session.scalars(
        db.select(HFEApplication).filter_by(applicant_id=applicant_id)
    ).all()
    if records:
        return jsonify({'code': 200, 'data': {'hfe_applications': [r.json() for r in records]}})
    return jsonify({'code': 404, 'message': 'No HFE applications found for this applicant.'}), 404


@app.route('/hfe-application/verify', methods=['GET'])
def verify_hfe():
    """
    Verify that an applicant has a valid, APPROVED HFE letter for a given flat_type.
        ---
    parameters:
      - name: application_id
        in: query
        required: true
        schema:
          type: integer
      - name: nric
        in: query
        required: false
        schema:
          type: string
      - name: flat_type
        in: query
        required: true
        schema:
          type: string
    responses:
      200:
        description: Verification result
    """
    application_id = request.args.get('application_id')
    flat_type      = request.args.get('flat_type')

    if not application_id or not flat_type:
        return jsonify({'code': 400, 'message': "'application_id' and 'flat_type' are required."}), 400

    record = db.session.scalar(
        db.select(HFEApplication)
        .filter_by(applicant_id=int(application_id), flat_type=flat_type, status='APPROVED')
        .order_by(HFEApplication.validity_end.desc())
    )

    now = datetime.utcnow()
    if record and record.validity_end and record.validity_end > now:
        return jsonify({
            'code': 200,
            'data': {
                'hfe_eligible':  True,
                'hfe_letter_id': record.hfe_letter_id,
                'validity_end':  str(record.validity_end),
            }
        })

    return jsonify({
        'code': 200,
        'data': {
            'hfe_eligible': False,
            'reason': 'No valid approved HFE letter found for this flat type.'
        }
    })


@app.route('/hfe-application', methods=['POST'])
def create_hfe_application():
    """
    Create a new HFE application record (Step 2 – status = SUBMITTED)
        ---
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [applicant_id, flat_type]
            properties:
              applicant_id:
                type: integer
              co_applicant_id:
                type: integer
              flat_type:
                type: string
    responses:
      201:
        description: HFE application created
      400:
        description: Missing required fields
      500:
        description: Server error
    """
    data = request.get_json()
    errors = []

    for field in ['applicant_id', 'flat_type']:
        if not data.get(field):
            errors.append(f"'{field}' is required.")

    if errors:
        return jsonify({'code': 400, 'message': errors}), 400

    record = HFEApplication(
        applicant_id=data['applicant_id'],
        flat_type=data['flat_type'],
        co_applicant_id=data.get('co_applicant_id')
    )

    try:
        db.session.add(record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'message': f'Error creating HFE application: {str(e)}'}), 500

    return jsonify({'code': 201, 'data': record.json()}), 201


@app.route('/hfe-application/<int:hfe_id>/approve', methods=['PUT'])
def approve_hfe(hfe_id):
    """
    Approve a HFE application – generates HFE letter and sets validity period (9 months).
        ---
    parameters:
      - name: hfe_id
        in: path
        required: true
        schema:
          type: integer
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              max_loan_amount:
                type: number
              estimated_grant:
                type: number
    responses:
      200:
        description: HFE application approved
      404:
        description: Not found
    """
    record = db.session.get(HFEApplication, hfe_id)
    if not record:
        return jsonify({'code': 404, 'message': 'HFE application not found.'}), 404

    data = request.get_json() or {}

    now = datetime.utcnow()
    record.status          = 'APPROVED'
    record.hfe_letter_id   = f"HFE-{record.applicant_id}-{int(now.timestamp())}"
    record.max_loan_amount = data.get('max_loan_amount')
    record.estimated_grant = data.get('estimated_grant')
    record.validity_start  = now
    record.validity_end    = now + timedelta(days=HFE_VALIDITY_MONTHS * 30)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'message': f'Error approving HFE: {str(e)}'}), 500

    return jsonify({'code': 200, 'data': record.json()})


@app.route('/hfe-application/<int:hfe_id>/reject', methods=['PUT'])
def reject_hfe(hfe_id):
    """
    Reject a HFE application (Step 7b).
        ---
    parameters:
      - name: hfe_id
        in: path
        required: true
        schema:
          type: integer
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              rejection_reason:
                type: string
    responses:
      200:
        description: HFE application rejected
      404:
        description: Not found
    """
    record = db.session.get(HFEApplication, hfe_id)
    if not record:
        return jsonify({'code': 404, 'message': 'HFE application not found.'}), 404

    data = request.get_json() or {}
    record.status           = 'REJECTED'
    record.rejection_reason = data.get('rejection_reason', 'Does not meet eligibility criteria.')

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'message': f'Error rejecting HFE: {str(e)}'}), 500

    return jsonify({'code': 200, 'data': record.json()})


if __name__ == '__main__':
    app.run(port=5011, debug=True)
