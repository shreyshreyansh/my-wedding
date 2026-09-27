#!/usr/bin/env bash
# A local edge for the tests: fresh KV seeded from tests/fixtures/guests.json, the mock Sheet, test WhatsApp numbers,
# and optionally a pretend "now" (to test closed replies).   tests/serve-edge.sh <port> [now-iso]
set -euo pipefail
PORT=$1
NOW=${2:-}
STATE=.wrangler/test-state-$PORT
rm -rf "$STATE"
npx wrangler kv key put guests --path tests/fixtures/guests.json --binding GUESTS --local --persist-to "$STATE" > /dev/null
ARGS=(--port "$PORT" --ip 127.0.0.1 --persist-to "$STATE"
  --binding APPS_SCRIPT_URL=http://127.0.0.1:8799/exec --binding APPS_SCRIPT_SECRET=local-test-secret
  --binding WA_BRIDE=910000000001 --binding WA_GROOM=910000000002)
if [ -n "$NOW" ]; then ARGS+=(--binding "NOW=$NOW"); fi
exec npx wrangler pages dev dist "${ARGS[@]}"
