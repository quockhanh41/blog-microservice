# Start services in order: consul, api-gateway, services, frontend
Write-Host "Starting microservices in development mode using PM2 with .env files..." -ForegroundColor Green

# Navigate to the root directory
Set-Location -Path $PSScriptRoot/..

# Check if PM2 is installed
$pm2Installed = $null
try {
    $pm2Installed = Get-Command pm2 -ErrorAction Stop
} catch {
    Write-Host "PM2 is not installed. Installing PM2 globally..." -ForegroundColor Yellow
    npm install -g pm2
}

# Stop any running PM2 processes
Write-Host "Stopping any running PM2 processes..." -ForegroundColor Yellow
pm2 delete all

# Start services in order using the ecosystem.dev.config.js file
Write-Host "Starting services in order: consul, api-gateway, services, frontend..." -ForegroundColor Green
pm2 start script/ecosystem.dev.config.js

Write-Host "All services have been started in development mode." -ForegroundColor Green
Write-Host ""
Write-Host "- Consul UI:       http://localhost:8500" -ForegroundColor White
Write-Host "- API Gateway:     http://localhost:8080" -ForegroundColor White
Write-Host "- User Service:    http://localhost:3001" -ForegroundColor White
Write-Host "- Post Service:    http://localhost:3002" -ForegroundColor White
Write-Host "- Feed Service:    http://localhost:3003" -ForegroundColor White
Write-Host "- Frontend:        http://localhost:3000" -ForegroundColor White
Write-Host ""

# Hiển thị trạng thái của các dịch vụ
pm2 status

# Mở PM2 monitor
Write-Host "=== Đang mở giao diện giám sát (pm2 monit) ===" -ForegroundColor Magenta
pm2 monit
