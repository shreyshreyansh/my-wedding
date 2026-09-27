#!/usr/bin/env bash
# A local copy of the live site for the tests: the Worker and static files (wrangler dev), a fresh KV seeded from
# tests/fixtures/guests.json, the mock Sheet, test WhatsApp numbers, and optionally a pretend "now" (to test closed
# replies).   tests/serve-edge.sh <port> [now-iso]
set -euo pipefail
PORT=$1
NOW=${2:-}
STATE=.wrangler/test-state-$PORT
rm -rf "$STATE"
npx wrangler kv key put guests --path tests/fixtures/guests.json --binding GUESTS --local --persist-to "$STATE" > /dev/null
ARGS=(--port "$PORT" --ip 127.0.0.1 --local --persist-to "$STATE" --show-interactive-dev-session=false
  --var "APPS_SCRIPT_URL:http://127.0.0.1:8799/exec" --var "APPS_SCRIPT_SECRET:local-test-secret"
  --var "WA_BRIDE:910000000001" --var "WA_GROOM:910000000002")
if [ -n "$NOW" ]; then ARGS+=(--var "NOW:$NOW"); fi
exec npx wrangler dev "${ARGS[@]}"
