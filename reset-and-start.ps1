#!/usr/bin/env pwsh

# Script để reset và khởi động lại toàn bộ Docker Compose stack
# Đảm bảo không có dữ liệu nào được lưu lại từ lần chạy trước

Write-Host "🔄 Stopping and removing all containers..." -ForegroundColor Yellow
docker-compose down --volumes --remove-orphans

Write-Host "🧹 Cleaning up Docker system..." -ForegroundColor Yellow
docker system prune -f

Write-Host "🗑️ Removing any remaining volumes..." -ForegroundColor Yellow
docker volume prune -f

Write-Host "🚀 Starting fresh containers..." -ForegroundColor Green
docker-compose up --build --force-recreate

Write-Host "✅ All services started with fresh data!" -ForegroundColor Green
