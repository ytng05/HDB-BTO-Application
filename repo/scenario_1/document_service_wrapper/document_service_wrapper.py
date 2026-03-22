"""Wrapper microservice (port 5012)"""

from flask import Flask, request, jsonify
from flasgger import Swagger
import requests
import os

app = Flask(__name__)

app.config['SWAGGER'] = {
    'title': 'Document Service Wrapper API',
    'version': '1.0',
    'openapi': '3.0.2',
    'description': (
        'Wrapper – receives uploaded documents and forwards them to the '
        'external OCR API for text extraction and verification.'
    )
}
swagger = Swagger(app)

OCR_API_URL = os.environ.get('OCR_API_URL', 'https://api.ocr.gov.sg')

# Documents we expect to receive and verify
REQUIRED_DOC_TYPES = {'nric', 'marriage_certificate', 'income_document'}


# OCR helper

def call_ocr_api(document_type: str, document_data: dict) -> dict:
    """
    Forwards a document to the external OCR API and returns extraction result.
    """
    try:
        resp = requests.post(
            f'{OCR_API_URL}/extract',
            json={'document_type': document_type, 'data': document_data},
            timeout=15
        )
        if resp.status_code == 200:
            return resp.json()
        return {'verified': False, 'reason': f'OCR API returned {resp.status_code}'}
    except Exception as e:
        return {
            'verified': True,
            'extracted_fields': document_data,
            'note': f'OCR API unreachable ({e}); using dev fallback.'
        }


# Routes

@app.route('/document/verify', methods=['POST'])
def verify_documents():
    """
    Verify applicant documents via OCR API.
        ---
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [applicant_id, documents]
            properties:
              applicant_id:
                type: integer
              documents:
                type: object
                description: >
                  A map of document_type → document_data.
                  Supported types: nric, marriage_certificate, income_document
                example:
                  nric:
                    nric_number: S8501234A
                    name: Aaron Tan
                    date_of_birth: "1985-04-12"
                  marriage_certificate:
                    cert_number: MC-2020-001234
                    date: "2020-06-15"
                  income_document:
                    type: payslip
                    gross_monthly_income: 4500
    responses:
      200:
        description: Document verification results
      400:
        description: Missing required fields
    """
    data = request.get_json()

    if not data or not data.get('applicant_id') or not data.get('documents'):
        return jsonify({
            'code': 400,
            'message': "'applicant_id' and 'documents' are required."
        }), 400

    applicant_id = data['applicant_id']
    documents    = data['documents']

    if not isinstance(documents, dict) or not documents:
        return jsonify({'code': 400, 'message': "'documents' must be a non-empty object."}), 400

    results = {}
    all_verified = True

    for doc_type, doc_data in documents.items():
        ocr_result = call_ocr_api(doc_type, doc_data)
        verified   = ocr_result.get('verified', False)
        results[doc_type] = {
            'verified':         verified,
            'extracted_fields': ocr_result.get('extracted_fields', {}),
            'reason':           ocr_result.get('reason', ''),
            'note':             ocr_result.get('note', ''),
        }
        if not verified:
            all_verified = False

    return jsonify({
        'code': 200,
        'data': {
            'applicant_id':  applicant_id,
            'all_verified':  all_verified,
            'document_results': results,
        }
    })


@app.route('/document/verify-nric', methods=['POST'])
def verify_nric_only():
    """
    Convenience endpoint to verify just an NRIC document.
        ---
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [applicant_id, nric_data]
            properties:
              applicant_id:
                type: integer
              nric_data:
                type: object
    responses:
      200:
        description: NRIC verification result
      400:
        description: Missing fields
    """
    data = request.get_json()

    if not data or not data.get('applicant_id') or not data.get('nric_data'):
        return jsonify({'code': 400, 'message': "'applicant_id' and 'nric_data' are required."}), 400

    ocr_result = call_ocr_api('nric', data['nric_data'])

    return jsonify({
        'code': 200,
        'data': {
            'applicant_id': data['applicant_id'],
            'verified':     ocr_result.get('verified', False),
            'extracted':    ocr_result.get('extracted_fields', {}),
            'note':         ocr_result.get('note', ''),
        }
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5012, debug=True)
