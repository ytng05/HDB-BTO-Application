from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

db_config = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'application_service')
}

def get_db():
    return mysql.connector.connect(**db_config)


# ============================================================
# GET /applications - Get all applications
# Optional query params: status
# ============================================================
@app.route('/applications', methods=['GET'])
def get_applications():
    status = request.args.get('status')

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM application"
        params = []

        if status:
            query += " WHERE status = %s"
            params.append(status)

        query += " ORDER BY queue_number"

        cursor.execute(query, params)
        applications = cursor.fetchall()

        for app_record in applications:
            if app_record['reserved_at']:
                app_record['reserved_at'] = app_record['reserved_at'].isoformat()
            if app_record['created_at']:
                app_record['created_at'] = app_record['created_at'].isoformat()
            if app_record['updated_at']:
                app_record['updated_at'] = app_record['updated_at'].isoformat()

        return jsonify({
            "code": 200,
            "data": applications
        }), 200

    except Exception as e:
        return jsonify({
            "code": 500,
            "message": f"Error retrieving applications: {str(e)}"
        }), 500

    finally:
        cursor.close()
        conn.close()


# ============================================================
# GET /applications/<application_id> - Get a specific application
# ============================================================
@app.route('/applications/<string:application_id>', methods=['GET'])
def get_application(application_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM application WHERE application_id = %s", (application_id,))
        app_record = cursor.fetchone()

        if not app_record:
            return jsonify({
                "code": 404,
                "message": f"Application {application_id} not found."
            }), 404

        if app_record['reserved_at']:
            app_record['reserved_at'] = app_record['reserved_at'].isoformat()
        if app_record['created_at']:
            app_record['created_at'] = app_record['created_at'].isoformat()
        if app_record['updated_at']:
            app_record['updated_at'] = app_record['updated_at'].isoformat()

        return jsonify({
            "code": 200,
            "data": app_record
        }), 200

    except Exception as e:
        return jsonify({
            "code": 500,
            "message": f"Error retrieving application: {str(e)}"
        }), 500

    finally:
        cursor.close()
        conn.close()


# ============================================================
# PUT /applications/<application_id>/reserve - Update reservation details (Step 10)
# Body: { "flat_id": 1 }
# ============================================================
@app.route('/applications/<string:application_id>/reserve', methods=['PUT'])
def reserve_application(application_id):
    data = request.get_json()

    if not data or 'flat_id' not in data:
        return jsonify({
            "code": 400,
            "message": "flat_id is required."
        }), 400

    flat_id = data['flat_id']

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Check application exists
        cursor.execute("SELECT * FROM application WHERE application_id = %s", (application_id,))
        app_record = cursor.fetchone()

        if not app_record:
            return jsonify({
                "code": 404,
                "message": f"Application {application_id} not found."
            }), 404

        if app_record['status'] not in ('balloted', 'selecting'):
            return jsonify({
                "code": 409,
                "message": f"Application {application_id} cannot reserve. Current status: {app_record['status']}"
            }), 409

        # Update with reservation details
        cursor.execute("""
            UPDATE application 
            SET status = 'reserved', flat_id = %s, reserved_at = %s
            WHERE application_id = %s
        """, (flat_id, datetime.now(), application_id))

        conn.commit()

        return jsonify({
            "code": 200,
            "message": f"Application {application_id} updated with flat {flat_id} reservation."
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({
            "code": 500,
            "message": f"Error updating application: {str(e)}"
        }), 500

    finally:
        cursor.close()
        conn.close()


# ============================================================
# PUT /applications/<application_id>/undo-reserve - Undo reservation (Step 18b)
# Compensation: revert status and clear flat reservation
# ============================================================
@app.route('/applications/<string:application_id>/undo-reserve', methods=['PUT'])
def undo_reserve_application(application_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM application WHERE application_id = %s", (application_id,))
        app_record = cursor.fetchone()

        if not app_record:
            return jsonify({
                "code": 404,
                "message": f"Application {application_id} not found."
            }), 404

        if app_record['status'] != 'reserved':
            return jsonify({
                "code": 409,
                "message": f"Application {application_id} is not reserved. Current status: {app_record['status']}"
            }), 409

        # Revert to balloted status, clear flat reservation
        cursor.execute("""
            UPDATE application 
            SET status = 'balloted', flat_id = NULL, reserved_at = NULL
            WHERE application_id = %s
        """, (application_id,))

        conn.commit()

        return jsonify({
            "code": 200,
            "message": f"Application {application_id} reservation undone."
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({
            "code": 500,
            "message": f"Error undoing reservation: {str(e)}"
        }), 500

    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)