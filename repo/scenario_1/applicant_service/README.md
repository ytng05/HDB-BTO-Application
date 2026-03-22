# applicant_service

> **This service already exists in the repository — do NOT duplicate it.**
> Scenario 1 reuses it as-is. This folder is a reference stub only.

## Source location

```
applicant.py   (repo root)
applicant.sql  (repo root)
```

## What it does

Atomic microservice that manages applicant (couple) records in MySQL.

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/applicant` | List all applicants |
| GET | `/applicant/<applicant_id>` | Get applicant by primary key |
| GET | `/applicant/nric/<nric>` | Look up applicant by NRIC — **used by Scenario 1** |
| POST | `/applicant` | Create a new applicant |
| PUT | `/applicant/<applicant_id>` | Update applicant details |
| DELETE | `/applicant/<applicant_id>` | Delete applicant |

## How Scenario 1 uses it

| Caller | Step | Call |
|--------|------|------|
| `apply_for_ballot` | 13 | `GET /applicant/<applicant_id>` → fetch email + phone for notification |
| `check_eligibility_for_ballot` | resolve NRIC | `GET /applicant/<applicant_id>` → get NRIC when not passed by caller |
| `hfe_service` | 2 | `GET /applicant/<applicant_id>` → get email + NRIC for HFE flow |

## Running locally

```bash
# From the repo root (where applicant.py lives)
python applicant.py          # starts on port 5001
```

## Docker

The `docker-compose.yml` at the scenario_1 root references this service
via `host.docker.internal:5001` (i.e. it is expected to be running
separately from the same repo, not rebuilt here).

If you want to run it inside the same Compose stack, add this block
to `docker-compose.yml`:

```yaml
applicant:
  build:
    context: ../../          # path to repo root containing applicant.py
    dockerfile: Dockerfile   # shared Dockerfile at repo root
  command: python applicant.py
  ports:
    - "5001:5001"
  environment:
    DATABASE_URL: mysql+mysqlconnector://root@mysql:3306/applicant
  depends_on:
    mysql:
      condition: service_healthy
```

And mount the `applicant.sql` init script into MySQL's
`docker-entrypoint-initdb.d/` directory (already done in the shared
`docker-compose.yml` if you add `00_applicant.sql`).

## DB schema

```sql
CREATE TABLE applicant (
  applicant_id   INT AUTO_INCREMENT PRIMARY KEY,
  nric           VARCHAR(9)   NOT NULL UNIQUE,
  name           VARCHAR(100) NOT NULL,
  date_of_birth  DATE         NOT NULL,
  mobile_number  VARCHAR(8)   NOT NULL UNIQUE,
  email          VARCHAR(64)  NOT NULL UNIQUE,
  address        VARCHAR(128) NOT NULL,
  place_of_birth VARCHAR(64)  NOT NULL,
  race           VARCHAR(32)  NOT NULL,
  nationality    VARCHAR(32)  NOT NULL,
  sex            VARCHAR(10)  NOT NULL,
  password       VARCHAR(100) NOT NULL
);
```
