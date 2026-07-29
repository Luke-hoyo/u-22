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

$task = $null
$manageTask = -not $SkipRestart

if ($manageTask) {
  $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

  if ($task) {
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Scheduled Task '$TaskName' stopped for deployment."
  } else {
    Write-Host "Scheduled Task '$TaskName' was not found. Create it before deploying."
  }
}

$deploySucceeded = $false

try {
  if (-not $SkipGitPull) {
    git pull
  }

  if (-not $SkipInstall) {
    npm.cmd ci
  }

  npm.cmd run build
  $deploySucceeded = $true
} finally {
  if ($manageTask -and $task) {
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Start-ScheduledTask -TaskName $TaskName

    if ($deploySucceeded) {
      Write-Host "Scheduled Task '$TaskName' restarted."
    } else {
      Write-Host "Deployment failed. Scheduled Task '$TaskName' was started again."
    }
  }
}
