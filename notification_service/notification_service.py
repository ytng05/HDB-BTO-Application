"""Atomic microservice (port 5013)"""

import json
import os
import threading
from datetime import datetime

from flask import Flask, request, jsonify
from flasgger import Swagger

app = Flask(__name__)

app.config['SWAGGER'] = {
    'title': 'Notification Service API',
    'version': '1.0',
    'openapi': '3.0.2',
    'description': (
        'Atomic service – sends email/SMS notifications via AMQP events '
        'or direct HTTP POST.'
    )
}
swagger = Swagger(app)

RABBITMQ_HOST  = os.environ.get('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT  = int(os.environ.get('RABBITMQ_PORT', 5672))
EXCHANGE_NAME  = 'bto_notifications'

notification_log: list[dict] = []


# Email / SMS sender (stub – replace with SendGrid / Twilio / AWS SES)

def send_email(to_email: str, subject: str, body: str) -> bool:
    """Stub – replace with real email SDK call."""
    print(f'[EMAIL] To: {to_email} | Subject: {subject}')
    print(f'        Body: {body[:120]}...')
    return True


def send_sms(to_phone: str, message: str) -> bool:
    """Stub – replace with real SMS SDK call (e.g. Twilio)."""
    print(f'[SMS] To: {to_phone} | Message: {message[:80]}...')
    return True


def log_notification(event_type: str, recipient_email: str,
                     recipient_phone: str, subject: str, message: str,
                     success: bool):
    notification_log.append({
        'timestamp':       str(datetime.utcnow()),
        'event_type':      event_type,
        'recipient_email': recipient_email,
        'recipient_phone': recipient_phone,
        'subject':         subject,
        'message':         message,
        'success':         success,
    })


# Message templates

TEMPLATES = {
    'hfe.approved': {
        'subject': 'Your HFE Application has been APPROVED',
        'body': (
            'Congratulations! Your HDB Flat Eligibility (HFE) letter has been approved.\n\n'
            'HFE Letter ID : {hfe_letter_id}\n'
            'Max Loan      : SGD {max_loan_amount:,.2f}\n'
            'Est. Grant    : SGD {estimated_grant:,.2f}\n'
            'Valid Until   : {validity_end}\n\n'
            'You may now proceed to apply for a BTO flat.'
        )
    },
    'hfe.rejected': {
        'subject': 'Your HFE Application was NOT Successful',
        'body': (
            'We regret to inform you that your HDB Flat Eligibility (HFE) application '
            'has been rejected.\n\nReason: {rejection_reason}\n\n'
            'You may contact HDB for assistance.'
        )
    },
    'ballot.submitted': {
        'subject': 'BTO Ballot Application Received',
        'body': (
            'Thank you for submitting your BTO ballot application.\n\n'
            'Application ID : {application_id}\n'
            'Project        : {bto_project_id}\n'
            'Flat Type      : {flat_type}\n\n'
            'We will notify you of the ballot results in due course.'
        )
    },
    'ballot.eligible': {
        'subject': 'BTO Ballot Result – You are ELIGIBLE',
        'body': (
            'Congratulations! Your BTO ballot application (ID: {application_id}) '
            'has been shortlisted. You are eligible to select a flat.\n\n'
            'Please log in to the HDB portal to select your preferred unit.'
        )
    },
    'ballot.ineligible': {
        'subject': 'BTO Ballot Result – Not Shortlisted',
        'body': (
            'We regret to inform you that your BTO ballot application '
            '(ID: {application_id}) was not shortlisted in this exercise.\n\n'
            'Reason: {note}\n\n'
            'You may try again in a future BTO exercise.'
        )
    },
}


def dispatch_notification(event_type: str, payload: dict):
    """Build and send the notification for a given event type."""
    template = TEMPLATES.get(event_type)
    if not template:
        print(f'[NOTIFY] Unknown event type: {event_type}')
        return

    try:
        subject = template['subject']
        body    = template['body'].format(**{k: (v if v is not None else '') for k, v in payload.items()})
    except KeyError as e:
        print(f'[NOTIFY] Missing template field: {e}')
        body = str(payload)
        subject = template['subject']

    email = payload.get('email', '')
    phone = payload.get('phone', '')

    email_ok = send_email(email, subject, body) if email else False
    sms_ok   = send_sms(phone, f'{subject}: {body[:100]}') if phone else False

    log_notification(
        event_type=event_type,
        recipient_email=email,
        recipient_phone=phone,
        subject=subject,
        message=body,
        success=(email_ok or sms_ok)
    )


# RabbitMQ consumer (runs in background thread)

def start_amqp_consumer():
    """Listen on RabbitMQ and dispatch notifications for each message."""
    try:
        import pika

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT)
        )
        channel = connection.channel()
        channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic', durable=True)

        result  = channel.queue_declare(queue='', exclusive=True)
        q_name  = result.method.queue
        routing_keys = [
            'hfe.approved', 'hfe.rejected',
            'ballot.submitted', 'ballot.eligible', 'ballot.ineligible',
        ]
        for key in routing_keys:
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=q_name, routing_key=key)

        print(f'[AMQP] Waiting for notifications on exchange: {EXCHANGE_NAME}')

        def callback(ch, method, properties, body):
            try:
                payload = json.loads(body)
                event_type = method.routing_key
                print(f'[AMQP] Received event: {event_type}')
                dispatch_notification(event_type, payload)
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                print(f'[AMQP] Error processing message: {e}')
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=q_name, on_message_callback=callback)
        channel.start_consuming()

    except Exception as e:
        print(f'[AMQP] Could not start consumer: {e}. HTTP-only mode active.')


consumer_thread = threading.Thread(target=start_amqp_consumer, daemon=True)
consumer_thread.start()


# HTTP endpoints (direct call fallback)

@app.route('/notify', methods=['POST'])
def notify():
    """
    Send a notification directly via HTTP POST (fallback when AMQP is unavailable).
        ---
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [event_type]
            properties:
              event_type:
                type: string
                enum: [hfe.approved, hfe.rejected, ballot.submitted, ballot.eligible, ballot.ineligible]
              email:
                type: string
              phone:
                type: string
              application_id:
                type: integer
              hfe_letter_id:
                type: string
              bto_project_id:
                type: integer
              flat_type:
                type: string
              max_loan_amount:
                type: number
              estimated_grant:
                type: number
              validity_end:
                type: string
              rejection_reason:
                type: string
              note:
                type: string
    responses:
      200:
        description: Notification sent
      400:
        description: Missing event_type
    """
    payload = request.get_json() or {}
    event_type = payload.get('event_type')

    if not event_type:
        return jsonify({'code': 400, 'message': "'event_type' is required."}), 400

    dispatch_notification(event_type, payload)

    return jsonify({
        'code': 200,
        'message': f'Notification dispatched for event: {event_type}'
    })


@app.route('/notifications', methods=['GET'])
def get_notifications():
    """
    Get the notification log (for debugging / auditing).
        ---
    responses:
      200:
        description: Log returned
    """
    return jsonify({'code': 200, 'data': {'notifications': notification_log}})


if __name__ == '__main__':
    app.run(port=5013, debug=True)
