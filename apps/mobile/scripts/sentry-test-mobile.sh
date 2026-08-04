#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="$ROOT/dart_defines.local.json"

cd "$ROOT"

if [[ ! -f "$DEFINES_FILE" ]]; then
  echo "Missing dart_defines.local.json"
  echo "Copy dart_defines.example.json or run scripts/sync-dart-defines.ps1 on Windows."
  exit 1
fi

if ! grep -q '"SENTRY_DSN"' "$DEFINES_FILE"; then
  echo "SENTRY_DSN is missing in dart_defines.local.json"
  exit 1
fi

echo "Sentry test app を起動します（接続中の iPhone / シミュレータが必要）"
echo "flutter run -t lib/tool/sentry_test.dart --dart-define-from-file=dart_defines.local.json"
echo

flutter run -t lib/tool/sentry_test.dart --dart-define-from-file=dart_defines.local.json "$@"
