param(
  [string]$Domain = "hatarukun.jp"
)

$ErrorActionPreference = "Continue"

Write-Host "== DNS =="
try {
  Resolve-DnsName $Domain -Type A | Select-Object Name,IPAddress
} catch {
  Write-Warning "DNS lookup failed for $Domain"
}

Write-Host ""
Write-Host "== Ports =="
Test-NetConnection $Domain -Port 80 | Select-Object ComputerName,RemotePort,TcpTestSucceeded
Test-NetConnection $Domain -Port 443 | Select-Object ComputerName,RemotePort,TcpTestSucceeded

Write-Host ""
Write-Host "== IIS bindings =="
try {
  Import-Module WebAdministration
  Get-Website | Select-Object ID,Name,State,PhysicalPath
  Get-WebBinding | Select-Object protocol,bindingInformation
} catch {
  Write-Warning "IIS WebAdministration module is not available."
}

Write-Host ""
Write-Host "== HTTP headers =="
try {
  curl.exe -I "http://$Domain"
} catch {
  Write-Warning "HTTP check failed."
}

Write-Host ""
Write-Host "== HTTPS headers =="
try {
  curl.exe -I "https://$Domain"
} catch {
  Write-Warning "HTTPS check failed."
}

