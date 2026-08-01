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

$envContent = Get-Content ".env.production"
$envValues = @{}

foreach ($line in $envContent) {
  $trimmed = $line.Trim()

  if (-not $trimmed -or $trimmed.StartsWith("#") -or -not $trimmed.Contains("=")) {
    continue
  }

  $parts = $trimmed.Split("=", 2)
  $envValues[$parts[0].Trim()] = $parts[1].Trim()
}

$requiredEnvKeys = @(
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_PROXY_URL"
)

$missingEnvKeys = @(
  $requiredEnvKeys | Where-Object {
    -not $envValues.ContainsKey($_) -or [string]::IsNullOrWhiteSpace($envValues[$_])
  }
)

if ($missingEnvKeys.Count -gt 0) {
  Write-Host "apps/web/.env.production is missing required values:"
  $missingEnvKeys | ForEach-Object { Write-Host " - $_" }
  Write-Host "Copy apps/web/.env.production.example and fill the values before deploying."
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
