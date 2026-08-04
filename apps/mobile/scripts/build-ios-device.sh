#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="$ROOT/dart_defines.local.json"
WEB_ENV="$ROOT/../web/.env.local"

if [[ ! -f "$DEFINES_FILE" && -f "$WEB_ENV" ]]; then
  KEY="$(grep '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' "$WEB_ENV" | cut -d= -f2- | tr -d '"')"
  printf '{\n  "CLERK_PUBLISHABLE_KEY": "%s"\n}\n' "$KEY" >"$DEFINES_FILE"
  echo "Created dart_defines.local.json from apps/web/.env.local"
fi

if [[ ! -f "$DEFINES_FILE" ]]; then
  echo "Missing dart_defines.local.json. Copy dart_defines.example.json and set CLERK_PUBLISHABLE_KEY."
  exit 1
fi

cd "$ROOT"
flutter build ios --release --dart-define-from-file=dart_defines.local.json "$@"
flutter install --release "$@"
