param(
  [string]$HostName = "localhost",
  [string]$Port = $(if ($env:PORT) { $env:PORT } else { "3000" })
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webDir = Resolve-Path (Join-Path $scriptDir "..")
$logDir = Join-Path $webDir "logs"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Set-Location $webDir

$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:PORT = $Port

npm.cmd run start -- --hostname $HostName --port $env:PORT *>> (Join-Path $logDir "next-start.log")
