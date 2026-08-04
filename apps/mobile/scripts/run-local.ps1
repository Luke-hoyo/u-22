param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$FlutterArgs
)

$ErrorActionPreference = "Stop"

$MobileRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
& (Join-Path $PSScriptRoot "sync-dart-defines.ps1")

Set-Location $MobileRoot

$command = @("run", "--dart-define-from-file=dart_defines.local.json") + $FlutterArgs
Write-Host "flutter $($command -join ' ')"

& flutter @command
