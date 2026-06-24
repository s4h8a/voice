$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Test-Path -LiteralPath ".env")) {
  Copy-Item -LiteralPath ".env.example" -Destination ".env"
}

docker compose up -d postgres redis
Write-Host "Starting AI Sales Calling Agent..."
Write-Host "Web: http://localhost:3000"
Write-Host "API: http://localhost:4000/api"
npm run dev
