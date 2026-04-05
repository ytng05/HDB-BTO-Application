#!/bin/bash
# Kong Admin API setup script for esd-hdb
# Run this AFTER kong/compose.yaml and docker-compose.yml are both up.
#
# Usage:
#   cd esd-hdb
#   bash kong/setup.sh

ADMIN=http://localhost:8001

# Wait for Kong Admin API to be ready
echo "Waiting for Kong Admin API..."
until curl -sf "$ADMIN/status" > /dev/null; do
  sleep 2
done
echo "Kong is ready."

# ─── Helper ──────────────────────────────────────────────────────────────────
# create_service <name> <upstream-url>
create_service() {
  local name=$1
  local url=$2
  echo "  Registering service: $name -> $url"
  curl -sf -X PUT "$ADMIN/services/$name" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$url\"}" > /dev/null
}

# create_route <service-name> <route-name> <path-prefix>
# strip_path=false so the full path is forwarded to the upstream service
create_route() {
  local service=$1
  local route=$2
  local path=$3
  echo "  Registering route:   $path -> $service"
  curl -sf -X PUT "$ADMIN/services/$service/routes/$route" \
    -H "Content-Type: application/json" \
    -d "{\"paths\": [\"$path\"], \"strip_path\": false}" > /dev/null
}

# ─── Scenario 1: Apply for BTO ───────────────────────────────────────────────
echo ""
echo "==> Scenario 1: Apply for BTO"

create_service "apply-bto"    "http://apply-bto-service:5010"
create_route   "apply-bto"    "apply-bto-route"    "/apply-bto"

create_service "singpass"     "http://singpass-service:5007"
create_route   "singpass"     "singpass-route"     "/singpass"

create_service "nets-payment" "http://nets-payment-service:5003"
create_route   "nets-payment" "nets-payment-route" "/payment"

# ─── Scenario 2: Ballot Run ──────────────────────────────────────────────────
echo ""
echo "==> Scenario 2: Ballot Run"

create_service "process-ballot" "http://process-ballot-service:5011"
create_route   "process-ballot" "process-ballot-route" "/process-ballot"

create_service "ballot-audit" "http://ballot-audit-service:5000"
create_route   "ballot-audit" "ballot-audit-route" "/ballot-audits"

create_service "project"      "http://project-service:5012"
create_route   "project"      "project-route"      "/projects"

# ─── Scenario 3: Flat Selection ──────────────────────────────────────────────
echo ""
echo "==> Scenario 3: Flat Selection"

create_service "flat"           "http://flat-service:5006"
create_route   "flat"           "flat-route"           "/flats"

create_service "flat-selection" "http://flat-selection-service:5002"
create_route   "flat-selection" "flat-selection-route" "/flat-selection"

create_service "application"    "http://application-service:5004"
create_route   "application"    "application-route"    "/applications"

# ─── Plugins ─────────────────────────────────────────────────────────────────
echo ""
echo "==> Applying plugins"

# Rate-limit apply-bto: max 5 submissions/minute per IP (prevents duplicate submissions)
echo "  Plugin: rate-limiting on apply-bto"
curl -sf -X POST "$ADMIN/services/apply-bto/plugins" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rate-limiting",
    "config": {
      "minute": 5,
      "hour": 20,
      "policy": "local"
    }
  }' > /dev/null

# Rate-limit flat-selection: max 30 requests/minute (prevents race conditions on reservation)
echo "  Plugin: rate-limiting on flat-selection"
curl -sf -X POST "$ADMIN/services/flat-selection/plugins" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rate-limiting",
    "config": {
      "minute": 30,
      "policy": "local"
    }
  }' > /dev/null

# API key auth on process-ballot: only the cron job (ballot-audit-service) can call this
echo "  Plugin: key-auth on process-ballot"
curl -sf -X POST "$ADMIN/services/process-ballot/plugins" \
  -H "Content-Type: application/json" \
  -d '{"name": "key-auth"}' > /dev/null

# Create a consumer for the ballot-audit cron job and assign it an API key
echo "  Consumer: ballot-cron-job"
curl -sf -X PUT "$ADMIN/consumers/ballot-cron-job" \
  -H "Content-Type: application/json" \
  -d '{"username": "ballot-cron-job"}' > /dev/null

echo "  API key: ballot-cron-job-secret"
curl -sf -X PUT "$ADMIN/consumers/ballot-cron-job/key-auth/ballot-cron-job-secret" \
  -H "Content-Type: application/json" \
  -d '{"key": "ballot-cron-job-secret"}' > /dev/null

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "==> Kong setup complete. Registered services and routes:"
echo ""
curl -s "$ADMIN/services" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for s in data.get('data', []):
    print(f\"  {s['name']:20s} -> {s['url']}\")
"
echo ""
echo "Active routes:"
curl -s "$ADMIN/routes" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for r in data.get('data', []):
    print(f\"  {str(r['paths']):30s} strip_path={r['strip_path']}\")
"
