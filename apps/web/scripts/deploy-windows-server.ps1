param(
  [string]$TaskName = "HatarukunWeb",
  [string]$GitBranch = "main",
  [switch]$SkipGitPull,
  [switch]$SkipInstall,
  [switch]$SkipRestart,
  [switch]$NoAutoStash
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
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL"
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

function Get-GitRepositoryRoot {
  $repoRoot = git -C $webDir rev-parse --show-toplevel 2>$null

  if (-not $repoRoot) {
    throw "Git repository root was not found from $webDir."
  }

  return $repoRoot.Trim()
}

function Sync-GitRepository {
  param(
    [string]$Branch
  )

  $repoRoot = Get-GitRepositoryRoot
  Write-Host "Syncing git repository at $repoRoot"

  Set-Location $repoRoot

  $status = git status --porcelain

  if ($status) {
    Write-Host "Local changes detected before git pull:"
    git status --short

    if ($NoAutoStash) {
      throw @"
git pull aborted because the working tree is dirty.
Run this manually on the server, then deploy again:

  cd $repoRoot
  git status
  git stash push -m "server-local-before-deploy"
  git pull --ff-only origin $Branch
"@
    }

    Write-Host "Stashing tracked local changes before pull..."
    git stash push -m "deploy-windows-server autostash"
    if ($LASTEXITCODE -ne 0) {
      throw "git stash failed with exit code $LASTEXITCODE."
    }
  }

  git fetch origin $Branch
  if ($LASTEXITCODE -ne 0) {
    throw "git fetch failed with exit code $LASTEXITCODE."
  }

  git pull --ff-only origin $Branch
  if ($LASTEXITCODE -ne 0) {
    Write-Host "git status after failed pull:"
    git status --short
    throw @"
git pull failed with exit code $LASTEXITCODE.
If the branch has diverged, reset to origin/$Branch on the server:

  cd $repoRoot
  git fetch origin
  git reset --hard origin/$Branch
"@
  }

  Set-Location $webDir
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
    Sync-GitRepository -Branch $GitBranch
  }

  Set-Location $webDir

  if (-not $SkipInstall) {
    npm.cmd ci
    if ($LASTEXITCODE -ne 0) {
      throw "npm ci failed with exit code $LASTEXITCODE."
    }
  }

  try {
    $env:SENTRY_RELEASE = (git -C $webDir rev-parse --short HEAD).Trim()
    Write-Host "SENTRY_RELEASE set to $($env:SENTRY_RELEASE)"
  } catch {
    Write-Host "SENTRY_RELEASE was not set from git."
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
