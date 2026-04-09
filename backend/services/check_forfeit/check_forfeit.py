"""Check Forfeit service.

End-of-day cron-triggered service (Scenario 3B).
Finds expired flat reservations, marks them as forfeited via the
Flat Selection Service, and publishes an AMQP notification event.

Flow:
  1. Cron job (APScheduler) or manual POST /check-forfeit
  2. PUT /flat-selection/{id}/status → status=forfeited  (Flat Selection Service)
  3. Return success
  4. Publish FlatReservationForfeited AMQP event  (Notification Service)
  5-8. Notification Service → Twilio SMS + SendGrid email
"""

import json
import logging
import os
from datetime import datetime, timedelta

import requests
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

FLAT_SELECTION_SERVICE_URL = os.environ.get(
    "FLAT_SELECTION_SERVICE_URL", "http://localhost:5002"
)
APPLICATION_SERVICE_URL = os.environ.get(
    "APPLICATION_SERVICE_URL", "http://localhost:5004"
)
NOTIFICATION_SERVICE_URL = os.environ.get(
    "NOTIFICATION_SERVICE_URL", "http://localhost:5000"
)
NOTIFICATION_QUEUE_NAME = os.environ.get(
    "NOTIFICATION_QUEUE_NAME", "hdb_notification_queue"
)
# How many hours after reserved_at before the reservation is considered expired.
RESERVATION_DEADLINE_HOURS = float(
    os.environ.get("RESERVATION_DEADLINE_HOURS", "24")
)
REQUEST_TIMEOUT = float(os.environ.get("REQUEST_TIMEOUT_SECONDS", "20"))
# Cron expression for the scheduler (default: every day at 23:59)
CRON_HOUR = int(os.environ.get("CRON_HOUR", "15"))
CRON_MINUTE = int(os.environ.get("CRON_MINUTE", "59"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [check_forfeit] %(message)s",
)
logger = logging.getLogger("check_forfeit")

app = Flask(__name__)
CORS(app)

app.config["SWAGGER"] = {
    "title": "Check Forfeit Service API",
    "version": 1.0,
    "openapi": "3.0.2",
    "description": (
        "End-of-day cron-triggered service (Scenario 3B). "
        "Finds expired flat reservations, marks them as forfeited via the "
        "Flat Selection Service, and publishes an AMQP notification event."
    ),
}
Swagger(app)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_expired_reservations():
    """Return all reserved flat-selection records whose deadline has passed."""
    response = requests.get(
        f"{FLAT_SELECTION_SERVICE_URL}/flat-selection",
        params={"status": "reserved"},
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()

    selections = (response.json() or {}).get("data", [])
    deadline = datetime.utcnow() - timedelta(hours=RESERVATION_DEADLINE_HOURS)

    expired = []
    for selection in selections:
        reserved_at_str = selection.get("reserved_at")
        if not reserved_at_str:
            continue
        try:
            reserved_at = datetime.fromisoformat(reserved_at_str)
        except ValueError:
            continue
        if reserved_at <= deadline:
            expired.append(selection)

    return expired


def forfeit_selection(selection_id):
    """PUT to Flat Selection Service to update status to forfeited."""
    response = requests.put(
        f"{FLAT_SELECTION_SERVICE_URL}/flat-selection/{selection_id}/status",
        json={"status": "forfeited"},
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    return response.json()


def get_application_contacts(application_id):
    """Fetch MAIN_APPLICANT and CO_APPLICANT contact details from Application Service."""
    try:
        response = requests.get(
            f"{APPLICATION_SERVICE_URL}/applications/{application_id}",
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        logger.warning(
            "Could not reach Application Service for application %d: %s",
            application_id,
            exc,
        )
        return []

    if response.status_code != 200:
        logger.warning(
            "Application Service returned %d for application %d",
            response.status_code,
            application_id,
        )
        return []

    application = response.json()
    members = application.get("members") or []
    recipients = []

    for member in members:
        role = member.get("member_role", "")
        if role not in ("MAIN_APPLICANT", "CO_APPLICANT"):
            continue
        email = (member.get("email") or "").strip() or None
        mobile = (member.get("contact_number") or "").strip() or None
        name = (member.get("full_name") or "").strip() or "Applicant"

        if not email and not mobile:
            continue

        recipients.append(
            {
                "name": name,
                "email": email,
                "mobile": mobile,
                "role": role,
            }
        )

    return recipients


def publish_forfeit_notification(selection, recipient):
    """Publish FlatReservationForfeited event to Notification Service via AMQP."""
    name = recipient.get("name") or "Applicant"
    role_label = (
        "main applicant"
        if recipient.get("role") == "MAIN_APPLICANT"
        else "co-applicant"
    )

    message = (
        f"Hi {name},\n\n"
        f"Your flat reservation (Selection ID: {selection['selection_id']}) "
        f"has expired as payment was not completed within {int(RESERVATION_DEADLINE_HOURS)} hours.\n"
        f"Your reservation has been forfeited.\n\n"
        f"A 1-year re-application penalty period has been applied. "
        f"You may re-enter the ballot in the next BTO exercise after the penalty period.\n\n"
        f"Regards,\nHDB"
    )

    payload = {
        "eventType": "FlatReservationForfeited",
        "subject": "Your Flat Reservation Has Been Forfeited",
        "selectionId": selection["selection_id"],
        "applicationId": selection["application_id"],
        "applicantId": selection["applicant_nric"],
        "email": recipient.get("email"),
        "mobile": recipient.get("mobile"),
        "message": message,
        "recipientName": name,
        "recipientRole": role_label,
    }

    response = requests.post(
        f"{NOTIFICATION_SERVICE_URL}/publish",
        json={
            "exchange": "bto",
            "exchange_type": "topic",
            "routing_key": "application.notify",
            "queue_name": NOTIFICATION_QUEUE_NAME,
            "payload": payload,
        },
        timeout=5,
    )
    response.raise_for_status()
    return True


# ---------------------------------------------------------------------------
# Core forfeit logic (shared by cron and manual trigger)
# ---------------------------------------------------------------------------

def run_forfeit_check():
    """
    Main forfeit check logic.

    1. Fetch all expired reservations from Flat Selection Service.
    2. For each: PUT status=forfeited.
    3. Fetch applicant contact details from Application Service.
    4. Publish AMQP forfeit notification.
    """
    checked_at = datetime.utcnow().isoformat()
    results = {
        "checked_at": checked_at,
        "reservation_deadline_hours": RESERVATION_DEADLINE_HOURS,
        "total_expired": 0,
        "forfeited": [],
        "failed": [],
        "notified": [],
    }

    try:
        expired = get_expired_reservations()
    except Exception as exc:
        logger.error("Failed to fetch expired reservations: %s", exc)
        results["error"] = str(exc)
        return results, False

    results["total_expired"] = len(expired)
    logger.info("Found %d expired reservation(s)", len(expired))

    for selection in expired:
        selection_id = selection["selection_id"]
        application_id = selection["application_id"]

        # Step 2: Update status to forfeited via Flat Selection Service
        try:
            forfeit_selection(selection_id)
            results["forfeited"].append(selection_id)
            logger.info("Forfeited selection %d (application %d)", selection_id, application_id)
        except Exception as exc:
            logger.error("Failed to forfeit selection %d: %s", selection_id, exc)
            results["failed"].append({"selection_id": selection_id, "error": str(exc)})
            continue

        # Get applicant contact details
        recipients = get_application_contacts(application_id)
        if not recipients:
            logger.warning(
                "No contact details found for application %d — skipping notification",
                application_id,
            )

        # Step 4: Publish AMQP forfeit event for each recipient
        for recipient in recipients:
            try:
                publish_forfeit_notification(selection, recipient)
                results["notified"].append(
                    {
                        "selection_id": selection_id,
                        "email": recipient.get("email"),
                        "mobile": recipient.get("mobile"),
                    }
                )
                logger.info(
                    "Published forfeit notification for selection %d to %s",
                    selection_id,
                    recipient.get("email") or recipient.get("mobile"),
                )
            except Exception as exc:
                logger.warning(
                    "Notification publish failed for selection %d: %s", selection_id, exc
                )

    logger.info(
        "Forfeit check complete | forfeited=%d failed=%d notified=%d",
        len(results["forfeited"]),
        len(results["failed"]),
        len(results["notified"]),
    )

    results["forfeited_count"] = len(results["forfeited"])
    results["failed_count"] = len(results["failed"])
    results["notified_count"] = len(results["notified"])

    return results, True


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/check-forfeit", methods=["POST"])
def trigger_check_forfeit():
    """
    Manually trigger a forfeit check (also called by cron job)
    ---
    tags:
      - Check Forfeit
    summary: Forfeit all expired flat reservations
    description: |
      Triggered by the end-of-day cron job or manually for demo purposes.

      For each flat-selection record in 'reserved' status whose reserved_at
      timestamp has exceeded the configured deadline:

        1. PUT /flat-selection/{id}/status  →  status = forfeited  (Flat Selection Service)
        2. Fetch applicant contact details from Application Service
        3. Publish FlatReservationForfeited AMQP event  (Notification Service)
        4. Notification Service sends email (SendGrid) and SMS (Twilio)

      A 1-year re-application penalty is automatically created by the
      Flat Selection Service when status transitions to 'forfeited'.
    responses:
      200:
        description: Forfeit check completed.
        content:
          application/json:
            schema:
              type: object
              properties:
                checked_at:
                  type: string
                reservation_deadline_hours:
                  type: number
                total_expired:
                  type: integer
                forfeited_count:
                  type: integer
                failed_count:
                  type: integer
                notified_count:
                  type: integer
                forfeited:
                  type: array
                  items:
                    type: integer
                failed:
                  type: array
                  items:
                    type: object
                notified:
                  type: array
                  items:
                    type: object
      500:
        description: Failed to fetch reservations from Flat Selection Service.
    """
    logger.info("Forfeit check triggered via POST /check-forfeit")
    results, ok = run_forfeit_check()

    if not ok:
        return jsonify({"error": results.get("error", "Forfeit check failed.")}), 500

    return jsonify(results), 200


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


# ---------------------------------------------------------------------------
# Cron scheduler
# ---------------------------------------------------------------------------

def scheduled_forfeit_check():
    logger.info("Cron-triggered forfeit check starting")
    run_forfeit_check()


scheduler = BackgroundScheduler()
scheduler.add_job(
    scheduled_forfeit_check,
    trigger="cron",
    hour=CRON_HOUR,
    minute=CRON_MINUTE,
    id="daily_forfeit_check",
)
scheduler.start()
logger.info(
    "Cron forfeit check scheduled at %02d:%02d UTC daily",
    CRON_HOUR,
    CRON_MINUTE,
)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5012, debug=False)
