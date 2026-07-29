param(
  [string]$TaskName = "HatarukunWeb",
  [switch]$SkipGitPull,
  [switch]$SkipInstall,
  [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webDir = Resolve-Path (Join-Path $scriptDir "..")

Set-Location $webDir

if (-not (Test-Path ".env.production")) {
  Write-Host "apps/web/.env.production is missing. Create it before deploying."
  exit 1
}

if (-not $SkipGitPull) {
  git pull
}

if (-not $SkipInstall) {
  npm.cmd ci
}

npm.cmd run build

if (-not $SkipRestart) {
  $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

  if ($task) {
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Start-ScheduledTask -TaskName $TaskName
    Write-Host "Scheduled Task '$TaskName' restarted."
  } else {
    Write-Host "Scheduled Task '$TaskName' was not found. Create it before deploying."
  }
}
