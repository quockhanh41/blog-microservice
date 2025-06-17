# PowerShell script to test API Gateway with Consul integration

Write-Host "🧪 Testing API Gateway with Consul Integration" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

$baseUrl = "http://localhost:8080"
$maxRetries = 3

# Function to make HTTP request with retry
function Invoke-RequestWithRetry {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$MaxRetries = 3
    )
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $params = @{
                Uri = $Url
                Method = $Method
                Headers = $Headers
                TimeoutSec = 10
            }
            
            if ($Body) {
                $params.Body = $Body | ConvertTo-Json
                $params.ContentType = "application/json"
            }
            
            return Invoke-RestMethod @params
        } catch {
            if ($i -eq $MaxRetries) {
                throw $_
            }
            Write-Host "  ⏳ Retry $i/$MaxRetries..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
}

# Test 1: API Gateway Health Check
Write-Host "`n📋 Test 1: API Gateway Health Check" -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RequestWithRetry -Url "$baseUrl/health"
    if ($healthResponse.status -eq "healthy") {
        Write-Host "✅ API Gateway is healthy" -ForegroundColor Green
        Write-Host "  - Consul connected: $($healthResponse.consul.connected)" -ForegroundColor White
        Write-Host "  - Services discovered:" -ForegroundColor White
        foreach ($service in $healthResponse.consul.services.PSObject.Properties) {
            Write-Host "    - $($service.Name): $($service.Value) instances" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  API Gateway health check returned: $($healthResponse.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API Gateway health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Service Discovery Admin Endpoint
Write-Host "`n📋 Test 2: Service Discovery Status" -ForegroundColor Cyan
try {
    $servicesResponse = Invoke-RequestWithRetry -Url "$baseUrl/admin/services"
    Write-Host "✅ Service discovery working" -ForegroundColor Green
    
    foreach ($service in $servicesResponse.services.PSObject.Properties) {
        $serviceName = $service.Name
        $instances = $service.Value
        Write-Host "  - $serviceName : $($instances.Count) instances" -ForegroundColor White
        
        foreach ($instance in $instances) {
            Write-Host "    → $($instance.url) (ID: $($instance.id))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Service discovery test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Health Admin Endpoint
Write-Host "`n📋 Test 3: Admin Health Check" -ForegroundColor Cyan
try {
    $adminHealthResponse = Invoke-RequestWithRetry -Url "$baseUrl/admin/health"
    Write-Host "✅ Admin health endpoint working" -ForegroundColor Green
    Write-Host "  - Consul URL: $($adminHealthResponse.consul.url)" -ForegroundColor White
    Write-Host "  - Consul connected: $($adminHealthResponse.consul.connected)" -ForegroundColor White
    
    foreach ($service in $adminHealthResponse.services.PSObject.Properties) {
        $serviceName = $service.Name
        $serviceHealth = $service.Value
        Write-Host "  - $serviceName : $($serviceHealth.healthy) healthy instances" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Admin health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Proxy Functionality - User Service via Gateway
Write-Host "`n📋 Test 4: User Service Proxy Test" -ForegroundColor Cyan
try {
    # First check if we can reach user service health through gateway
    $userHealthResponse = Invoke-RequestWithRetry -Url "$baseUrl/users/health"
    Write-Host "✅ User Service proxy working" -ForegroundColor Green
    Write-Host "  - Response: $($userHealthResponse.service)" -ForegroundColor White
} catch {
    Write-Host "⚠️  User Service proxy test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "    This might be expected if user service endpoints are protected" -ForegroundColor Gray
}

# Test 5: Proxy Functionality - Post Service via Gateway
Write-Host "`n📋 Test 5: Post Service Proxy Test" -ForegroundColor Cyan
try {
    $postHealthResponse = Invoke-RequestWithRetry -Url "$baseUrl/posts/health"
    Write-Host "✅ Post Service proxy working" -ForegroundColor Green
    Write-Host "  - Response: $($postHealthResponse.service)" -ForegroundColor White
} catch {
    Write-Host "⚠️  Post Service proxy test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "    This might be expected if post service endpoints are protected" -ForegroundColor Gray
}

# Test 6: Proxy Functionality - Feed Service via Gateway
Write-Host "`n📋 Test 6: Feed Service Proxy Test" -ForegroundColor Cyan
try {
    $feedHealthResponse = Invoke-RequestWithRetry -Url "$baseUrl/feed/health"
    Write-Host "✅ Feed Service proxy working" -ForegroundColor Green
    Write-Host "  - Response: $($feedHealthResponse.service)" -ForegroundColor White
} catch {
    Write-Host "⚠️  Feed Service proxy test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "    This might be expected if feed service endpoints are protected" -ForegroundColor Gray
}

# Test 7: Load Balancing Test (if multiple instances exist)
Write-Host "`n📋 Test 7: Load Balancing Test" -ForegroundColor Cyan
try {
    $responses = @()
    for ($i = 1; $i -le 5; $i++) {
        try {
            $response = Invoke-RequestWithRetry -Url "$baseUrl/posts/health" -MaxRetries 1
            $responses += $response
            Start-Sleep -Milliseconds 500
        } catch {
            # Skip failed requests for load balancing test
        }
    }
    
    if ($responses.Count -gt 0) {
        Write-Host "✅ Load balancing test completed" -ForegroundColor Green
        Write-Host "  - Successful requests: $($responses.Count)/5" -ForegroundColor White
        
        # Check if requests hit different instances (if available)
        $uniqueResponses = $responses | Select-Object -Unique -Property service
        Write-Host "  - Unique service responses: $($uniqueResponses.Count)" -ForegroundColor White
    } else {
        Write-Host "⚠️  Load balancing test had no successful requests" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Load balancing test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 8: Cache Clear Test
Write-Host "`n📋 Test 8: Cache Management Test" -ForegroundColor Cyan
try {
    # Clear cache for user-service
    $clearResponse = Invoke-RequestWithRetry -Url "$baseUrl/admin/cache/clear/user-service" -Method "POST"
    Write-Host "✅ Cache management working" -ForegroundColor Green
    Write-Host "  - $($clearResponse.message)" -ForegroundColor White
    
    # Clear all cache
    $clearAllResponse = Invoke-RequestWithRetry -Url "$baseUrl/admin/cache/clear" -Method "POST"
    Write-Host "  - $($clearAllResponse.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Cache management test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "🌐 API Gateway URL: $baseUrl" -ForegroundColor Cyan
Write-Host "🔧 Admin Health: $baseUrl/admin/health" -ForegroundColor Cyan
Write-Host "📋 Admin Services: $baseUrl/admin/services" -ForegroundColor Cyan
Write-Host "🧹 Clear Cache: POST $baseUrl/admin/cache/clear" -ForegroundColor Cyan

Write-Host "`n📋 Service Endpoints via Gateway:" -ForegroundColor Cyan
Write-Host "  - User Service: $baseUrl/users/*" -ForegroundColor White
Write-Host "  - Post Service: $baseUrl/posts/*" -ForegroundColor White
Write-Host "  - Feed Service: $baseUrl/feed/*" -ForegroundColor White

Write-Host "`n✨ API Gateway Consul integration test completed!" -ForegroundColor Green
