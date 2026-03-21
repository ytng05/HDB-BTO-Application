from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os

app = Flask(__name__)
CORS(app)

# ============================================================
# This is a WRAPPER service - it wraps the external NETS Payment API.
# Since we don't have a real NETS API, we simulate the payment.
# In production, this would make an HTTPS call to NETS.
#
# Diagram steps:
#   12. Flat Allocation -> NETS Payment Service (HTTP POST)
#   13. NETS Payment Service -> NETS Payment API (HTTPS) 
#   14. NETS Payment API -> NETS Payment Service (HTTPS response)
#   15a/15b. NETS Payment Service -> Flat Allocation (HTTP response)
# ============================================================


def call_nets_api(amount, applicant_id, description):
    """
    Simulates calling the external NETS Payment API (Step 13-14).
    In a real implementation, this would be an HTTPS request to NETS.
    
    Returns True for success, False for failure.
    We simulate a 90% success rate.
    """
    # Simulate external API call
    success = random.random() < 0.9 # 90% success rate
    
    if success:
        # Simulated transaction ID from NETS
        transaction_id = f"NETS-{random.randint(100000, 999999)}"
        return {
            "success": True,
            "transaction_id": transaction_id,
            "amount": amount,
            "message": "Payment processed successfully."
        }
    else:
        return {
            "success": False,
            "transaction_id": None,
            "amount": amount,
            "message": "Payment declined by NETS. Insufficient funds or card error."
        }


# ============================================================
# POST /payment - Process a payment (Step 12)
# Body: { "applicant_id": "APP-2025-001", "amount": 2000.00, "description": "Option fee" }
# ============================================================
@app.route('/payment', methods=['POST'])
def process_payment():
    data = request.get_json()

    # Validate required fields
    required = ['applicant_id', 'amount']
    for field in required:
        if not data or field not in data:
            return jsonify({
                "code": 400,
                "message": f"{field} is required."
            }), 400

    applicant_id = data['applicant_id']
    amount = float(data['amount'])
    description = data.get('description', 'BTO Option Fee')

    if amount <= 0:
        return jsonify({
            "code": 400,
            "message": "Amount must be greater than 0."
        }), 400

    try:
        # Call the external NETS API (simulated)
        nets_result = call_nets_api(amount, applicant_id, description)

        if nets_result['success']:
            # Step 15a: Payment success
            return jsonify({
                "code": 200,
                "data": {
                    "applicant_id": applicant_id,
                    "amount": amount,
                    "transaction_id": nets_result['transaction_id'],
                    "status": "success",
                    "message": nets_result['message']
                }
            }), 200
        else:
            # Step 15b: Payment failed
            return jsonify({
                "code": 402,
                "data": {
                    "applicant_id": applicant_id,
                    "amount": amount,
                    "transaction_id": None,
                    "status": "failed",
                    "message": nets_result['message']
                }
            }), 402

    except Exception as e:
        return jsonify({
            "code": 500,
            "message": f"Payment service error: {str(e)}"
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
