"""Composite microservice (port 5016)"""

import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger

app = Flask(__name__)
CORS(app)

app.config['SWAGGER'] = {
    'title': 'Check Eligibility for Ballot Service API',
    'version': '1.0',
    'openapi': '3.0.2',
    'description': (
        'Composite – orchestrates the full eligibility check for a BTO ballot application. '
        'Verifies HFE letter validity, then calls the Eligibility Service wrapper '
        'which in turn calls ICA, IRAS, CPF Board, and SLA APIs.'
    )
}
swagger = Swagger(app)

BALLOT_APP_URL  = os.environ.get('BALLOT_APP_URL',  'http://localhost:5010')
HFE_APP_URL     = os.environ.get('HFE_APP_URL',     'http://localhost:5011')
ELIGIBILITY_URL = os.environ.get('ELIGIBILITY_URL', 'http://localhost:5004')
APPLICANT_URL   = os.environ.get('APPLICANT_URL',   'http://localhost:5001')


# Main eligibility check endpoint

@app.route('/check-eligibility', methods=['POST'])
def check_eligibility():
    """
    Run the full eligibility check for a ballot application (Steps 1-7).
        ---
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [application_id]
            properties:
              application_id:
                type: integer
                description: The ballot_application application_id to check
              applicant_nric:
                type: string
                description: >
                  NRIC of the primary applicant. If omitted the service will
                  look it up from the Applicant Service using applicant_id.
              co_applicant_nric:
                type: string
                description: NRIC of the co-applicant (optional)
              applicant_id:
                type: integer
                description: Used to fetch NRIC when applicant_nric is not supplied
    responses:
      200:
        description: >
          Eligibility determined. Check data.is_eligible (true/false) and
          data.failed_checks for details.
      400:
        description: Missing required fields
      404:
        description: Ballot application not found
      503:
        description: A downstream service is unavailable
    """
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': 'Request body required.'}), 400

    application_id = data.get('application_id')
    if not application_id:
        return jsonify({'code': 400, 'message': "'application_id' is required."}), 400

    applicant_nric    = data.get('applicant_nric', '')
    co_applicant_nric = data.get('co_applicant_nric', '')
    applicant_id      = data.get('applicant_id')

    print(f'\n{"="*60}')
    print(f'[CHECK ELIGIBILITY] application_id={application_id}')
    print(f'{"="*60}')

    print(f'\n[Step 2] Fetching BallotApplication record...')
    try:
        ba_resp = requests.get(
            f'{BALLOT_APP_URL}/ballot-application/{application_id}',
            timeout=10
        )
        ba_data = ba_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'Ballot Application Service unavailable: {e}'}), 503

    if ba_resp.status_code != 200:
        return jsonify({
            'code': 404,
            'message': f'Ballot application {application_id} not found.'
        }), 404

    ballot_record = ba_data['data']
    flat_type     = ballot_record['flat_type']

    if not applicant_id:
        applicant_id = ballot_record.get('applicant_id')

    print(f'[Step 2] Found ballot record: flat_type={flat_type}, status={ballot_record["status"]}')

    if not applicant_nric and applicant_id:
        print(f'[Step 2] NRIC not provided – fetching from Applicant Service...')
        try:
            a_resp = requests.get(
                f'{APPLICANT_URL}/applicant/{applicant_id}',
                timeout=10
            )
            if a_resp.status_code == 200:
                applicant_nric = a_resp.json().get('data', {}).get('nric', '')
                print(f'[Step 2] Resolved NRIC: {applicant_nric}')
        except Exception as e:
            print(f'[Step 2] Warning: could not resolve NRIC: {e}')

    print(f'\n[Step 3] Verifying HFE letter validity...')
    hfe_valid  = True
    hfe_note   = ''

    try:
        hfe_resp = requests.get(
            f'{HFE_APP_URL}/hfe-application/verify',
            params={
                'flat_type':      flat_type,
            },
            timeout=10
        )
        if hfe_resp.status_code == 200:
            hfe_result = hfe_resp.json().get('data', {})
            hfe_valid  = hfe_result.get('hfe_eligible', True)
            if not hfe_valid:
                hfe_note = hfe_result.get(
                    'reason',
                    'No valid approved HFE letter found for this flat type.'
                )
                print(f'[Step 3] HFE check FAILED: {hfe_note}')
            else:
                print(f'[Step 3] HFE check PASSED – letter: {hfe_result.get("hfe_letter_id")}')
        else:
            print(f'[Step 3] HFE service returned {hfe_resp.status_code}, defaulting to pass.')
    except Exception as e:
        print(f'[Step 3] HFE Application Service unavailable: {e}, defaulting to pass.')

    print(f'\n[Step 4] Calling Eligibility Service (ICA / IRAS / CPF / SLA)...')
    elig_result = {}
    elig_is_eligible = True
    elig_note = ''

    try:
        elig_resp = requests.post(
            f'{ELIGIBILITY_URL}/eligibility/check',
            json={
                'application_id':    application_id,
                'applicant_nric':    applicant_nric,
                'co_applicant_nric': co_applicant_nric,
                'flat_type':         flat_type,
            },
            timeout=30
        )
        if elig_resp.status_code == 200:
            elig_result      = elig_resp.json().get('data', {})
            elig_is_eligible = elig_result.get('is_eligible', True)
            elig_note        = elig_result.get('note', '')
            print(f'[Step 4] Eligibility Service: {"PASS" if elig_is_eligible else "FAIL"}')
            if not elig_is_eligible:
                print(f'         Reason: {elig_note}')
        else:
            print(f'[Step 4] Eligibility Service returned {elig_resp.status_code}, defaulting to pass.')
    except Exception as e:
        print(f'[Step 4] Eligibility Service unavailable: {e}, defaulting to pass.')

    failed_checks = []

    if not hfe_valid:
        failed_checks.append(f'HFE letter invalid: {hfe_note}')

    if not elig_is_eligible:
        for reason in elig_note.split(' | '):
            if reason.strip():
                failed_checks.append(reason.strip())

    is_eligible = len(failed_checks) == 0

    overall_note = (
        'All eligibility checks passed.'
        if is_eligible
        else ' | '.join(failed_checks)
    )

    print(f'\n[Step 5] Final result: {"ELIGIBLE" if is_eligible else "INELIGIBLE"}')
    if not is_eligible:
        print(f'         Reasons: {overall_note}')

    print(f'\n[Step 6] Updating BallotApplication eligibility result...')
    result_str = 'ELIGIBLE' if is_eligible else 'INELIGIBLE'

    try:
        update_resp = requests.put(
            f'{BALLOT_APP_URL}/ballot-application/{application_id}/eligibility',
            json={
                'eligibility_result': result_str,
                'note':               overall_note,
            },
            timeout=10
        )
        if update_resp.status_code == 200:
            print(f'[Step 6] BallotApplication updated to {result_str}')
        else:
            print(f'[Step 6] Warning: update returned {update_resp.status_code}')
    except Exception as e:
        print(f'[Step 6] Warning: could not update BallotApplication: {e}')

    return jsonify({
        'code': 200,
        'data': {
            'application_id':    application_id,
            'applicant_id':      applicant_id,
            'flat_type':         flat_type,
            'is_eligible':       is_eligible,
            'eligibility_result': result_str,
            'failed_checks':     failed_checks,
            'note':              overall_note,
            'checks': {
                'hfe_valid':        hfe_valid,
                'ica_pass':         elig_result.get('ica_pass'),
                'iras_pass':        elig_result.get('iras_pass'),
                'cpf_pass':         elig_result.get('cpf_pass'),
                'sla_pass':         elig_result.get('sla_pass'),
                'hfe_pass':         elig_result.get('hfe_pass'),
            }
        }
    })


# Convenience: GET result for an existing application

@app.route('/check-eligibility/<int:application_id>', methods=['GET'])
def get_eligibility_result(application_id):
    """
    Retrieve the stored eligibility result for a ballot application.
        ---
    parameters:
      - name: application_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Eligibility result returned
      404:
        description: Application not found
    """
    try:
        ba_resp = requests.get(
            f'{BALLOT_APP_URL}/ballot-application/{application_id}',
            timeout=10
        )
        ba_data = ba_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'Ballot Application Service unavailable: {e}'}), 503

    if ba_resp.status_code != 200:
        return jsonify({'code': 404, 'message': 'Application not found.'}), 404

    record = ba_data['data']
    return jsonify({
        'code': 200,
        'data': {
            'application_id':     application_id,
            'eligibility_result': record.get('eligibility_result'),
            'status':             record.get('status'),
            'note':               record.get('note'),
        }
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5016, debug=True)
