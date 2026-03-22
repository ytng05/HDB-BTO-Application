"""Composite microservice (port 5014)"""

import json
import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger

app = Flask(__name__)
CORS(app)

app.config['SWAGGER'] = {
    'title': 'HFE Service API',
    'version': '1.0',
    'openapi': '3.0.2',
    'description': (
        'Composite – orchestrates HFE application submission, '
        'document verification, eligibility checks, and outcome notification.'
    )
}
swagger = Swagger(app)

HFE_APP_URL      = os.environ.get('HFE_APP_URL',      'http://localhost:5011')
DOC_WRAPPER_URL  = os.environ.get('DOC_WRAPPER_URL',  'http://localhost:5012')
ELIGIBILITY_URL  = os.environ.get('ELIGIBILITY_URL',  'http://localhost:5004')
NOTIFICATION_URL = os.environ.get('NOTIFICATION_URL', 'http://localhost:5013')
APPLICANT_URL    = os.environ.get('APPLICANT_URL',    'http://localhost:5001')

RABBITMQ_HOST    = os.environ.get('RABBITMQ_HOST',    'localhost')
RABBITMQ_PORT    = int(os.environ.get('RABBITMQ_PORT', 5672))
EXCHANGE_NAME    = 'bto_notifications'


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

@app.route('/hfe/apply', methods=['POST'])
def apply_hfe():
    """
    Submit a new HFE application (full orchestration – Steps 1-9).
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
                example: 4-Room
              documents:
                type: object
                description: >
                  Map of document_type to document data for OCR verification.
                  Keys: nric, marriage_certificate, income_document
    responses:
      200:
        description: HFE application processed (approved or rejected)
      400:
        description: Missing required fields or document verification failed
      503:
        description: A downstream service is unavailable
    """
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': 'Request body required.'}), 400

    applicant_id    = data.get('applicant_id')
    co_applicant_id = data.get('co_applicant_id')
    flat_type       = data.get('flat_type')
    documents       = data.get('documents', {})

    if not applicant_id or not flat_type:
        return jsonify({
            'code': 400,
            'message': "'applicant_id' and 'flat_type' are required."
        }), 400

    print(f'\n{"="*60}')
    print(f'[HFE SERVICE] New application – applicant {applicant_id}, flat {flat_type}')
    print(f'{"="*60}')

    applicant_info = {}
    try:
        resp = requests.get(f'{APPLICANT_URL}/applicant/{applicant_id}', timeout=10)
        if resp.status_code == 200:
            applicant_info = resp.json().get('data', {})
    except Exception as e:
        print(f'[Step 2] Warning: could not fetch applicant info: {e}')

    applicant_nric    = applicant_info.get('nric', '')
    applicant_email   = applicant_info.get('email', '')
    applicant_phone   = applicant_info.get('mobile_number', '')

    print(f'\n[Step 2] Creating HFE application record...')
    try:
        hfe_resp = requests.post(
            f'{HFE_APP_URL}/hfe-application',
            json={
                'applicant_id':    applicant_id,
                'co_applicant_id': co_applicant_id,
                'flat_type':       flat_type,
            },
            timeout=10
        )
        hfe_data = hfe_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'HFE Application Service unavailable: {e}'}), 503

    if hfe_resp.status_code != 201:
        return jsonify({
            'code': hfe_data.get('code', 500),
            'message': hfe_data.get('message', 'Failed to create HFE application.')
        }), hfe_resp.status_code

    hfe_record = hfe_data['data']
    hfe_id     = hfe_record['hfe_id']
    print(f'[Step 2] HFE record created: hfe_id={hfe_id}')

    print(f'\n[Step 3] Verifying documents...')
    doc_verified = True
    doc_note     = ''

    if documents:
        try:
            doc_resp = requests.post(
                f'{DOC_WRAPPER_URL}/document/verify',
                json={
                    'applicant_id': applicant_id,
                    'documents':    documents,
                },
                timeout=15
            )
            doc_data = doc_resp.json()

            if doc_resp.status_code == 200:
                doc_verified = doc_data.get('data', {}).get('all_verified', True)
                if not doc_verified:
                    doc_note = 'One or more documents could not be verified by OCR.'
                    print(f'[Step 3] Document verification FAILED')
            else:
                print(f'[Step 3] Document Service returned {doc_resp.status_code}, continuing.')
        except Exception as e:
            print(f'[Step 3] Document Service unreachable: {e}, continuing.')
    else:
        print(f'[Step 3] No documents provided; skipping OCR check.')

    # If documents fail, reject immediately
    if not doc_verified:
        try:
            requests.put(
                f'{HFE_APP_URL}/hfe-application/{hfe_id}/reject',
                json={'rejection_reason': doc_note},
                timeout=10
            )
        except Exception:
            pass

        publish_event('hfe.rejected', {
            'email': applicant_email,
            'phone': applicant_phone,
            'rejection_reason': doc_note,
        })

        return jsonify({
            'code': 400,
            'message': 'Document verification failed. HFE application rejected.',
            'data': {'hfe_id': hfe_id, 'status': 'REJECTED', 'reason': doc_note}
        }), 400

    print(f'\n[Steps 4-5] Running eligibility checks...')

    if not applicant_nric:
        print('[Step 4] Warning: applicant NRIC not available, eligibility checks may be limited.')

    try:
        elig_resp = requests.post(
    f'{ELIGIBILITY_URL}/eligibility/check',
    json={
        'application_id': applicant_id,
        'applicant_nric': applicant_nric,
        'flat_type':      flat_type,
    },
    timeout=20
    )
        elig_data = elig_resp.json()
    except Exception as e:
        return jsonify({'code': 503, 'message': f'Eligibility Service unavailable: {e}'}), 503

    if elig_resp.status_code != 200:
        return jsonify({
            'code': elig_data.get('code', 500),
            'message': elig_data.get('message', 'Eligibility check failed.')
        }), elig_resp.status_code

    elig_result  = elig_data.get('data', {})
    is_eligible  = elig_result.get('is_eligible', False)
    elig_note    = elig_result.get('note', '')

    print(f'[Step 5] Eligibility result: {"PASS" if is_eligible else "FAIL"} – {elig_note}')

    if is_eligible:
        print(f'\n[Step 7a] Approving HFE application...')
        try:
            approve_resp = requests.put(
                f'{HFE_APP_URL}/hfe-application/{hfe_id}/approve',
                json={
                    'estimated_grant': 80000,
                },
                timeout=10
            )
            approved_record = approve_resp.json().get('data', {})
        except Exception as e:
            return jsonify({'code': 503, 'message': f'HFE Application Service error: {e}'}), 503

        publish_event('hfe.approved', {
            'email':           applicant_email,
            'phone':           applicant_phone,
            'hfe_letter_id':   approved_record.get('hfe_letter_id', ''),
            'max_loan_amount': approved_record.get('max_loan_amount', 0),
            'estimated_grant': approved_record.get('estimated_grant', 0),
            'validity_end':    approved_record.get('validity_end', ''),
        })

        print(f'[Step 9] Returning approval to portal.')
        return jsonify({
            'code': 200,
            'data': {
                'status':        'APPROVED',
                'hfe_id':        hfe_id,
                'hfe_letter_id': approved_record.get('hfe_letter_id'),
                'max_loan_amount': approved_record.get('max_loan_amount'),
                'estimated_grant': approved_record.get('estimated_grant'),
                'validity_end':  approved_record.get('validity_end'),
                'message':       'Your HFE application has been approved.',
            }
        })

    else:
        print(f'\n[Step 7b] Rejecting HFE application...')
        try:
            requests.put(
                f'{HFE_APP_URL}/hfe-application/{hfe_id}/reject',
                json={'rejection_reason': elig_note},
                timeout=10
            )
        except Exception:
            pass

        publish_event('hfe.rejected', {
            'email':            applicant_email,
            'phone':            applicant_phone,
            'rejection_reason': elig_note,
        })

        print(f'[Step 9] Returning rejection to portal.')
        return jsonify({
            'code': 200,
            'data': {
                'status':           'REJECTED',
                'hfe_id':           hfe_id,
                'rejection_reason': elig_note,
                'message':          'Your HFE application has been rejected.',
            }
        })


# Verify HFE endpoint (called by Eligibility Service – Step 9 of Apply-for-BTO)

@app.route('/hfe/verify', methods=['GET'])
def verify_hfe():
    """
    Check if an applicant has a valid approved HFE letter for a flat type.
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
        description: HFE verification result
    """
    application_id = request.args.get('application_id')
    flat_type      = request.args.get('flat_type')
    nric           = request.args.get('nric')

    if not application_id or not flat_type:
        return jsonify({'code': 400, 'message': "'application_id' and 'flat_type' are required."}), 400

    try:
        resp = requests.get(
            f'{HFE_APP_URL}/hfe-application/verify',
            params={'application_id': application_id, 'flat_type': flat_type},
            timeout=10
        )
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({
            'code': 200,
            'data': {'hfe_eligible': True, 'note': f'HFE App Service unavailable: {e}; dev default pass.'}
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5014, debug=True)
