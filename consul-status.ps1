# PowerShell script to check Consul cluster status and registered services

Write-Host "🔍 Consul Cluster Status" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Check if Consul container is running
$ConsulRunning = docker ps --filter "name=blog-consul" --format "table {{.Names}}\t{{.Status}}" | Select-String "blog-consul"

if (-not $ConsulRunning) {
    Write-Host "❌ Consul container is not running!" -ForegroundColor Red
    Write-Host "Start Consul with: docker-compose up -d consul" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Consul container is running" -ForegroundColor Green
Write-Host ""

# Check Consul members
Write-Host "📋 Consul Cluster Members:" -ForegroundColor Cyan
try {
    docker-compose exec -T consul consul members
} catch {
    Write-Host "❌ Failed to get Consul members" -ForegroundColor Red
}

Write-Host ""

# List all registered services
Write-Host "🔧 Registered Services:" -ForegroundColor Cyan
try {
    $services = docker-compose exec -T consul consul catalog services 2>$null
    if ($services) {
        $services | ForEach-Object { 
            $serviceName = $_.Trim()
            if ($serviceName -and $serviceName -ne "consul") {
                Write-Host "  - $serviceName" -ForegroundColor White
                
                # Get service instances
                $instances = docker-compose exec -T consul consul catalog service $serviceName 2>$null
                if ($instances) {
                    $instances | ConvertFrom-Json | ForEach-Object {
                        Write-Host "    → $($_.ServiceName) @ $($_.ServiceAddress):$($_.ServicePort) (ID: $($_.ServiceID))" -ForegroundColor Gray
                    }
                }
            }
        }
    } else {
        Write-Host "  No services registered" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to get registered services" -ForegroundColor Red
}

Write-Host ""

# Check service health
Write-Host "🏥 Service Health Status:" -ForegroundColor Cyan
try {
    $healthServices = @("user-service", "post-service", "feed-service", "api-gateway")
    foreach ($service in $healthServices) {
        try {
            $health = docker-compose exec -T consul consul health service $service 2>$null
            if ($health) {
                $healthData = $health | ConvertFrom-Json
                $healthyCount = ($healthData | Where-Object { $_.Checks | Where-Object { $_.Status -eq "passing" } }).Count
                $totalCount = $healthData.Count
                
                if ($healthyCount -eq $totalCount -and $totalCount -gt 0) {
                    Write-Host "  ✅ $service ($healthyCount/$totalCount healthy)" -ForegroundColor Green
                } elseif ($healthyCount -gt 0) {
                    Write-Host "  ⚠️  $service ($healthyCount/$totalCount healthy)" -ForegroundColor Yellow
                } else {
                    Write-Host "  ❌ $service (0/$totalCount healthy)" -ForegroundColor Red
                }
            } else {
                Write-Host "  ⚪ $service (not registered)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  ⚪ $service (not registered)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Failed to get service health status" -ForegroundColor Red
}

Write-Host ""

# Display Consul UI information
Write-Host "🌐 Consul Web UI:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:8500" -ForegroundColor White

Write-Host ""

# Show useful commands
Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "  Check specific service: docker-compose exec consul consul health service <service-name>" -ForegroundColor White
Write-Host "  View Consul logs: docker-compose logs consul" -ForegroundColor White
Write-Host "  Scale a service: .\scale-service.ps1 -ServiceName <service> -ScaleCount <count>" -ForegroundColor White
