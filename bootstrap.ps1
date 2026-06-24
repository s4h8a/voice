param(
  [string]$RepoUrl = $env:AI_SALES_REPO_URL,
  [string]$InstallDir = "$env:USERPROFILE\ai-sales-calling-agent"
)

$ErrorActionPreference = "Stop"

function Has-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Install-WingetPackage($Id, $Name) {
  if (-not (Has-Command winget)) {
    throw "winget is required. Install App Installer from Microsoft Store, then rerun this command."
  }
  Write-Host "Installing $Name..."
  winget install --id $Id -e --accept-package-agreements --accept-source-agreements
}

if (-not $RepoUrl) {
  $RepoUrl = "https://github.com/YOUR_ORG/ai-sales-calling-agent.git"
}

if (-not (Has-Command git)) {
  Install-WingetPackage "Git.Git" "Git"
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

if (-not (Test-Path -LiteralPath $InstallDir)) {
  git clone $RepoUrl $InstallDir
}

Set-Location $InstallDir
.\install.ps1
