@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "MOBILE_DIR=%SCRIPT_DIR%.."

cd /d "%MOBILE_DIR%" || (
  echo Failed to enter %MOBILE_DIR%
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%sync-dart-defines.ps1"
if errorlevel 1 exit /b 1

flutter build apk --release --dart-define-from-file=dart_defines.local.json %*
exit /b %errorlevel%
