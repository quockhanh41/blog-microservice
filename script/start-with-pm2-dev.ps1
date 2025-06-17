# PowerShell script to start all services with PM2 in development mode
Write-Host "=== Starting Blog Microservices with PM2 (Development Mode) ===" -ForegroundColor Green

# Check if PM2 is installed
if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "PM2 not found. Installing PM2..." -ForegroundColor Yellow
    npm install -g pm2
}

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop any existing PM2 processes
Write-Host "Stopping existing PM2 processes..." -ForegroundColor Yellow
pm2 delete all 2>$null

# Start infrastructure services with Docker
Write-Host "Starting infrastructure services (PostgreSQL, Redis, Kafka, Consul)..." -ForegroundColor Yellow
docker-compose -f docker-compose.infrastructure.yml down 2>$null
docker-compose -f docker-compose.infrastructure.yml up -d

# Wait for services to be healthy
Write-Host "Waiting for infrastructure services to be ready..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
$interval = 5

do {
    $healthStatus = docker-compose -f docker-compose.infrastructure.yml ps --format json | ConvertFrom-Json
    $allHealthy = $true
    
    foreach ($service in $healthStatus) {
        if ($service.Health -ne "healthy" -and $service.Health -ne "") {
            $allHealthy = $false
            break
        }
    }
    
    if (-not $allHealthy) {
        Write-Host "Waiting for services to be healthy... ($waited/$maxWait seconds)" -ForegroundColor Cyan
        Start-Sleep $interval
        $waited += $interval
    }
} while (-not $allHealthy -and $waited -lt $maxWait)

if ($waited -ge $maxWait) {
    Write-Host "Warning: Infrastructure services may not be fully ready, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "Infrastructure services are ready!" -ForegroundColor Green
}

# Build all backend services (not frontend in dev mode)
Write-Host "Building backend services..." -ForegroundColor Yellow
foreach ($service in @("user-service", "post-service", "feed-service")) {
    Write-Host "Building $service..." -ForegroundColor Cyan
    Set-Location $service
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed for $service. Please check the errors above." -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
}

# Start services with PM2 using development config
Write-Host "Starting microservices with PM2 (Development Mode)..." -ForegroundColor Yellow
pm2 start ecosystem.dev.config.js

# Show PM2 status
Write-Host "PM2 Status:" -ForegroundColor Green
pm2 list

Write-Host "=== Services started successfully in Development Mode! ===" -ForegroundColor Green
Write-Host "Infrastructure services (Docker):" -ForegroundColor Cyan
Write-Host "  - PostgreSQL User DB: localhost:5432" -ForegroundColor White
Write-Host "  - PostgreSQL Post DB: localhost:5433" -ForegroundColor White
Write-Host "  - Redis: localhost:6379" -ForegroundColor White
Write-Host "  - Kafka: localhost:29092" -ForegroundColor White
Write-Host "  - Consul: http://localhost:8500" -ForegroundColor White
Write-Host ""
Write-Host "Microservices (PM2 - Development):" -ForegroundColor Cyan
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  - User Service: http://localhost:3001" -ForegroundColor White
Write-Host "  - Post Service: http://localhost:3002" -ForegroundColor White
Write-Host "  - Feed Service: http://localhost:3003" -ForegroundColor White
Write-Host "  - Frontend (Dev Server): http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Management commands:" -ForegroundColor Cyan
Write-Host "  - Monitor: pm2 monit" -ForegroundColor White
Write-Host "  - Logs: pm2 logs" -ForegroundColor White
Write-Host "  - Stop: .\stop-pm2.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Note: Frontend is running in development mode with hot reload." -ForegroundColor Yellow
Write-Host "For production mode, use .\start-with-pm2.ps1" -ForegroundColor Yellow
