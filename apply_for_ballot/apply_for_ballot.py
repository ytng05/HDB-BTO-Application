"""Composite microservice (port 5015)"""

import json
import os

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger

app = Flask(__name__)
CORS(app)

app.config['SWAGGER'] = {
    'title': 'Apply for Ballot Service API',
    'version': '1.0',
    'openapi': '3.0.2',
    'description': (
        'Composite – orchestrates BTO ballot application submission: '
        'payment, document verification, eligibility check, and notification.'
    )
}
swagger = Swagger(app)

APPLICANT_URL         = os.environ.get('APPLICANT_URL',         'http://localhost:5001')
NETS_URL              = os.environ.get('NETS_URL',              'http://localhost:5003')
BALLOT_APP_URL        = os.environ.get('BALLOT_APP_URL',        'http://localhost:5010')
HFE_APP_URL           = os.environ.get('HFE_APP_URL',           'http://localhost:5011')
DOC_WRAPPER_URL       = os.environ.get('DOC_WRAPPER_URL',       'http://localhost:5012')
NOTIFICATION_URL      = os.environ.get('NOTIFICATION_URL',      'http://localhost:5013')
CHECK_ELIGIBILITY_URL = os.environ.get('CHECK_ELIGIBILITY_URL', 'http://localhost:5016')

RABBITMQ_HOST    = os.environ.get('RABBITMQ_HOST',    'localhost')
RABBITMQ_PORT    = int(os.environ.get('RABBITMQ_PORT', 5672))
EXCHANGE_NAME    = 'bto_notifications'

BALLOT_FEE       = 10.00   # SGD application fee


# AMQP helper

def publish_event(routing_key: str, payload: dict):
    """Publish a notification event; falls back to HTTP if RabbitMQ unavailable."""
    try:
        import pika
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT)
        )
        channel = connection.channel()
        channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic', durable=True)
        channel.basic_publish(
            exchange=EXCHANGE_NAME,
            routing_key=routing_key,
            body=json.dumps(payload),
        )
        connection.close()
        print(f'[AMQP] Published: {routing_key}')
    except Exception as e:
        print(f'[AMQP] Failed ({e}); falling back to HTTP notification.')
        try:
            requests.post(
                f'{NOTIFICATION_URL}/notify',
                json={**payload, 'event_type': routing_key},
                timeout=5
            )
        except Exception as http_e:
            print(f'[HTTP NOTIFY] Also failed: {http_e}')


# Main orchestration endpoint

@app.route('/ballot/apply', methods=['POST'])
def apply_for_ballot():
    """
    Submit a BTO ballot application (full orchestration – Steps 1-15).
        ---
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [applicant_id, flat_type, bto_project_id]
            properties:
              applicant_id:
                type: integer
                description: Primary applicant's ID
              co_applicant_id:
                type: integer
                description: Partner's applicant ID (optional)
              flat_type:
                type: string
                example: 4-Room
              bto_project_id:
                type: integer
              documents:
                type: object
                description: >
                  Optional documents for OCR verification.
                  Keys: nric, marriage_certificate, income_document
    responses:
      200:
        description: Application submitted and eligibility determined
      400:
        description: Validation error / payment failed / document failure
      503:
        description: A downstream service is unavailable
    """
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': 'Request body required.'}), 400

    applicant_id    = data.get('applicant_id')
    co_applicant_id = data.get('co_applicant_id')
    flat_type       = data.get('flat_type')
    bto_project_id  = data.get('bto_project_id')
    documents       = data.get('documents', {})

    if not applicant_id or not flat_type or not bto_project_id:
        return jsonify({
            'code': 400,
            'message': "'applicant_id', 'flat_type', and 'bto_project_id' are required."
        }), 400

    print(f'\n{"="*60}')
    print(f'[APPLY-FOR-BALLOT] applicant={applicant_id}, flat={flat_type}')
    print(f'{"="*60}')

    print(f'\n[Step 13] Fetching applicant details...')
    applicant_info = {}
    try:
        resp = requests.get(f'{APPLICANT_URL}/applicant/{applicant_id}', timeout=10)
        if resp.status_code == 200:
            applicant_info = resp.json().get('data', {})
    except Exception as e:
        print(f'[Step 13] Warning: could not fetch applicant: {e}')

    applicant_nric  = applicant_info.get('nric', '')
    applicant_email = applicant_info.get('email', '')
    applicant_phone = applicant_info.get('mobile_number', '')

    print(f'\n[Step 2] Processing ballot application fee (SGD {BALLOT_FEE})...')
    transaction_id = None

    try:
        pay_resp = requests.post(
            f'{NETS_URL}/payment',
            json={
                'applicant_id': applicant_id,
                'amount':       BALLOT_FEE,
                'description':  f'BTO Ballot Application Fee – {flat_type}',
            },
            timeout=15
        )
        pay_data = pay_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'NETS Payment Service unavailable: {e}'}), 503

    if pay_resp.status_code != 200:
        print(f'[Step 3] Payment FAILED.')
        publish_event('ballot.submitted', {
            'email': applicant_email,
            'phone': applicant_phone,
            'status': 'PAYMENT_FAILED',
            'message': 'Ballot application fee payment failed.',
        })
        return jsonify({
            'code': 402,
            'message': 'Payment failed. Ballot application not submitted.',
            'data': pay_data.get('data', {})
        }), 402

    transaction_id = pay_data.get('data', {}).get('transaction_id', '')
    print(f'[Step 3] Payment successful. Transaction: {transaction_id}')

    print(f'\n[Step 4] Verifying documents...')
    doc_verified = True

    if documents:
        try:
            doc_resp = requests.post(
                f'{DOC_WRAPPER_URL}/document/verify',
                json={'applicant_id': applicant_id, 'documents': documents},
                timeout=15
            )
            if doc_resp.status_code == 200:
                doc_verified = doc_resp.json().get('data', {}).get('all_verified', True)
        except Exception as e:
            print(f'[Step 4] Document Service unreachable: {e}, proceeding.')
    else:
        print('[Step 4] No documents provided, skipping OCR step.')

    print(f'\n[Step 5] Creating BallotApplication record...')
    try:
        ba_resp = requests.post(
            f'{BALLOT_APP_URL}/ballot-application',
            json={
                'applicant_id':    applicant_id,
                'co_applicant_id': co_applicant_id,
                'flat_type':       flat_type,
                'bto_project_id':  bto_project_id,
            },
            timeout=10
        )
        ba_data = ba_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'Ballot Application Service unavailable: {e}'}), 503

    if ba_resp.status_code != 201:
        return jsonify({
            'code': ba_data.get('code', 500),
            'message': ba_data.get('message', 'Failed to create ballot application.')
        }), ba_resp.status_code

    ba_record      = ba_data['data']
    application_id = ba_record['application_id']
    print(f'[Step 5] BallotApplication created: application_id={application_id}')

    # Update payment details on the ballot application
    try:
        requests.put(
            f'{BALLOT_APP_URL}/ballot-application/{application_id}/payment',
            json={'transaction_id': transaction_id, 'payment_amount': BALLOT_FEE},
            timeout=10
        )
    except Exception as e:
        print(f'[Step 5] Warning: could not update payment on ballot: {e}')

    # Notify applicant: application received
    publish_event('ballot.submitted', {
        'email':          applicant_email,
        'phone':          applicant_phone,
        'application_id': application_id,
        'bto_project_id': bto_project_id,
        'flat_type':      flat_type,
    })

    print(f'\n[Step 6] Calling Check Eligibility for Ballot composite...')
    try:
        elig_resp = requests.post(
            f'{CHECK_ELIGIBILITY_URL}/check-eligibility',
            json={
                'application_id':    application_id,
                'applicant_id':      applicant_id,
                'applicant_nric':    applicant_nric,
                'co_applicant_nric': '',
            },
            timeout=40
        )
        elig_data = elig_resp.json()
    except Exception as e:
        # Non-fatal: mark as pending so it can be re-run later
        print(f'[Step 6] Check Eligibility composite unreachable: {e}')
        elig_data = {}
        elig_resp = type('obj', (object,), {'status_code': 503})()

    if getattr(elig_resp, 'status_code', 503) == 200:
        elig_result = elig_data.get('data', {})
        is_eligible = elig_result.get('is_eligible', False)
        elig_note   = elig_result.get('note', '')
        result_str  = elig_result.get('eligibility_result', 'ELIGIBLE' if is_eligible else 'INELIGIBLE')
        print(f'[Step 11] Eligibility: {result_str}')
    else:
        is_eligible = None
        elig_note   = 'Eligibility check could not be completed at this time.'
        result_str  = 'PENDING'
        print(f'[Step 11] Eligibility: PENDING (service unavailable)')

    notification_payload = {
        'email':          applicant_email,
        'phone':          applicant_phone,
        'application_id': application_id,
        'note':           elig_note,
    }

    if result_str == 'ELIGIBLE':
        publish_event('ballot.eligible', notification_payload)
    elif result_str == 'INELIGIBLE':
        publish_event('ballot.ineligible', notification_payload)

    print(f'\n[Step 15] Returning result to portal.')
    return jsonify({
        'code': 200,
        'data': {
            'application_id':    application_id,
            'applicant_id':      applicant_id,
            'flat_type':         flat_type,
            'bto_project_id':    bto_project_id,
            'transaction_id':    transaction_id,
            'payment_amount':    BALLOT_FEE,
            'eligibility_result': result_str,
            'note':              elig_note,
            'document_verified': doc_verified,
            'message': (
                'Ballot application submitted successfully. You are eligible for the ballot.'
                if result_str == 'ELIGIBLE'
                else 'Ballot application submitted, but you do not meet eligibility criteria.'
                if result_str == 'INELIGIBLE'
                else 'Ballot application submitted. Eligibility check is pending.'
            )
        }
    })


# Utility endpoint: re-run eligibility for an existing application

@app.route('/ballot/check-eligibility/<int:application_id>', methods=['POST'])
def recheck_eligibility(application_id):
    """
    Re-run eligibility check for an existing ballot application.
        ---
    parameters:
      - name: application_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Eligibility re-checked
      404:
        description: Application not found
    """
    # Fetch the ballot application
    try:
        ba_resp = requests.get(
            f'{BALLOT_APP_URL}/ballot-application/{application_id}', timeout=10
        )
        ba_data = ba_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'Ballot Application Service unavailable: {e}'}), 503

    if ba_resp.status_code != 200:
        return jsonify({'code': 404, 'message': 'Application not found.'}), 404

    record         = ba_data['data']
    applicant_id   = record['applicant_id']
    flat_type      = record['flat_type']

    # Get applicant NRIC
    applicant_nric = ''
    try:
        a_resp = requests.get(f'{APPLICANT_URL}/applicant/{applicant_id}', timeout=10)
        if a_resp.status_code == 200:
            applicant_nric = a_resp.json().get('data', {}).get('nric', '')
    except Exception:
        pass

    # Re-run eligibility
    try:
        elig_resp = requests.post(
            f'{CHECK_ELIGIBILITY_URL}/check-eligibility',
            json={
                'application_id': application_id,
                'applicant_id':   applicant_id,
                'applicant_nric': applicant_nric,
            },
            timeout=30
        )
        elig_data = elig_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'Eligibility Service unavailable: {e}'}), 503

    if elig_resp.status_code == 200:
        elig_result = elig_data.get('data', {})
        is_eligible = elig_result.get('is_eligible', False)
        elig_note   = elig_result.get('note', '')
        result_str  = elig_result.get('eligibility_result', 'ELIGIBLE' if is_eligible else 'INELIGIBLE')

        return jsonify({
            'code': 200,
            'data': {
                'application_id':    application_id,
                'eligibility_result': result_str,
                'note':              elig_note,
            }
        })

    return jsonify({'code': 500, 'message': 'Eligibility check failed.'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5015, debug=True)
