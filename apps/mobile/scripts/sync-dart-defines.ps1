param(
    [switch]$ForceFromWeb
)

$ErrorActionPreference = "Stop"

$MobileRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$DefinesFile = Join-Path $MobileRoot "dart_defines.local.json"
$WebRoot = Resolve-Path (Join-Path $MobileRoot "../web")

function Read-DotEnv {
    param([string]$Path)

    $vars = @{}

    if (-not (Test-Path $Path)) {
        return $vars
    }

    Get-Content -LiteralPath $Path | ForEach-Object {
        $line = $_.Trim()

        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $separator = $line.IndexOf("=")

        if ($separator -lt 1) {
            return
        }

        $name = $line.Substring(0, $separator).Trim()
        $value = $line.Substring($separator + 1).Trim().Trim('"').Trim("'")
        $vars[$name] = $value
    }

    return $vars
}

function Read-DefinesJson {
    param([string]$Path)

    $defines = @{}

    if (-not (Test-Path $Path)) {
        return $defines
    }

    $obj = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json

    foreach ($property in $obj.PSObject.Properties) {
        $defines[$property.Name] = [string]$property.Value
    }

    return $defines
}

function Write-DefinesJson {
    param(
        [string]$Path,
        [hashtable]$Defines
    )

    $ordered = [ordered]@{}

    foreach ($key in @("CLERK_PUBLISHABLE_KEY", "SENTRY_DSN", "SENTRY_ENVIRONMENT")) {
        if ($Defines.ContainsKey($key) -and $Defines[$key]) {
            $ordered[$key] = [string]$Defines[$key]
        }
    }

    foreach ($entry in $Defines.GetEnumerator()) {
        if (-not $ordered.Contains($entry.Key) -and $entry.Value) {
            $ordered[$entry.Key] = [string]$entry.Value
        }
    }

    $json = ($ordered | ConvertTo-Json -Depth 3) + [Environment]::NewLine
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($Path, $json, $utf8NoBom)
}

$webEnvPath = @(
    (Join-Path $WebRoot ".env.local"),
    (Join-Path $WebRoot ".env.production")
) | Where-Object { Test-Path $_ } | Select-Object -First 1

$defines = Read-DefinesJson -Path $DefinesFile

if ($webEnvPath) {
    $webEnv = Read-DotEnv -Path $webEnvPath

    $synced = @{
        CLERK_PUBLISHABLE_KEY = $webEnv["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"]
        SENTRY_DSN = $(if ($webEnv["SENTRY_DSN"]) { $webEnv["SENTRY_DSN"] } else { $webEnv["NEXT_PUBLIC_SENTRY_DSN"] })
        SENTRY_ENVIRONMENT = $webEnv["SENTRY_ENVIRONMENT"]
    }

    foreach ($entry in $synced.GetEnumerator()) {
        if (-not $entry.Value) {
            continue
        }

        if ($ForceFromWeb -or -not $defines.ContainsKey($entry.Key) -or -not $defines[$entry.Key]) {
            $defines[$entry.Key] = $entry.Value
        }
    }

    Write-Host "Synced dart_defines.local.json from $webEnvPath"
}
elseif (-not (Test-Path $DefinesFile)) {
    $example = Join-Path $MobileRoot "dart_defines.example.json"

    if (-not (Test-Path $example)) {
        throw "Missing dart_defines.local.json and apps/web/.env.local|.env.production"
    }

    Copy-Item -LiteralPath $example -Destination $DefinesFile
    Write-Host "Created dart_defines.local.json from dart_defines.example.json"
    Write-Host "Edit apps/mobile/dart_defines.local.json and set real keys."
}

if (-not $defines -or $defines.Count -eq 0) {
    throw "dart_defines.local.json is empty. Copy dart_defines.example.json and set keys."
}

Write-DefinesJson -Path $DefinesFile -Defines $defines
Write-Host "Wrote $DefinesFile"
