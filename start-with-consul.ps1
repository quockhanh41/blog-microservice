# PowerShell script to start the blog microservices with Consul

Write-Host "🚀 Starting Blog Microservices with Consul" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Step 1: Start infrastructure services first
Write-Host "`n📋 Step 1: Starting infrastructure services..." -ForegroundColor Cyan
Write-Host "Starting: PostgreSQL, Redis, Kafka, Zookeeper, Consul..." -ForegroundColor Yellow

docker-compose up -d postgres-user postgres-post redis zookeeper kafka consul

Write-Host "⏳ Waiting for infrastructure services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 2: Check infrastructure health
Write-Host "`n📋 Step 2: Checking infrastructure health..." -ForegroundColor Cyan

$services = @{
    "postgres-user" = "postgres"
    "postgres-post" = "postgres" 
    "redis" = "redis"
    "kafka" = "kafka"
    "consul" = "consul"
}

foreach ($service in $services.Keys) {
    $running = docker ps --filter "name=blog-$service" --format "{{.Names}}" | Select-String "blog-$service"
    if ($running) {
        Write-Host "✅ $service is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $service is not running" -ForegroundColor Red
    }
}

# Step 3: Start application services
Write-Host "`n📋 Step 3: Starting application services..." -ForegroundColor Cyan
Write-Host "Starting: User Service, Post Service, Feed Service..." -ForegroundColor Yellow

docker-compose up -d user-service post-service feed-service

Write-Host "⏳ Waiting for application services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Step 4: Start API Gateway
Write-Host "`n📋 Step 4: Starting API Gateway..." -ForegroundColor Cyan
docker-compose up -d api-gateway

Write-Host "⏳ Waiting for API Gateway to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Check service registration
Write-Host "`n📋 Step 5: Checking service registration with Consul..." -ForegroundColor Cyan

$expectedServices = @("user-service", "post-service", "feed-service", "api-gateway")
$maxRetries = 30
$retryCount = 0

do {
    $retryCount++
    $registeredCount = 0
    
    foreach ($service in $expectedServices) {
        try {
            $health = docker-compose exec -T consul consul health service $service 2>$null
            if ($health) {
                $healthData = $health | ConvertFrom-Json
                $healthyInstances = ($healthData | Where-Object { 
                    $_.Checks | Where-Object { $_.Status -eq "passing" } 
                }).Count
                
                if ($healthyInstances -gt 0) {
                    $registeredCount++
                    Write-Host "✅ $service registered and healthy" -ForegroundColor Green
                } else {
                    Write-Host "⏳ $service registered but not healthy yet..." -ForegroundColor Yellow
                }
            } else {
                Write-Host "⏳ $service not registered yet..." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⏳ Checking $service..." -ForegroundColor Yellow
        }
    }
    
    if ($registeredCount -eq $expectedServices.Count) {
        break
    }
    
    if ($retryCount -lt $maxRetries) {
        Write-Host "⏳ Waiting for services to register... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($retryCount -lt $maxRetries)

# Step 6: Final status check
Write-Host "`n📋 Step 6: Final system status..." -ForegroundColor Cyan

Write-Host "`n🔧 Service Status:" -ForegroundColor White
docker-compose ps

Write-Host "`n🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  Consul UI:    http://localhost:8500" -ForegroundColor White
Write-Host "  API Gateway:  http://localhost:8080" -ForegroundColor White
Write-Host "  User Service: http://localhost:3001" -ForegroundColor White
Write-Host "  Post Service: http://localhost:3002" -ForegroundColor White
Write-Host "  Feed Service: http://localhost:3003" -ForegroundColor White

Write-Host "`n📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "  Check logs:           docker-compose logs [service-name]" -ForegroundColor White
Write-Host "  Scale service:        .\scale-service.ps1 -ServiceName [name] -ScaleCount [count]" -ForegroundColor White
Write-Host "  Test Consul:          .\test-consul.ps1" -ForegroundColor White
Write-Host "  Test API Gateway:     .\test-api-gateway.ps1" -ForegroundColor White
Write-Host "  Consul status:        .\consul-status.ps1" -ForegroundColor White
Write-Host "  Stop all:             docker-compose down" -ForegroundColor White

if ($registeredCount -eq $expectedServices.Count) {
    Write-Host "`n🎉 All services started successfully with Consul!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some services may not be fully registered yet. Check logs if needed." -ForegroundColor Yellow
    Write-Host "Run .\consul-status.ps1 to check current status." -ForegroundColor White
}

Write-Host "`n✨ Blog Microservices with Consul is ready!" -ForegroundColor Green
