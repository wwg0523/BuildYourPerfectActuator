#!/usr/bin/env pwsh
# Environment switching script

param(
    [ValidateSet("local", "nas")]
    [string]$Environment = "local"
)

$frontendEnv = ".\actuator-front\.env.$Environment"
$backendEnv = ".\actuator-back\.env.$Environment"
$frontendEnvTarget = ".\actuator-front\.env"
$backendEnvTarget = ".\actuator-back\.env"

if (-not (Test-Path $frontendEnv)) {
    Write-Host "File not found: $frontendEnv" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendEnv)) {
    Write-Host "File not found: $backendEnv" -ForegroundColor Red
    exit 1
}

Copy-Item $frontendEnv $frontendEnvTarget -Force
Copy-Item $backendEnv $backendEnvTarget -Force

Write-Host "Environment switched to: $Environment" -ForegroundColor Green
Write-Host ""
Write-Host "Current configuration:"
Write-Host "================================"

if ($Environment -eq "local") {
    Write-Host "Frontend: http://localhost:5005"
    Write-Host "Backend: http://localhost:4004"
    Write-Host "Database: localhost:5433"
    Write-Host ""
    Write-Host "Start with:"
    Write-Host "  docker-compose up -d --build"
} else {
    Write-Host "Frontend: https://pillar01.synology.me:5005"
    Write-Host "Backend: http://pillar01.synology.me:4004"
    Write-Host "Database: sacrp-postgres-local (NAS internal)"
    Write-Host ""
    Write-Host "Ready for NAS deployment!"
}
