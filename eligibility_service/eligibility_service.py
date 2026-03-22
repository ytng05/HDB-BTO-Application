"""Wrapper microservice (port 5004)"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from datetime import datetime
import requests
import os
import time

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'mysql+mysqlconnector://root@localhost:3306/eligibility_service'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 299}

db = SQLAlchemy(app)

app.config['SWAGGER'] = {
    'title': 'Eligibility Service API',
    'version': '1.0',
    'openapi': '3.0.2',
    'description': (
        'Wrapper – checks BTO applicant eligibility by calling '
        'ICA (8a), IRAS (8b), CPF Board (8c), and SLA (8d) APIs.'
    )
}
swagger = Swagger(app)

# External Government API base URLs (override via env vars in Docker)
ICA_API_URL  = os.environ.get('ICA_API_URL',  'https://api.ica.gov.sg')
IRAS_API_URL = os.environ.get('IRAS_API_URL', 'https://api.iras.gov.sg')
CPF_API_URL  = os.environ.get('CPF_API_URL',  'https://api.cpf.gov.sg')
SLA_API_URL  = os.environ.get('SLA_API_URL',  'https://api.sla.gov.sg')

API_TIMEOUT     = int(os.environ.get('API_TIMEOUT', 10))
API_MAX_RETRIES = int(os.environ.get('API_MAX_RETRIES', 2))
DEV_MODE        = os.environ.get('DEV_MODE', 'true').lower() == 'true'

INCOME_CEILING_SGD = float(os.environ.get('INCOME_CEILING_SGD', str(14000 * 12)))


class EligibilityCheck(db.Model):
    __tablename__ = 'eligibility_check'

    check_id          = db.Column(db.Integer,     primary_key=True, autoincrement=True)
    application_id    = db.Column(db.Integer,     nullable=False, index=True)
    applicant_nric    = db.Column(db.String(9),   nullable=False)
    co_applicant_nric = db.Column(db.String(9),   nullable=True)
    flat_type         = db.Column(db.String(20),  nullable=False)

    ica_pass          = db.Column(db.Boolean,     nullable=True)
    ica_detail        = db.Column(db.String(128), nullable=True)
    iras_pass         = db.Column(db.Boolean,     nullable=True)
    iras_detail       = db.Column(db.String(128), nullable=True)
    cpf_pass          = db.Column(db.Boolean,     nullable=True)
    cpf_detail        = db.Column(db.String(128), nullable=True)
    sla_pass          = db.Column(db.Boolean,     nullable=True)
    sla_detail        = db.Column(db.String(128), nullable=True)

    co_ica_pass       = db.Column(db.Boolean,     nullable=True)
    co_ica_detail     = db.Column(db.String(128), nullable=True)
    co_iras_pass      = db.Column(db.Boolean,     nullable=True)
    co_iras_detail    = db.Column(db.String(128), nullable=True)
    co_cpf_pass       = db.Column(db.Boolean,     nullable=True)
    co_cpf_detail     = db.Column(db.String(128), nullable=True)
    co_sla_pass       = db.Column(db.Boolean,     nullable=True)
    co_sla_detail     = db.Column(db.String(128), nullable=True)

    is_eligible       = db.Column(db.Boolean,     nullable=True)
    note              = db.Column(db.Text,         nullable=True)
    created_at        = db.Column(db.DateTime,     nullable=False, default=datetime.utcnow)

    def __init__(self, application_id, applicant_nric, flat_type,
                 co_applicant_nric=None):
        self.application_id    = application_id
        self.applicant_nric    = applicant_nric
        self.co_applicant_nric = co_applicant_nric
        self.flat_type         = flat_type

    def json(self):
        base = {
            'check_id':          self.check_id,
            'application_id':    self.application_id,
            'applicant_nric':    self.applicant_nric,
            'co_applicant_nric': self.co_applicant_nric,
            'flat_type':         self.flat_type,
            'primary_checks': {
                'ica_pass':    self.ica_pass,
                'ica_detail':  self.ica_detail,
                'iras_pass':   self.iras_pass,
                'iras_detail': self.iras_detail,
                'cpf_pass':    self.cpf_pass,
                'cpf_detail':  self.cpf_detail,
                'sla_pass':    self.sla_pass,
                'sla_detail':  self.sla_detail,
            },
            'is_eligible': self.is_eligible,
            'note':        self.note,
            'created_at':  str(self.created_at),
        }
        if self.co_applicant_nric:
            base['co_applicant_checks'] = {
                'co_ica_pass':    self.co_ica_pass,
                'co_ica_detail':  self.co_ica_detail,
                'co_iras_pass':   self.co_iras_pass,
                'co_iras_detail': self.co_iras_detail,
                'co_cpf_pass':    self.co_cpf_pass,
                'co_cpf_detail':  self.co_cpf_detail,
                'co_sla_pass':    self.co_sla_pass,
                'co_sla_detail':  self.co_sla_detail,
            }
        return base


# Shared HTTP helper – retries on connection errors and 5xx

def _get_with_retry(url: str, params: dict = None):
    """
    GET request with up to API_MAX_RETRIES retries.
    """
    for attempt in range(API_MAX_RETRIES + 1):
        try:
            resp = requests.get(url, params=params, timeout=API_TIMEOUT)
            if resp.status_code < 500:
                return resp
            print(f'[RETRY] {url} -> {resp.status_code} (attempt {attempt + 1})')
        except requests.exceptions.ConnectionError as e:
            print(f'[RETRY] {url} connection error: {e} (attempt {attempt + 1})')
        except requests.exceptions.Timeout:
            print(f'[RETRY] {url} timed out after {API_TIMEOUT}s (attempt {attempt + 1})')
        except Exception as e:
            print(f'[ERROR] {url}: {e}')
            break
        if attempt < API_MAX_RETRIES:
    return None


def check_ica(nric: str) -> dict:
    """
    Verifies citizenship / PR status via ICA API.
    """
    resp = _get_with_retry(f'{ICA_API_URL}/citizenship/verify/{nric}')

    if resp is None:
        msg = 'ICA API unreachable after retries.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    if resp.status_code == 404:
        return {
            'pass': False,
            'detail': f'NRIC {nric} not found in ICA records.',
            'raw': None
        }

    if resp.status_code != 200:
        msg = f'ICA API returned HTTP {resp.status_code}.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    body   = resp.json()
    passed = bool(body.get('is_citizen_or_pr', False))
    ctype  = body.get('citizenship_type', 'unknown')
    detail = (
        f'ICA verified: {ctype}.'
        if passed
        else f'Not a citizen or PR (type: {ctype}).'
    )
    return {'pass': passed, 'detail': detail, 'raw': body}


def check_iras(nric: str) -> dict:
    """
    Verifies annual income is within HDB ceiling via IRAS API.
    """
    resp = _get_with_retry(f'{IRAS_API_URL}/income/verify/{nric}')

    if resp is None:
        msg = 'IRAS API unreachable after retries.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    if resp.status_code == 404:
        return {
            'pass': False,
            'detail': f'NRIC {nric} not found in IRAS records.',
            'raw': None
        }

    if resp.status_code != 200:
        msg = f'IRAS API returned HTTP {resp.status_code}.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    body    = resp.json()
    passed  = bool(body.get('income_eligible', False))
    income  = body.get('annual_income', 0)
    ceiling = body.get('income_ceiling', INCOME_CEILING_SGD)
    detail  = (
        f'Annual income SGD {income:,.0f} within ceiling SGD {ceiling:,.0f}.'
        if passed
        else f'Annual income SGD {income:,.0f} exceeds ceiling SGD {ceiling:,.0f}.'
    )
    return {'pass': passed, 'detail': detail, 'raw': body}


def check_cpf(nric: str) -> dict:
    """
    Checks CPF housing grant history and withdrawals via CPF Board API.
    """
    resp = _get_with_retry(f'{CPF_API_URL}/housing_grants/verify/{nric}')

    if resp is None:
        msg = 'CPF Board API unreachable after retries.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    if resp.status_code == 404:
        return {
            'pass': False,
            'detail': f'NRIC {nric} not found in CPF records.',
            'raw': None
        }

    if resp.status_code != 200:
        msg = f'CPF Board API returned HTTP {resp.status_code}.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    body       = resp.json()
    passed     = bool(body.get('cpf_eligible', False))
    prev_grant = body.get('previous_grant', False)
    withdrawal = body.get('cpf_housing_withdrawal', 0)
    grant_type = body.get('grant_type', 'N/A')

    if passed:
        detail = (
            f'No disqualifying CPF history. '
            f'Prior grant: {prev_grant}, withdrawal: SGD {withdrawal:,.0f}.'
        )
    else:
        reasons = []
        if prev_grant:
            reasons.append(f'previous grant received ({grant_type})')
        if withdrawal > 0:
            reasons.append(f'CPF housing withdrawal SGD {withdrawal:,.0f}')
        detail = 'CPF check failed: ' + ('; '.join(reasons) or 'ineligible') + '.'

    return {'pass': passed, 'detail': detail, 'raw': body}


def check_sla(nric: str) -> dict:
    """
    Checks for existing private property ownership via SLA API.
    """
    resp = _get_with_retry(f'{SLA_API_URL}/property/verify/{nric}')

    if resp is None:
        msg = 'SLA API unreachable after retries.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    if resp.status_code == 404:
        return {
            'pass': False,
            'detail': f'NRIC {nric} not found in SLA records.',
            'raw': None
        }

    if resp.status_code != 200:
        msg = f'SLA API returned HTTP {resp.status_code}.'
        return {'pass': DEV_MODE, 'detail': msg + (' [dev-pass]' if DEV_MODE else ''), 'raw': None}

    body       = resp.json()
    passed     = bool(body.get('no_existing_property', False))
    count      = body.get('properties_owned', 0)
    prop_types = body.get('property_types', [])
    detail     = (
        'No existing private property detected.'
        if passed
        else (
            f'Owns {count} private propert{"y" if count == 1 else "ies"}'
            + (f': {", ".join(prop_types)}.' if prop_types else '.')
        )
    )
    return {'pass': passed, 'detail': detail, 'raw': body}


# Convenience: run all four checks for one NRIC

def run_all_checks(nric: str) -> dict:
    return {
        'ica':  check_ica(nric),
        'iras': check_iras(nric),
        'cpf':  check_cpf(nric),
        'sla':  check_sla(nric),
    }


# Routes

@app.route('/eligibility', methods=['GET'])
def get_all():
    """
    Get all eligibility check records
        ---
    responses:
      200:
        description: All records
      404:
        description: None found
    """
    records = db.session.scalars(db.select(EligibilityCheck)).all()
    if records:
        return jsonify({'code': 200, 'data': {'checks': [r.json() for r in records]}})
    return jsonify({'code': 404, 'message': 'No eligibility checks found.'}), 404


@app.route('/eligibility/<int:check_id>', methods=['GET'])
def find_by_id(check_id):
    """
    Get a single eligibility check by ID
        ---
    parameters:
      - name: check_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Found
      404:
        description: Not found
    """
    record = db.session.get(EligibilityCheck, check_id)
    if record:
        return jsonify({'code': 200, 'data': record.json()})
    return jsonify({'code': 404, 'message': 'Eligibility check not found.'}), 404


@app.route('/eligibility/application/<int:application_id>', methods=['GET'])
def find_by_application(application_id):
    """
    Get the most recent eligibility check for a ballot application
        ---
    parameters:
      - name: application_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Found
      404:
        description: Not found
    """
    record = db.session.scalar(
        db.select(EligibilityCheck)
        .filter_by(application_id=application_id)
        .order_by(EligibilityCheck.created_at.desc())
    )
    if record:
        return jsonify({'code': 200, 'data': record.json()})
    return jsonify({'code': 404, 'message': 'No check found for this application.'}), 404


@app.route('/eligibility/check', methods=['POST'])
def check_eligibility():
    """
    Run full eligibility check (Steps 8a-8d) for primary applicant and
        ---
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [application_id, applicant_nric, flat_type]
            properties:
              application_id:
                type: integer
                description: ballot_application.application_id
              applicant_nric:
                type: string
                example: S8501234A
              co_applicant_nric:
                type: string
                example: S9102345B
                description: Include to also check the co-applicant / spouse
              flat_type:
                type: string
                example: 4-Room
    responses:
      200:
        description: Check complete – inspect is_eligible and per-check details
      400:
        description: Missing required fields
      500:
        description: DB error
    """
    data = request.get_json()
    errors = []
    for field in ['application_id', 'applicant_nric', 'flat_type']:
        if not data.get(field):
            errors.append(f"'{field}' is required.")
    if errors:
        return jsonify({'code': 400, 'message': errors}), 400

    application_id    = data['application_id']
    applicant_nric    = data['applicant_nric'].upper().strip()
    co_applicant_nric = (data.get('co_applicant_nric') or '').upper().strip() or None
    flat_type         = data['flat_type']

    # Persist initial record
    record = EligibilityCheck(
        application_id=application_id,
        applicant_nric=applicant_nric,
        co_applicant_nric=co_applicant_nric,
        flat_type=flat_type
    )
    try:
        db.session.add(record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'message': f'Error creating check record: {e}'}), 500

    print(f'\n[ELIGIBILITY] app_id={application_id} nric={applicant_nric} flat={flat_type}')

    print(f'[8a-8d] Checking primary applicant {applicant_nric}...')
    primary = run_all_checks(applicant_nric)

    record.ica_pass    = primary['ica']['pass']
    record.ica_detail  = primary['ica']['detail'][:128]
    record.iras_pass   = primary['iras']['pass']
    record.iras_detail = primary['iras']['detail'][:128]
    record.cpf_pass    = primary['cpf']['pass']
    record.cpf_detail  = primary['cpf']['detail'][:128]
    record.sla_pass    = primary['sla']['pass']
    record.sla_detail  = primary['sla']['detail'][:128]

    co_results = None
    if co_applicant_nric:
        print(f'[8a-8d] Checking co-applicant {co_applicant_nric}...')
        co_results = run_all_checks(co_applicant_nric)

        record.co_ica_pass    = co_results['ica']['pass']
        record.co_ica_detail  = co_results['ica']['detail'][:128]
        record.co_iras_pass   = co_results['iras']['pass']
        record.co_iras_detail = co_results['iras']['detail'][:128]
        record.co_cpf_pass    = co_results['cpf']['pass']
        record.co_cpf_detail  = co_results['cpf']['detail'][:128]
        record.co_sla_pass    = co_results['sla']['pass']
        record.co_sla_detail  = co_results['sla']['detail'][:128]

    failed_checks = []

    for key, label in [('ica', 'ICA'), ('iras', 'IRAS'), ('cpf', 'CPF'), ('sla', 'SLA')]:
        if not primary[key]['pass']:
            failed_checks.append(f"{label} (primary): {primary[key]['detail']}")

    if co_results:
        for key, label in [('ica', 'ICA'), ('iras', 'IRAS'), ('cpf', 'CPF'), ('sla', 'SLA')]:
            if not co_results[key]['pass']:
                failed_checks.append(f"{label} (co-applicant): {co_results[key]['detail']}")

    record.is_eligible = len(failed_checks) == 0
    record.note = (
        'All eligibility checks passed.'
        if record.is_eligible
        else ' | '.join(failed_checks)
    )

    print(f'[ELIGIBILITY] => {"ELIGIBLE" if record.is_eligible else "INELIGIBLE"}')

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'message': f'Error saving result: {e}'}), 500

    return jsonify({'code': 200, 'data': record.json()})


if __name__ == '__main__':
    app.run(port=5004, debug=True)
