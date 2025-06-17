# PowerShell script to test Consul integration

Write-Host "🧪 Testing Consul Integration" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Test 1: Check Consul is running
Write-Host "`n📋 Test 1: Consul Container Status" -ForegroundColor Cyan
$consulRunning = docker ps --filter "name=blog-consul" --format "{{.Names}}" | Select-String "blog-consul"
if ($consulRunning) {
    Write-Host "✅ Consul container is running" -ForegroundColor Green
} else {
    Write-Host "❌ Consul container is not running" -ForegroundColor Red
    Write-Host "Start with: docker-compose up -d consul" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check service registration
Write-Host "`n📋 Test 2: Service Registration" -ForegroundColor Cyan
$expectedServices = @("user-service", "post-service", "feed-service", "api-gateway")
$registeredServices = docker-compose exec -T consul consul catalog services 2>$null | Where-Object { $_.Trim() -ne "" -and $_.Trim() -ne "consul" }

foreach ($service in $expectedServices) {
    if ($registeredServices -contains $service) {
        Write-Host "✅ $service is registered" -ForegroundColor Green
    } else {
        Write-Host "❌ $service is not registered" -ForegroundColor Red
    }
}

# Test 3: Health checks
Write-Host "`n📋 Test 3: Health Checks" -ForegroundColor Cyan
foreach ($service in $expectedServices) {
    try {
        $health = docker-compose exec -T consul consul health service $service 2>$null
        if ($health) {
            $healthData = $health | ConvertFrom-Json
            $passingChecks = ($healthData | Where-Object { 
                $_.Checks | Where-Object { $_.Status -eq "passing" } 
            }).Count
            
            if ($passingChecks -gt 0) {
                Write-Host "✅ $service health checks are passing" -ForegroundColor Green
            } else {
                Write-Host "⚠️  $service health checks are failing" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ $service health data not available" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $service health check failed" -ForegroundColor Red
    }
}

# Test 4: Service discovery
Write-Host "`n📋 Test 4: Service Discovery" -ForegroundColor Cyan
foreach ($service in $expectedServices) {
    try {
        $serviceData = docker-compose exec -T consul consul catalog service $service 2>$null
        if ($serviceData) {
            $instances = ($serviceData | ConvertFrom-Json).Count
            Write-Host "✅ $service discoverable ($instances instance(s))" -ForegroundColor Green
        } else {
            Write-Host "❌ $service not discoverable" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $service discovery failed" -ForegroundColor Red
    }
}

# Test 5: Test scaling
Write-Host "`n📋 Test 5: Service Scaling Test" -ForegroundColor Cyan
Write-Host "Scaling post-service to 2 instances..." -ForegroundColor Yellow

try {
    docker-compose up -d --scale post-service=2 --no-recreate 2>$null
    Start-Sleep -Seconds 15
    
    $postInstances = docker-compose exec -T consul consul catalog service post-service 2>$null
    if ($postInstances) {
        $instanceCount = ($postInstances | ConvertFrom-Json).Count
        if ($instanceCount -eq 2) {
            Write-Host "✅ Successfully scaled post-service to 2 instances" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Expected 2 instances, found $instanceCount" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Could not verify scaling" -ForegroundColor Red
    }
    
    # Scale back to 1
    Write-Host "Scaling back to 1 instance..." -ForegroundColor Yellow
    docker-compose up -d --scale post-service=1 --no-recreate 2>$null
} catch {
    Write-Host "❌ Scaling test failed" -ForegroundColor Red
}

# Test 6: API Gateway can discover services
Write-Host "`n📋 Test 6: API Gateway Integration" -ForegroundColor Cyan
try {
    $gatewayRunning = docker ps --filter "name=blog-api-gateway" --format "{{.Names}}" | Select-String "blog-api-gateway"
    if ($gatewayRunning) {
        Write-Host "✅ API Gateway is running" -ForegroundColor Green
        
        # Test if gateway health endpoint works
        $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -TimeoutSec 5 2>$null
        if ($response.StatusCode -eq 200) {
            $healthData = $response.Content | ConvertFrom-Json
            Write-Host "✅ API Gateway health check passed" -ForegroundColor Green
            
            if ($healthData.consul.connected) {
                Write-Host "✅ API Gateway connected to Consul" -ForegroundColor Green
                Write-Host "  - Services discovered:" -ForegroundColor White
                foreach ($service in $healthData.consul.services.PSObject.Properties) {
                    Write-Host "    - $($service.Name): $($service.Value) instances" -ForegroundColor Gray
                }
            } else {
                Write-Host "⚠️  API Gateway not connected to Consul" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠️  API Gateway health check failed" -ForegroundColor Yellow
        }
        
        # Test admin services endpoint
        try {
            $adminResponse = Invoke-WebRequest -Uri "http://localhost:8080/admin/services" -TimeoutSec 5 2>$null
            if ($adminResponse.StatusCode -eq 200) {
                Write-Host "✅ API Gateway service discovery working" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  API Gateway service discovery test failed" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  API Gateway is not running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not test API Gateway" -ForegroundColor Yellow
}

# Summary
Write-Host "`n📊 Summary" -ForegroundColor Green
Write-Host "=========" -ForegroundColor Green
Write-Host "🌐 Consul UI: http://localhost:8500" -ForegroundColor Cyan
Write-Host "🔧 API Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📋 Check service logs: docker-compose logs [service-name]" -ForegroundColor White
Write-Host "🔄 Scale services: .\scale-service.ps1 -ServiceName [name] -ScaleCount [count]" -ForegroundColor White
Write-Host "🧪 Test API Gateway: .\test-api-gateway.ps1" -ForegroundColor White

Write-Host "`n✨ Consul integration test completed!" -ForegroundColor Green
