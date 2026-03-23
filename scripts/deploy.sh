#!/usr/bin/env bash
# Upload Vite build output (dist/) to a remote directory over SSH using rsync.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="${ROOT}/dist"

if [[ -f "${ROOT}/.env.deploy" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT}/.env.deploy"
  set +a
fi

: "${DEPLOY_HOST:?Set DEPLOY_HOST or add it to .env.deploy}"
: "${DEPLOY_USER:?Set DEPLOY_USER or add it to .env.deploy}"
: "${DEPLOY_PATH:?Set DEPLOY_PATH or add it to .env.deploy}"

if [[ ! -d "$DIST" ]]; then
  echo "error: dist/ not found. Run: npm run build" >&2
  exit 1
fi

if [[ -n "${DEPLOY_PORT:-}" ]]; then
  export RSYNC_RSH="ssh -p ${DEPLOY_PORT}"
fi

RSYNC_ARGS=(-avz --delete)
if [[ -n "${RSYNC_EXTRA_ARGS:-}" ]]; then
  # shellcheck disable=SC2206
  RSYNC_ARGS+=(${RSYNC_EXTRA_ARGS})
fi

TARGET="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
echo "rsync ${DIST}/ -> ${TARGET}"
rsync "${RSYNC_ARGS[@]}" "${DIST}/" "${TARGET}"
echo "done."
