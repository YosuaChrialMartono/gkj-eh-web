#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! command -v rg >/dev/null 2>&1; then
  echo "error: ripgrep (rg) is required to build the backend reference inventory" >&2
  exit 127
fi

echo "Backend consolidation reference inventory"
echo "Generated from the repository working tree; documentation references are expected until Phase 9."
echo

set +e
rg --hidden --line-number --color=never \
  --no-ignore \
  --glob '!.git/**' \
  --glob '!node_modules/**' \
  --glob '!.next/**' \
  --glob '!test-results/**' \
  --glob '!playwright-report/**' \
  --glob '!package-lock.json' \
  --glob '!pnpm-lock.yaml' \
  --glob '!scripts/inventory-backend-references.sh' \
  -e 'API_URL' \
  -e 'localhost:(8080|8082)' \
  -e 'gkj-eh-be' \
  -e '/auth/(login|register|google|refresh|logout)' \
  -e 'refresh_token' \
  -e 'Authorization' \
  -e 'Bearer' \
  -e '/(content|pelayan|reports|members|uploads)' \
  .

inventory_status=$?
set -e
if (( inventory_status > 1 )); then
  exit "${inventory_status}"
fi

exit 0
