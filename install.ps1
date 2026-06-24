param(
  [switch]$NoStart,
  [switch]$SkipDockerInstall
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Has-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Install-WingetPackage($Id, $Name) {
  if (-not (Has-Command winget)) {
    throw "winget is required. Install App Installer from Microsoft Store, then rerun install.ps1."
  }
  Write-Host "Installing $Name..."
  winget install --id $Id -e --accept-package-agreements --accept-source-agreements
}

function Refresh-Path {
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

function Start-DockerDesktop {
  $dockerDesktop = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  if (Test-Path -LiteralPath $dockerDesktop) {
    Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
  }
}

function Wait-Docker {
  for ($i = 0; $i -lt 60; $i++) {
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { return }
    Start-Sleep -Seconds 5
  }
  throw "Docker is installed but not ready. Start Docker Desktop, wait until it is running, then rerun install.ps1."
}

Write-Host "AI Sales Calling Agent installer"

if (-not (Has-Command node)) {
  Install-WingetPackage "OpenJS.NodeJS.LTS" "Node.js LTS"
  Refresh-Path
}

if (-not (Has-Command git)) {
  Install-WingetPackage "Git.Git" "Git"
  Refresh-Path
}

if (-not (Has-Command docker)) {
  if ($SkipDockerInstall) {
    throw "Docker is missing. Install Docker Desktop or rerun without -SkipDockerInstall."
  }
  Install-WingetPackage "Docker.DockerDesktop" "Docker Desktop"
  Refresh-Path
}

Start-DockerDesktop
Wait-Docker

if (-not (Test-Path -LiteralPath ".env")) {
  Copy-Item -LiteralPath ".env.example" -Destination ".env"
}

Copy-Item -LiteralPath ".env" -Destination "apps\api\.env" -Force

Write-Host "Installing npm dependencies..."
npm install --no-audit --no-fund

Write-Host "Starting database services..."
docker compose up -d postgres redis

Write-Host "Generating Prisma client and syncing database schema..."
npm run prisma:generate -w apps/api
npm run db:push

Write-Host "Seeding starter data..."
npm run db:seed

Write-Host ""
Write-Host "Installed successfully."
Write-Host "Web: http://localhost:3000"
Write-Host "API: http://localhost:4000/api"
Write-Host "Starter login: owner@example.com / Start@123456"

if (-not $NoStart) {
  .\start.ps1
}
