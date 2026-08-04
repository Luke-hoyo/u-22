param(
  [string]$BaseUrl = "https://hatarukun.jp",
  [int]$Retries = 12,
  [int]$DelaySeconds = 5
)

$ErrorActionPreference = "Stop"

function Test-Endpoint {
  param(
    [string]$Path
  )

  $url = "$BaseUrl$Path"

  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20
    return [pscustomobject]@{
      Path = $Path
      Ok = $true
      StatusCode = [int]$response.StatusCode
      Body = $response.Content
    }
  } catch {
    $statusCode = $null

    if ($_.Exception.Response) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    }

    return [pscustomobject]@{
      Path = $Path
      Ok = $false
      StatusCode = $statusCode
      Body = $_.Exception.Message
    }
  }
}

for ($attempt = 1; $attempt -le $Retries; $attempt++) {
  Write-Host "Health check attempt $attempt/$Retries"

  $health = Test-Endpoint -Path "/api/health"
  $sentry = Test-Endpoint -Path "/api/health/sentry"

  if ($health.Ok -and $sentry.Ok) {
    Write-Host "OK: $($health.Body)"
    Write-Host "OK: $($sentry.Body)"
    exit 0
  }

  Write-Host "Not ready yet:"
  Write-Host " - /api/health => $($health.StatusCode) $($health.Body)"
  Write-Host " - /api/health/sentry => $($sentry.StatusCode) $($sentry.Body)"

  if ($attempt -lt $Retries) {
    Start-Sleep -Seconds $DelaySeconds
  }
}

Write-Host ""
Write-Host "Production health check failed."
Write-Host "Try on the server:"
Write-Host "  cd C:\hatarukun\u-22\apps\web"
Write-Host "  npm run deploy:server"
Write-Host ""
Write-Host "If deploy succeeds but health still fails, inspect Scheduled Task 'HatarukunWeb' and node.exe logs."

exit 1
