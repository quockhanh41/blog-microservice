# PowerShell script to stop all PM2 services and infrastructure
Write-Host "=== Stopping Blog Microservices ===" -ForegroundColor Yellow

# Stop all PM2 processes
Write-Host "Stopping PM2 processes..." -ForegroundColor Yellow
pm2 stop all
pm2 delete all

# Show PM2 status
Write-Host "PM2 Status:" -ForegroundColor Green
pm2 list

# Stop infrastructure services
Write-Host "Stopping infrastructure services..." -ForegroundColor Yellow
docker-compose -f docker-compose.infrastructure.yml down

Write-Host "=== All services stopped ===" -ForegroundColor Green
Write-Host "To restart:" -ForegroundColor Cyan
Write-Host "  - Infrastructure + Microservices: .\start-with-pm2.ps1" -ForegroundColor White
Write-Host "  - Only microservices: pm2 start ecosystem.config.js" -ForegroundColor White
