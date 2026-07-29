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

    $webPath = [string]$webDir
    Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
      Where-Object { $_.CommandLine -and $_.CommandLine.Contains($webPath) } |
      ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
      }

    Write-Host "Scheduled Task '$TaskName' stopped for deployment."
  } else {
    Write-Host "Scheduled Task '$TaskName' was not found. Create it before deploying."
  }
}

$deploySucceeded = $false

try {
  if (-not $SkipGitPull) {
    git pull
    if ($LASTEXITCODE -ne 0) {
      throw "git pull failed with exit code $LASTEXITCODE."
    }
  }

  if (-not $SkipInstall) {
    npm.cmd ci
    if ($LASTEXITCODE -ne 0) {
      throw "npm ci failed with exit code $LASTEXITCODE."
    }
  }

  npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed with exit code $LASTEXITCODE."
  }

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
