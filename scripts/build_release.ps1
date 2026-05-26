<#
  build_release.ps1
  Creates a source ZIP from the publishable GIT_SYNC_GITHUB clone.
  Usage: powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1 -Version 2.1.0
#>
param(
  [string]$Version,
  [string]$OutName
)

if ($PSScriptRoot) {
  $ScriptPath = $PSScriptRoot
} else {
  $ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
}

$Root = Resolve-Path (Join-Path $ScriptPath "..")
Set-Location $Root

if ([string]::IsNullOrWhiteSpace($Version)) {
  $Version = (Get-Content -LiteralPath (Join-Path $Root 'version.json') -Raw | ConvertFrom-Json).version
}

if ([string]::IsNullOrWhiteSpace($OutName)) {
  $OutName = "quizdd-$Version-source.zip"
}

$SyncRoot = Join-Path $Root 'GIT_SYNC_GITHUB'

Write-Host "Refreshing GIT_SYNC_GITHUB before creating $OutName..."
node scripts\sync-to-git-source.js
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to refresh GIT_SYNC_GITHUB."
  exit 1
}

if (-not (Test-Path $SyncRoot)) {
  Write-Error "GIT_SYNC_GITHUB was not created."
  exit 1
}

$paths = Get-ChildItem -LiteralPath $SyncRoot -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object { $_.FullName }
if (-not $paths -or $paths.Count -eq 0) {
  Write-Error "GIT_SYNC_GITHUB is empty. Abort."
  exit 1
}

if (Test-Path $OutName) {
  Remove-Item $OutName -Force
}

try {
  Compress-Archive -LiteralPath $paths -DestinationPath $OutName -Force
} catch {
  Write-Error "Compress failed: $_"
  exit 2
}

Write-Host "Release ZIP ready: $OutName"
Write-Host "Source clone used: $SyncRoot"
