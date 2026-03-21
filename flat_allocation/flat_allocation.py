from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# Service URLs - env vars for Docker, localhost for local dev
FLAT_AVAILABILITY_URL = os.environ.get('FLAT_AVAILABILITY_URL', 'http://localhost:5001')
APPLICANT_URL = os.environ.get('APPLICANT_URL', 'http://localhost:5003')
FLAT_SELECTION_URL = os.environ.get('FLAT_SELECTION_URL', 'http://localhost:5002')
NETS_PAYMENT_URL = os.environ.get('NETS_PAYMENT_URL', 'http://localhost:5004')
NOTIFICATION_URL = os.environ.get('NOTIFICATION_URL', 'http://localhost:5005')

RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.environ.get('RABBITMQ_PORT', 5672))
EXCHANGE_NAME = 'flat_allocation'


def publish_event(routing_key, message):
    """
    Publish an event to RabbitMQ (Steps 16a / 20b).
    Falls back to HTTP notification if RabbitMQ is not available.
    """
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
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)  # persistent
        )

        connection.close()
        print(f"[AMQP] Published event: {routing_key}")
        return True

    except Exception as e:
        print(f"[AMQP] Failed to publish: {e}. Falling back to HTTP notification.")
        # Fallback: send notification via HTTP
        try:
            event_type = 'flat.confirmed' if 'confirmed' in routing_key else 'payment.failed'
            requests.post(f"{NOTIFICATION_URL}/notify", json={
                "email": message.get('email', ''),
                "phone": message.get('phone', ''),
                "subject": "Flat Confirmed" if event_type == 'flat.confirmed' else "Payment Failed",
                "message": str(message),
                "event_type": event_type
            })
        except:
            pass
        return False


# ============================================================
# POST /select-flat - The main orchestration endpoint (Steps 5-21)
#
# This is what the HDB Flat Portal calls when a customer selects a flat.
# It orchestrates the entire flow:
#   Step 6:  Check flat availability
#   Step 7:  If unavailable -> return error (8b)
#   Step 8a: Reserve the flat
#   Step 10: Update applicant's reservation details
#   Step 12: Charge payment via NETS
#   Step 15a: Payment success -> publish FlatConfirmed (16a) -> return success (17a)
#   Step 15b: Payment failed -> unreserve flat (16b) -> undo application (18b) 
#             -> publish PaymentFailed (20b) -> return failure (21b)
#
# Body: {
#   "applicant_id": "APP-2025-001",
#   "flat_id": 1,
#   "payment_amount": 2000.00
# }
# ============================================================
@app.route('/select-flat', methods=['POST'])
def select_flat():
    data = request.get_json()

    # Validate input
    required = ['applicant_id', 'selection_id', 'flat_id', 'payment_amount']
    for field in required:
        if not data or field not in data:
            return jsonify({
                "code": 400,
                "message": f"{field} is required."
            }), 400

    applicant_id = data['applicant_id']
    selection_id = data['selection_id']
    flat_id = data['flat_id']
    payment_amount = float(data['payment_amount'])

    print(f"\n{'='*60}")
    print(f"[ORCHESTRATOR] Starting flat selection")
    print(f"  Application: {applicant_id}")
    print(f"  Flat: {flat_id}")
    print(f"  Payment: ${payment_amount}")
    print(f"{'='*60}")

    # ----------------------------------------------------------
    # Step 6: Check if selected flat is still available
    # ----------------------------------------------------------
    print(f"\n[Step 6] Checking flat {flat_id} availability...")
    try:
        flat_response = requests.get(f"{FLAT_AVAILABILITY_URL}/flats/{flat_id}")
        flat_data = flat_response.json()
    except Exception as e:
        return jsonify({
            "code": 503,
            "message": f"Flat Availability Service unavailable: {str(e)}"
        }), 503

    if flat_response.status_code != 200:
        return jsonify({
            "code": flat_data.get('code', 404),
            "message": flat_data.get('message', 'Flat not found.')
        }), flat_response.status_code

    # Step 7a/7b: Check availability status
    flat_info = flat_data['data']
    if flat_info['status'] != 'available':
        # Step 7b + 8b: Flat is unavailable, return error
        print(f"[Step 7b] Flat {flat_id} is NOT available (status: {flat_info['status']})")
        return jsonify({
            "code": 409,
            "message": f"Flat {flat_id} is no longer available. Status: {flat_info['status']}. Please select another flat."
        }), 409

    print(f"[Step 7a] Flat {flat_id} is available")

    # ----------------------------------------------------------
    # Step 8a: Reserve the flat
    # ----------------------------------------------------------
    print(f"\n[Step 8a] Reserving flat {flat_id}...")
    try:
        reserve_response = requests.put(
            f"{FLAT_AVAILABILITY_URL}/flats/{flat_id}/reserve",
            json={"applicant_id": applicant_id, "selection_id": selection_id}
        )
        reserve_data = reserve_response.json()
    except Exception as e:
        return jsonify({
            "code": 503,
            "message": f"Failed to reserve flat: {str(e)}"
        }), 503

    if reserve_response.status_code != 200:
        # Step 9 failed
        print(f"[Step 8a] FAILED to reserve flat: {reserve_data.get('message')}")
        return jsonify({
            "code": reserve_data.get('code', 500),
            "message": reserve_data.get('message', 'Failed to reserve flat.')
        }), reserve_response.status_code

    print(f"[Step 9] Flat reserved successfully")

    # ----------------------------------------------------------
    # Step 10: Update applicant's flat reservation details
    # ----------------------------------------------------------
    print(f"\n[Step 10] Updating flat selection {selection_id} with flat {flat_id}...")
    try:
        app_response = requests.put(
            f"{FLAT_SELECTION_URL}/flat-selection/{selection_id}/reserve",
            json={"flat_id": flat_id}
        )
        app_data = app_response.json()
    except Exception as e:
        # Compensation: unreserve the flat
        print(f"[COMPENSATION] Application Service failed. Unreserving flat...")
        requests.put(f"{FLAT_AVAILABILITY_URL}/flats/{flat_id}/unreserve")
        return jsonify({
            "code": 503,
            "message": f"Application Service unavailable: {str(e)}"
        }), 503

    if app_response.status_code != 200:
        # Compensation: unreserve the flat
        print(f"[COMPENSATION] Application update failed. Unreserving flat...")
        requests.put(f"{FLAT_AVAILABILITY_URL}/flats/{flat_id}/unreserve")
        return jsonify({
            "code": app_data.get('code', 500),
            "message": app_data.get('message', 'Failed to update applicant.')
        }), app_response.status_code

    print(f"[Step 11] Application updated successfully")

    # ----------------------------------------------------------
    # Step 12: Charge option fee via NETS Payment Service
    # ----------------------------------------------------------
    print(f"\n[Step 12] Processing payment of ${payment_amount}...")
    try:
        payment_response = requests.post(
            f"{NETS_PAYMENT_URL}/payment",
            json={
                "applicant_id": applicant_id,
                "amount": payment_amount,
                "description": f"BTO Option Fee for Flat {flat_id}"
            }
        )
        payment_data = payment_response.json()
    except Exception as e:
        # Compensation: unreserve flat + undo application
        print(f"[COMPENSATION] Payment Service failed. Rolling back...")
        requests.put(f"{FLAT_AVAILABILITY_URL}/flats/{flat_id}/unreserve")
        requests.put(f"{FLAT_SELECTION_URL}/flat-selection/{selection_id}/undo-reserve")
        return jsonify({
            "code": 503,
            "message": f"Payment Service unavailable: {str(e)}"
        }), 503

    # ----------------------------------------------------------
    # Step 15a: Payment SUCCESS
    # ----------------------------------------------------------
    if payment_response.status_code == 200:
        print(f"[Step 15a] Payment successful!")
        transaction_id = payment_data['data']['transaction_id']

        # Get applicant details for notification
        try:
            applicant_resp = requests.get(f"{APPLICANT_URL}/applicant/{applicant_id}")
            applicant_info = applicant_resp.json().get('data', {})
        except:
            applicant_info = {}

        # Step 16a: Publish FlatConfirmed event via RabbitMQ
        print(f"[Step 16a] Publishing FlatConfirmed event...")
        publish_event('flat.confirmed', {
            "applicant_id": applicant_id,
            "flat_id": flat_id,
            "transaction_id": transaction_id,
            "amount": payment_amount,
            "email": applicant_info.get('email', ''),
            "phone": applicant_info.get('mobile_number', '')
        })

        # Step 17a: Return success to HDB Portal
        print(f"\n[Step 17a] Returning success to portal")
        return jsonify({
            "code": 200,
            "data": {
                "applicant_id": applicant_id,
                "flat_id": flat_id,
                "flat_details": flat_info,
                "transaction_id": transaction_id,
                "payment_amount": payment_amount,
                "status": "confirmed",
                "message": "Flat selection confirmed. Payment processed successfully."
            }
        }), 200

    # ----------------------------------------------------------
    # Step 15b: Payment FAILED -> Compensation flow
    # ----------------------------------------------------------
    else:
        print(f"[Step 15b] Payment FAILED!")

        # Step 16b: Unreserve the flat
        print(f"[Step 16b] Unreserving flat {flat_id}...")
        requests.put(f"{FLAT_AVAILABILITY_URL}/flats/{flat_id}/unreserve")

        # Step 18b: Undo applicant reservation
        print(f"[Step 18b] Undoing applicant reservation...")
        requests.put(f"{FLAT_SELECTION_URL}/flat-selection/{selection_id}/undo-reserve")

        # Get applicant details for notification
        try:
            applicant_resp = requests.get(f"{APPLICANT_URL}/applicant/{applicant_id}")
            applicant_info = applicant_resp.json().get('data', {})
        except:
            applicant_info = {}

        # Step 20b: Publish PaymentFailed event via RabbitMQ
        print(f"[Step 20b] Publishing PaymentFailed event...")
        publish_event('payment.failed', {
            "applicant_id": applicant_id,
            "flat_id": flat_id,
            "amount": payment_amount,
            "reason": payment_data.get('data', {}).get('message', 'Payment failed'),
            "email": applicant_info.get('email', ''),
            "phone": applicant_info.get('mobile_number', '')
        })

        # Step 21b: Return failure to HDB Portal
        print(f"\n[Step 21b] Returning failure to portal")
        return jsonify({
            "code": 402,
            "data": {
                "applicant_id": applicant_id,
                "flat_id": flat_id,
                "status": "payment_failed",
                "message": "Payment failed. Flat reservation has been cancelled. Please try again."
            }
        }), 402


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
