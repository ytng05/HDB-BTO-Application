from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import json
import os
import time

app = Flask(__name__)
CORS(app)

# In-memory log of notifications sent (for demo purposes)
notification_log = []

RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.environ.get('RABBITMQ_PORT', 5672))
EXCHANGE_NAME = 'flat_allocation'
QUEUE_NAME = 'notification_queue'


def send_notification(recipient_email, recipient_phone, subject, message, event_type):
    """
    Simulates sending an email/SMS notification.
    In production, this would call an email API (e.g. SendGrid) or SMS API (e.g. Twilio).
    """
    notification = {
        "recipient_email": recipient_email,
        "recipient_phone": recipient_phone,
        "subject": subject,
        "message": message,
        "event_type": event_type,
        "status": "sent"
    }
    notification_log.append(notification)
    print(f"[NOTIFICATION] To: {recipient_email} | Subject: {subject}")
    print(f"[NOTIFICATION] Message: {message}")
    return notification


def start_amqp_consumer():
    """
    Starts consuming messages from RabbitMQ.
    Listens for FlatConfirmed and PaymentFailed events.
    """
    try:
        import pika

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT)
        )
        channel = connection.channel()

        # Declare exchange and queue
        channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic', durable=True)
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        # Bind to relevant events
        channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME, routing_key='flat.confirmed')
        channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME, routing_key='payment.failed')

        def callback(ch, method, properties, body):
            event = json.loads(body)
            event_type = method.routing_key
            print(f"[AMQP] Received event: {event_type}")

            if event_type == 'flat.confirmed':
                send_notification(
                    recipient_email=event.get('email', 'unknown'),
                    recipient_phone=event.get('phone', 'unknown'),
                    subject='Flat Selection Confirmed',
                    message=f"Congratulations! Your flat (ID: {event.get('flat_id')}) has been successfully reserved. Please proceed with the next steps.",
                    event_type=event_type
                )

            elif event_type == 'payment.failed':
                send_notification(
                    recipient_email=event.get('email', 'unknown'),
                    recipient_phone=event.get('phone', 'unknown'),
                    subject='Payment Failed - Flat Selection',
                    message=f"Your payment for flat (ID: {event.get('flat_id')}) has failed. Your reservation has been cancelled. Please try again.",
                    event_type=event_type
                )

            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)
        print(f"[AMQP] Notification Service listening on queue: {QUEUE_NAME}")
        channel.start_consuming()

    except ImportError:
        print("[AMQP] pika not installed - AMQP consumer disabled. Install with: pip install pika")
    except Exception as e:
        print(f"[AMQP] Could not connect to RabbitMQ: {e}")
        print("[AMQP] AMQP consumer disabled. HTTP endpoint still works for testing.")


# ============================================================
# POST /notify - Send a notification via HTTP (for testing without RabbitMQ)
# Body: { "email": "...", "phone": "...", "subject": "...", "message": "...", "event_type": "..." }
# ============================================================
@app.route('/notify', methods=['POST'])
def notify():
    data = request.get_json()

    if not data:
        return jsonify({
            "code": 400,
            "message": "Request body is required."
        }), 400

    notification = send_notification(
        recipient_email=data.get('email', 'unknown'),
        recipient_phone=data.get('phone', 'unknown'),
        subject=data.get('subject', 'Notification'),
        message=data.get('message', ''),
        event_type=data.get('event_type', 'manual')
    )

    return jsonify({
        "code": 200,
        "data": notification
    }), 200


# ============================================================
# GET /notifications - View all sent notifications (for demo)
# ============================================================
@app.route('/notifications', methods=['GET'])
def get_notifications():
    return jsonify({
        "code": 200,
        "data": notification_log
    }), 200


if __name__ == '__main__':
    # Start AMQP consumer in background thread (won't crash if RabbitMQ isn't running)
    amqp_thread = threading.Thread(target=start_amqp_consumer, daemon=True)
    amqp_thread.start()

    app.run(host='0.0.0.0', port=5004, debug=True, use_reloader=False)
