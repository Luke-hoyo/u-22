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
  Write-Host "apps/web/.env.production がありません。先に .env.example をコピーして本番用の値を入れてください。"
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
    Write-Host "Scheduled Task '$TaskName' を再起動しました。"
  } else {
    Write-Host "Scheduled Task '$TaskName' が見つかりません。初回は手順書に沿ってタスクを作成してください。"
  }
}
