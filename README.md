# esd-hdb - HDB BTO Application Portal

A microservices-based HDB BTO flat application portal built with Vue 3, Flask, and Docker.

---

## Services

| Service | Port | Description |
|---|---|---|
| `hdb-frontend` | 5173 | Vue 3 frontend (Vite) |
| `document-service` | 5050 | Document OCR for income statements and HFE letters |
| `nets-payment-service` | 5003 | NETS eNETS payment wrapper (B2S for local demo; S2S in production) |
| `ballot-audit-service` | 5000 | Stores ballot run audit records |
| `flat-service` | 5006 | Provides available flat inventory by project |
| `flat-selection-service` | 5002 | Stores queue entries for ballot outcomes |
| `project-service` | 5012 | Source of truth for exercises and project ballot status |
| `process-ballot-service` | 5011 | Orchestrates ballot runs across services |

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
- Document DB on port `3350`
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
| `S9401234L` | Lena Ong |
| `S9501234R` | Ryan Tan |
| `S8901234D` | Daniel Goh |
| `S9001234J` | Jasmine Tan |
| `S9201234W` | Wendy Chen |

### Apply for a Flat

After logging in, click **Start Application** from the dashboard. The flow has three steps:

1. **Details** - Fill in personal details and flat preferences
2. **Documents** - Upload your CPF Income Statement PDF and HFE Letter PDF. The document service extracts and displays the fields inline for verification.
3. **Payment** - Pay the $10 application fee via NETS. Clicking **Pay with NETS** redirects the current tab to the eNETS payment page.

### BTO Launches

Browse available BTO projects from the **BTO Launches** section on the home page. Click into a project to see the floor plan and available units.

---

## 5. Admin Ballot Testing

After signing in, open `http://localhost:5173/admin/ballot`.

Use the admin page to:

1. Enter an `exercise_id` (for seeded demo data, use `6`)
2. Click **Execute Ballot** to manually trigger a run
3. Review:
   - per-project queue outcomes
   - invited vs waitlist counts
   - flat-selection write status
   - ballot audit history

You can also set recurring ballot runs from the admin page:

1. Use the **Schedule Builder** (daily/weekly/monthly/custom)
2. Click **Create Schedule**
3. To edit, select an existing scheduled record and click **Update Selected Schedule**

The admin page triggers `POST /process-ballot/run` for manual runs, while schedule creation and updates now call `ballot-audit` directly (`POST /ballot-audits`, `PUT /ballot-audits/{audit_id}`).

---

## 6. Document Service Testing

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

## 7. NETS Payment Flow

### Production design (interaction diagram)

In production, the intended flow uses the eNETS **Server-to-Server (S2S)** callback, where NETS' servers POST the transaction result directly to the merchant backend — independent of the browser. This is the flow modelled in the interaction diagram:

1. Frontend calls `POST /payment/initiate` on the NETS service
2. NETS service builds a signed payload and returns the eNETS gateway URL
3. Frontend submits a hidden form to eNETS in the same tab
4. User completes payment on the eNETS-hosted card page
5. **eNETS POSTs the result to `/payment/s2s-callback` on the NETS service (server-to-server)**
6. eNETS also redirects the browser back to `/payment/b2s-callback`, which redirects to `/payment-result`
7. The frontend calls `GET /payment/status/<merchantTxnRef>` — the record is already updated by the S2S callback

### Local demo (this project)

Because NETS' servers cannot reach `localhost`, the S2S callback cannot be received during local development. This project therefore relies on the **Browser-to-Server (B2S)** callback instead:

1. Frontend calls `POST /payment/initiate` on the NETS service
2. NETS service builds a signed payload and returns the eNETS gateway URL
3. Frontend submits a hidden form to eNETS in the same tab
4. User completes payment on the eNETS-hosted card page
5. eNETS redirects the browser back to `/payment/b2s-callback` (B2S), which updates the record and redirects to `/payment-result`
6. The frontend calls `GET /payment/status/<merchantTxnRef>` on the NETS service
7. The NETS service returns the stored callback result immediately and only falls back to the external query API while the payment is still pending

Notes:
- `b2s` works locally with `localhost` — used in this demo
- `s2s` requires a public HTTPS URL reachable by NETS' servers — used in production
- `webhook.site` is useful for proving NETS can hit a public `s2s` URL during development

---

## 8. End-to-End Test Scenarios

Generate the test PDFs:

```bash
python test_scenarios/generate_test_pdfs.py
```

The script writes 10 files (income + HFE for each scenario) into `test_scenarios/`.

| Scenario | Applicants | Flat Type | Expected | Reason |
|---|---|---|---|---|
| 1 | Lena Ong + Sarah Lim | 3-Room | PASS | Valid HFE, co-applicant matches, income within ceiling |
| 2 | Ryan Tan + Sarah Lim | 4-Room | PASS | Valid HFE, combined income within ceiling |
| 3 | Daniel Goh + Marcus Lim | 3-Room | FAIL | Current income exceeds 3-Room ceiling |
| 4 | Jasmine Tan + Marcus Lim | 4-Room | FAIL | HFE letter has expired |
| 5 | Wendy Chen + Ryan Tan | 4-Room | FAIL | Selected flat type not in HFE-approved list |

Generated files:

- Scenario 1: `scenario_1_lena_ong_income.pdf`, `scenario_1_lena_ong_hfe.pdf`
- Scenario 2: `scenario_2_ryan_sarah_income.pdf`, `scenario_2_ryan_sarah_hfe.pdf`
- Scenario 3: `scenario_3_daniel_goh_income.pdf`, `scenario_3_daniel_goh_hfe.pdf`
- Scenario 4: `scenario_4_jasmine_marcus_income.pdf`, `scenario_4_jasmine_marcus_hfe.pdf`
- Scenario 5: `scenario_5_wendy_chen_income.pdf`, `scenario_5_wendy_chen_hfe.pdf`

How to test in the app:

1. Start backend services and frontend.
2. Go to the application flow and upload the matching income + HFE pair for one scenario.
3. Complete payment and proceed to eligibility.
4. Verify the eligibility result matches the expected PASS/FAIL above.

---

## 9. Project Structure

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
