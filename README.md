# esd-hdb - HDB BTO Application Portal

A microservices-based HDB BTO flat application portal built with Vue 3, Flask, and Docker.

---

## Services

| Service | Port | Description |
|---|---|---|
| `hdb-frontend` | 5173 | Vue 3 frontend (Vite) |
| `document-service` | 5050 | Document OCR for income statements and HFE letters |
| `nets-payment-service` | 5003 | NETS eNETS B2S payment wrapper |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- [Node.js 18+](https://nodejs.org/) for the frontend

---

## 1. Configure NETS Callbacks

For local development:
- `b2s` can stay on `localhost`, because NETS redirects the user's browser back to your machine.
- `s2s` must use a public HTTPS URL, because NETS' servers cannot call your localhost directly.

The quickest free option for `s2s` is [Webhook.site](https://webhook.site/):
1. Open `https://webhook.site/`
2. Copy the unique URL it generates
3. Paste it into `NETS_S2S_CALLBACK_URL` in `.env`

Example `.env` values:

```env
NETS_CALLBACK_BASE=http://localhost:5003
NETS_S2S_CALLBACK_URL=https://webhook.site/your-real-token
NETS_IP_ADDRESS=127.0.0.1
NETS_MERCHANT_TIMEZONE=+8:00
```

---

## 2. Start Backend Services

The repo currently includes NETS' public demo/sample UAT values so you can exercise the hosted flow shape quickly. For a proper merchant UAT integration, replace `NETS_MID`, `NETS_API_KEY_ID`, and `NETS_SECRET_KEY` with your own NETS-issued test credentials.

```bash
docker compose up --build
```

This starts:
- Document DB on port `3312`
- Document service on `http://localhost:5050`
- NETS payment service on `http://localhost:5003`

The document service persists data under the bind-mounted folder `./document/data`:
- raw uploaded PDFs in `./document/data/documents/`
- document metadata and OCR fields in the MySQL `documents` database

The document schema and seed data live in `document/documents.sql`, following the same
schema-plus-sample-records pattern used by the ballot-audit service.

To run in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

Health checks:

```bash
curl http://localhost:5003/payment/records
```

---

## 3. Start the Frontend

```bash
cd hdb-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 4. Using the App

### Login

Click **Login** in the navbar and enter an NRIC. Demo accounts:

| NRIC | Name |
|---|---|
| `S1234567A` | Aaron Tan |
| `S7654321D` | Demo User |

### Apply for a Flat

After logging in, click **Start Application** from the dashboard. The flow has three steps:

1. **Details** - Fill in personal details and flat preferences
2. **Documents** - Upload your CPF Income Statement PDF and HFE Letter PDF. The document service extracts and displays the fields inline for verification.
3. **Payment** - Pay the $10 application fee via NETS. Clicking **Pay with NETS** redirects the current tab to the eNETS payment page.

### BTO Launches

Browse available BTO projects from the **BTO Launches** section on the home page. Click into a project to see the floor plan and available units.

---

## 5. Document Service Testing

The Documents step calls the document service on upload and displays extracted fields inline. To test directly with curl:

```bash
# CPF Income Statement
curl -F "file=@income_doc_1_aaron_tan.pdf" -F "application_id=1001" http://localhost:5050/extract

# HFE Letter
curl -F "file=@hfe_1_aaron_tan.pdf" -F "application_id=1001" http://localhost:5050/extract

# List persisted documents
curl http://localhost:5050/documents

# List documents for one application
curl "http://localhost:5050/documents?application_id=1001"

# Read one stored record
curl http://localhost:5050/documents/<document_id>

# Save the stored PDF locally
curl -L "http://localhost:5050/documents/<document_id>/file" -o saved.pdf
```

---

## 6. NETS Payment Flow

The payment uses the eNETS Browser-to-Server (B2S) flow with backend status verification:

1. Frontend calls `POST /payment/initiate` on the NETS service
2. NETS service builds a signed payload and returns the eNETS gateway URL
3. Frontend submits a hidden form to eNETS in the same tab
4. User completes payment on the eNETS-hosted card page
5. eNETS redirects the browser back to `/payment-result`
6. The frontend calls `GET /payment/status/<merchantTxnRef>` on the NETS service
7. The NETS service returns the stored callback result immediately and only falls back to the external query API while the payment is still pending

Notes:
- `b2s` works locally with `localhost`
- `s2s` does not work with `localhost`
- `webhook.site` is useful for proving NETS can hit a public `s2s` URL for free

---

## 7. Project Structure

```text
esd-hdb/
|-- docker-compose.yml
|-- .env
|-- document/
|   |-- documents.py
|   |-- documents.sql
|   |-- Dockerfile
|   |-- requirements.txt
|   `-- data/
|-- nets_payment/
|   |-- nets_payment.py
|   |-- Dockerfile.txt
|   `-- requirements.txt
`-- hdb-frontend/
    |-- src/
    |   |-- views/
    |   |-- stores/
    |   |-- components/
    |   `-- router/
    `-- .env
```
