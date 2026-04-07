# ESD HDB BTO Portal

Microservices-based HDB BTO application and ballot platform built with:
- Vue 3 frontend
- Flask backend services
- MySQL databases
- Kong API Gateway
- Docker Compose orchestration

## Table Of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Run The System](#run-the-system)
- [Frontend Setup](#frontend-setup)
- [Usage Guide](#usage-guide)
- [Notification Setup Notes](#notification-setup-notes)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## Features
- Singpass-style login via MockPass
- BTO application flow with:
  - details and household members
  - document upload and OCR extraction
  - NETS payment flow
  - eligibility check and status update
- Admin ballot orchestration and audit scheduling
- Flat queue assignment and flat selection records
- Email and SMS notification pipeline

## Architecture
Main domain services:
- `apply-bto-service`: orchestrates payment -> application creation -> eligibility outcome
- `process-ballot-service`: orchestrates validation, ballot run, queue creation, notifications
- `notification-api` and `notification-consumer`: event publishing and external delivery
- `application-service`, `flat-selection-service`, `flat-service`, `document-service`, `validate-eligibility-service`, `check-eligibility-service`

Gateway:
- Kong routes browser/API traffic through `http://localhost:8000`

Data stores:
- MySQL per bounded context (`application-db`, `document-db`, `flat-db`, `flat-selection-db`, `ballot-audit-db`, `hfe-application-db`)

## Repository Structure
```text
esd-hdb/
|-- backend/
|   |-- docker-compose.yml
|   |-- .env
|   |-- .env.example
|   |-- application/
|   |-- apply_bto/
|   |-- ballot/
|   |-- ballot_audit/
|   |-- check_eligibility/
|   |-- document/
|   |-- flat/
|   |-- flat_allocation/
|   |-- flat_selection/
|   |-- hfe_application/
|   |-- kong/
|   |-- mockpass/
|   |-- nets_payment/
|   |-- notification/
|   |-- process_ballot/
|   |-- singpass/
|   `-- validate_eligibility/
|-- frontend/
|-- .env
`-- .env.example
```

## Prerequisites
- Docker Desktop (with Compose v2)
- Node.js 18+ and npm
- Git Bash or WSL (for `kong/setup.sh`) on Windows

## Environment Setup
### 1) Root environment file
Create backend `.env` from template:

```bash
cp backend/.env.example backend/.env
```

Important backend values:
- `NETS_*` credentials and callback values
- `VITE_API_GATEWAY_URL` and `VITE_SINGPASS_URL` (usually `http://localhost:8000`)
- `VITE_PROCESS_BALLOT_API_KEY`

### 2) Notification environment file
Set `backend/notification/.env` for RabbitMQ, SendGrid, Twilio, and admin alert contacts:

```env
RABBITMQ_HOST=...
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=...
RABBITMQ_PASSWORD=...
RABBITMQ_VHOST=...

SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=...

ADMIN_ALERT_EMAIL=...
ADMIN_ALERT_MOBILE=...
```

Notes:
- `process-ballot-service` reads admin alert settings from `backend/notification/.env`.
- Twilio trial accounts can only send to verified numbers.

## Run The System
### 1) Start all backend services
```bash
cd backend
docker compose up --build -d
```

### 2) Bootstrap Kong routes and plugins
```bash
bash kong/setup.sh
```

If you are on Windows without bash, run from Git Bash or WSL.

### 3) Check running containers
```bash
docker compose ps
```

### 4) Stop everything
```bash
docker compose down
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open:
- Frontend: `http://localhost:5173`
- Kong Proxy: `http://localhost:8000`

## Usage Guide
### Login
Use frontend login and authenticate via MockPass.

### Apply For BTO
Standard flow:
1. Fill applicant + member details
2. Upload income and HFE PDFs
3. Complete NETS payment
4. Receive eligibility outcome notification

### Admin Ballot
Open admin ballot page:
- `http://localhost:5173/admin/ballot`

Typical flow:
1. Trigger manual run for an exercise
2. Review project/group queue results
3. Review audit history and schedule entries

## Notification Setup Notes
- All notifications are published through `notification-api` (`/publish`) to queue `hdb_notification_queue`.
- `notification-consumer` sends:
  - email via SendGrid
  - SMS via Twilio

Expected behavior:
- Application completion: applicant receives eligibility pass/fail with reasons when failed.
- Ballot completion:
  - Admin receives completion summary (or failure alert on run errors).
  - Applicants receive queue assignment or post-validation failure reason.

## Troubleshooting
### Services started but frontend calls fail
- Verify Kong setup was executed:
  - `cd backend && bash kong/setup.sh`
- Verify gateway URL in root `.env`:
  - `VITE_API_GATEWAY_URL=http://localhost:8000`

### Email not received
- Check consumer logs:
  - `cd backend && docker compose logs -f notification-consumer`
- Confirm SendGrid values in `notification/.env`:
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM_EMAIL`
- `Status: 202` in logs means SendGrid accepted the message for processing.

### SMS not received
- Twilio trial restrictions may block sends to unverified numbers.
- Check for Twilio `400` or `429` errors in consumer logs.

### Admin notifications not received
- Confirm `ADMIN_ALERT_EMAIL` and/or `ADMIN_ALERT_MOBILE` in `notification/.env`.
- Check `process-ballot-service` logs for:
  - `admin_notification_sent: true`
  - or explicit warning about missing admin contact configuration.

## Useful Commands
### Tail critical logs
```bash
cd backend && docker compose logs -f process-ballot-service notification-api notification-consumer
```

### Rebuild specific services
```bash
cd backend && docker compose up -d --build process-ballot-service notification-consumer
```

### Check one application record
```bash
curl http://localhost:5004/applications/<application_id>
```

### Trigger process-ballot manually
```bash
curl -X POST http://localhost:5011/process-ballot/run \
  -H "Content-Type: application/json" \
  -d "{\"exercise_id\":6,\"skip_audit\":true,\"trigger_source\":\"manual\"}"
```
