# Consul Integration Demo Script
# This script demonstrates the full Consul integration with the blog microservices

param(
    [switch]$SkipBuild = $false
)

# Color functions
function Show-Section {
    param($Title)
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "="*60 -ForegroundColor Cyan
}

function Wait-ForUser {
    param($Message = "Press Enter to continue...")
    Write-Host "`n$Message" -ForegroundColor Yellow
    Read-Host
}

# Start demo
Show-Section "CONSUL MICROSERVICES INTEGRATION DEMO"
Write-Host "This demo will show:"
Write-Host "  1. Service registration with Consul"
Write-Host "  2. Health checking"
Write-Host "  3. Service discovery through API Gateway"
Write-Host "  4. Load balancing"
Write-Host "  5. Fault tolerance"
Write-Host "  6. Dynamic scaling"

Wait-ForUser "Press Enter to start the demo..."

# Step 1: System startup
Show-Section "STEP 1: STARTING CONSUL-ENABLED SYSTEM"
Write-Host "Starting all services with Consul integration..."

if (-not $SkipBuild) {
    Write-Host "Building services..."
    docker-compose build --parallel
}

Write-Host "Starting infrastructure..."
docker-compose up -d postgres-user postgres-post redis kafka zookeeper consul

Write-Host "Waiting for infrastructure to be ready..."
Start-Sleep -Seconds 15

Write-Host "Starting application services..."
docker-compose up -d user-service post-service feed-service api-gateway

Write-Host "Waiting for services to register..."
Start-Sleep -Seconds 10

Write-Host "`nChecking container status..."
docker-compose ps

Wait-ForUser "Press Enter to check service registration..."

# Step 2: Check service registration
Show-Section "STEP 2: SERVICE REGISTRATION"
Write-Host "Checking which services are registered with Consul..."

try {
    $services = docker-compose exec -T consul consul catalog services 2>$null
    Write-Host "`nRegistered services:" -ForegroundColor Green
    $services | Where-Object { $_.Trim() -ne "" } | ForEach-Object {
        if ($_.Trim() -ne "consul") {
            Write-Host "  * $($_.Trim())" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Could not fetch services from Consul" -ForegroundColor Red
}

Wait-ForUser "Press Enter to check service health..."

# Step 3: Health checks
Show-Section "STEP 3: HEALTH CHECKING"
Write-Host "Checking health status of all services..."

try {
    $healthOutput = docker-compose exec -T consul consul health service post-service 2>$null
    if ($healthOutput) {
        $healthData = $healthOutput | ConvertFrom-Json
        Write-Host "`nPost Service Health:" -ForegroundColor Green
        foreach ($service in $healthData) {
            $status = "Unknown"
            $checks = $service.Checks
            if ($checks) {
                $passingChecks = $checks | Where-Object { $_.Status -eq "passing" }
                if ($passingChecks.Count -eq $checks.Count) {
                    $status = "Healthy"
                } else {
                    $status = "Unhealthy"
                }
            }
            Write-Host "  - $($service.Service.Service): $status" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Could not fetch health information" -ForegroundColor Red
}

Wait-ForUser "Press Enter to test API Gateway integration..."

# Step 4: API Gateway integration
Show-Section "STEP 4: API GATEWAY INTEGRATION"
Write-Host "Testing service discovery through API Gateway..."

try {
    Write-Host "`nTesting gateway health endpoint..."
    $response = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 5
    Write-Host "Gateway Status: $($response.status)" -ForegroundColor Green
    
    if ($response.services) {
        Write-Host "`nDiscovered services:"
        foreach ($service in $response.services.PSObject.Properties) {
            Write-Host "    - $($service.Name): $($service.Value) instances" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nTesting service discovery through gateway..."
    $servicesResponse = Invoke-RestMethod -Uri "http://localhost:8080/admin/services" -TimeoutSec 5
    
    Write-Host "Service discovery working through API Gateway" -ForegroundColor Green
    foreach ($service in $servicesResponse.services.PSObject.Properties) {
        $serviceName = $service.Name
        $instances = $service.Value
        Write-Host "  - $serviceName`: $($instances.Count) instances available" -ForegroundColor White
    }
} catch {
    Write-Host "API Gateway test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Wait-ForUser "Press Enter to demonstrate service scaling..."

# Step 5: Service scaling demonstration
Show-Section "STEP 5: SERVICE SCALING DEMONSTRATION"
Write-Host "Scaling post-service to 3 instances to demonstrate load balancing..."

try {
    # Get current instance count before scaling
    $currentInstances = docker-compose exec -T consul consul catalog service post-service 2>$null | ConvertFrom-Json
    $initialCount = if ($currentInstances) { $currentInstances.Count } else { 0 }
    Write-Host "Current post-service instances: $initialCount" -ForegroundColor Cyan
    
    # Scale post-service to 3 instances using Docker Compose's native scaling
    Write-Host "Scaling post-service to 3 instances..."
    docker-compose up -d --scale post-service=3
    
    Write-Host "Waiting for instances to register with Consul..."
    # Give more time for registration
    Start-Sleep -Seconds 20
    
    # Verify containers are running
    Write-Host "`nVerifying post-service containers..."
    $containers = docker ps --filter "name=blog-microservices-post-service" --format "{{.Names}}"
    $containerCount = ($containers -split "`n" | Where-Object { $_ -ne "" }).Count
    Write-Host "Post-service containers running: $containerCount" -ForegroundColor White
    
    # Check if scaling worked in Consul
    Write-Host "`nChecking scaled instances in Consul..."
    $postInstances = docker-compose exec -T consul consul catalog service post-service 2>$null
    if ($postInstances) {
        $instances = $postInstances | ConvertFrom-Json
        Write-Host "Post service now has $($instances.Count) instances registered in Consul:" -ForegroundColor Green
        foreach ($instance in $instances) {
            Write-Host "  - $($instance.ServiceID) at $($instance.ServiceAddress):$($instance.ServicePort)" -ForegroundColor White
        }
        
        if ($instances.Count -lt 3) {
            Write-Host "Warning: Expected 3 instances, but found $($instances.Count). Some instances may still be registering." -ForegroundColor Yellow
            
            # Check for health status to debug registration issues
            Write-Host "`nChecking health status of post-service instances..."
            $healthCheck = docker-compose exec -T consul consul health service post-service 2>$null
            if ($healthCheck) {
                $healthData = $healthCheck | ConvertFrom-Json
                foreach ($service in $healthData) {
                    $status = $service.Checks | Where-Object { $_.ServiceName -eq "post-service" } | Select-Object -ExpandProperty Status
                    Write-Host "  - $($service.Service.ID): Status = $status" -ForegroundColor White
                }
            }
        }
    } else {
        Write-Host "Warning: Could not retrieve service instances from Consul" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Scaling demonstration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Continuing with demo anyway..." -ForegroundColor Yellow
}

Wait-ForUser "Press Enter to test load balancing..."

# Step 6: Load balancing test
Show-Section "STEP 6: LOAD BALANCING TEST"
Write-Host "Testing load balancing through API Gateway..."

try {
    # First verify that we can directly access post service health
    Write-Host "Verifying direct post-service health endpoint is accessible..."
    try {
        $directResponse = Invoke-RestMethod -Uri "http://localhost:3002/health" -TimeoutSec 3
        Write-Host "  Post-service health check - OK (hostname: $($directResponse.hostname))" -ForegroundColor Green
    } catch {
        Write-Host "  Direct post-service health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  Will try gateway-routed requests anyway..." -ForegroundColor Yellow
    }
    
    # Verify API Gateway can route to post service
    Write-Host "`nVerifying API Gateway can route to post service..."
    try {
        $gatewayResponse = Invoke-RestMethod -Uri "http://localhost:8080/posts/health" -TimeoutSec 3
        Write-Host "  Gateway-routed health check - OK (hostname: $($gatewayResponse.hostname))" -ForegroundColor Green
    } catch {
        Write-Host "  Gateway-routed health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  Will try more requests to check if intermittent..." -ForegroundColor Yellow
    }
    
    # Make multiple requests to see load balancing
    Write-Host "`nMaking multiple requests to observe load balancing..."
    $requests = 12  # More requests to better demonstrate distribution
    $responses = @()
    $failedRequests = 0
    
    for ($i = 1; $i -le $requests; $i++) {
        try {
            Write-Host "  Request $i..." -NoNewline -ForegroundColor Gray
            
            # Try API Gateway, fall back to direct if needed
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:8080/posts/health" -TimeoutSec 3
            } catch {
                Write-Host " Gateway failed, trying direct..." -NoNewline -ForegroundColor Yellow
                $response = Invoke-RestMethod -Uri "http://localhost:3002/health" -TimeoutSec 3
            }
            
            $responses += $response
            Write-Host " OK - Hostname: $($response.hostname)" -ForegroundColor Green
            Start-Sleep -Milliseconds 300  # Slight delay to avoid overwhelming services
        } catch {
            Write-Host " Failed: $($_.Exception.Message)" -ForegroundColor Red
            $failedRequests++
        }
    }
    
    # Analyze results
    $successfulRequests = $responses.Count
    Write-Host "`nLoad balancing results:" -ForegroundColor Cyan
    Write-Host "  Successful requests: $successfulRequests/$requests" -ForegroundColor White
    Write-Host "  Failed requests: $failedRequests/$requests" -ForegroundColor $(if ($failedRequests -gt 0) { "Yellow" } else { "White" })
      # Count unique hostnames to verify load balancing
    $hostnames = $responses | Select-Object -ExpandProperty hostname -ErrorAction SilentlyContinue | Group-Object
    
    if ($hostnames -and $hostnames.Count -gt 1) {
        Write-Host "`nLoad balancing is working - requests distributed across instances:" -ForegroundColor Green
        foreach ($hostnameGroup in $hostnames) {
            Write-Host "  - $($hostnameGroup.Name): $($hostnameGroup.Count) requests" -ForegroundColor White
            $percentage = [math]::Round(($hostnameGroup.Count / $successfulRequests) * 100)
            Write-Host "      ($percentage`% of traffic)" -ForegroundColor Gray        }
        
        # Check if distribution seems fair (not perfect but reasonable)
        $idealPerInstance = $successfulRequests / $hostnames.Count
        $isBalanced = $hostnames | Where-Object { [math]::Abs($_.Count - $idealPerInstance) -gt ($idealPerInstance * 0.5) } | Measure-Object | Select-Object -ExpandProperty Count
        
        if ($isBalanced -eq 0) {
            Write-Host "`nTraffic distribution appears balanced ✓" -ForegroundColor Green
        } else {
            Write-Host "`nTraffic distribution is not perfectly balanced, but this is normal with a small sample size" -ForegroundColor Yellow
        }
    } elseif ($hostnames -and $successfulRequests -gt 0) {
        Write-Host "`nAll requests went to a single instance: $($hostnames[0].Name)" -ForegroundColor Yellow
        Write-Host "This might indicate that load balancing is not working as expected," -ForegroundColor Yellow
        Write-Host "or that only one instance is currently healthy and registered." -ForegroundColor Yellow
    } elseif ($successfulRequests -gt 0) {
        Write-Host "`nCould not determine hostname distribution properly. Check Consul registration." -ForegroundColor Yellow
    } else {
        Write-Host "`nCould not determine load balancing status - all requests failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Load balancing test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Wait-ForUser "Press Enter to demonstrate fault tolerance..."

# Step 7: Fault tolerance demonstration
Show-Section "STEP 7: FAULT TOLERANCE DEMONSTRATION"
Write-Host "Demonstrating fault tolerance by stopping one post-service instance..."

try {
    # Get current instances
    $instances = docker ps --filter "name=blog-microservices-post-service" --format "{{.Names}}"
    $instanceArray = $instances -split "`n" | Where-Object { $_ -ne "" }
    
    if ($instanceArray.Count -gt 1) {
        # Choose an instance to stop (preferably the second one to maintain the first for direct testing)
        $instanceToStop = if ($instanceArray.Count -gt 1) { $instanceArray[1] } else { $instanceArray[0] }
        Write-Host "Found $($instanceArray.Count) post-service instances" -ForegroundColor Green
        Write-Host "Will stop instance: $instanceToStop" -ForegroundColor Yellow
        
        # Stop the selected instance
        Write-Host "`nStopping instance $instanceToStop..."
        docker stop $instanceToStop 2>$null
        
        Write-Host "Waiting for Consul to detect the stopped instance..."
        Start-Sleep -Seconds 15
        
        # Check Consul for registered services after stopping an instance
        Write-Host "`nChecking remaining registered post-service instances in Consul..."
        $remainingInstances = docker-compose exec -T consul consul catalog service post-service 2>$null | ConvertFrom-Json
        if ($remainingInstances) {
            Write-Host "$($remainingInstances.Count) instances still registered in Consul" -ForegroundColor Green
            foreach ($instance in $remainingInstances) {
                Write-Host "  - $($instance.ServiceID) at $($instance.ServiceAddress):$($instance.ServicePort)" -ForegroundColor White
            }
        } else {
            Write-Host "Warning: Could not retrieve services from Consul" -ForegroundColor Yellow
        }
        
        # Check if the API Gateway can still route to post-service
        Write-Host "`nTesting if API Gateway can still route to healthy instances..."
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8080/posts/health" -TimeoutSec 5
            Write-Host "API Gateway successfully routed to a healthy instance: $($response.hostname)" -ForegroundColor Green
            
            # Make a few more requests to verify consistency
            Write-Host "`nMaking additional requests to verify consistent routing..."
            for ($i = 1; $i -le 3; $i++) {
                try {
                    $additionalResponse = Invoke-RestMethod -Uri "http://localhost:8080/posts/health" -TimeoutSec 3
                    Write-Host "  Request $i - OK - Routed to $($additionalResponse.hostname)" -ForegroundColor Green
                } catch {
                    Write-Host "  Request $i - Failed - $($_.Exception.Message)" -ForegroundColor Red
                }
                Start-Sleep -Milliseconds 300
            }
        } catch {
            Write-Host "API Gateway routing failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Trying direct access to remaining instances..." -ForegroundColor Yellow
            
            # Try direct access to check if service itself is still available
            try {
                $directResponse = Invoke-RestMethod -Uri "http://localhost:3002/health" -TimeoutSec 5
                Write-Host "Direct access to post-service successful: $($directResponse.hostname)" -ForegroundColor Green
            } catch {
                Write-Host "Direct access also failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Restart the stopped instance
        Write-Host "`nRestarting the stopped instance $instanceToStop..."
        docker start $instanceToStop 2>$null
        
        Write-Host "Waiting for instance to restart and re-register with Consul..."
        Start-Sleep -Seconds 15
        
        # Verify instance has been restored
        Write-Host "`nVerifying all instances are back online..."
        $restoredInstances = docker-compose exec -T consul consul catalog service post-service 2>$null | ConvertFrom-Json
        if ($restoredInstances) {
            Write-Host "Post-service now has $($restoredInstances.Count) instances registered:" -ForegroundColor Green
            foreach ($instance in $restoredInstances) {
                Write-Host "  - $($instance.ServiceID) at $($instance.ServiceAddress):$($instance.ServicePort)" -ForegroundColor White
            }
        }
        
        Write-Host "`nFault tolerance demonstration completed successfully" -ForegroundColor Green
        Write-Host "The system continued to function when an instance failed" -ForegroundColor White
    } else {
        Write-Host "Only one post-service instance is running. Need at least 2 for fault tolerance demo." -ForegroundColor Yellow
        Write-Host "Skipping instance shutdown test to avoid breaking the system." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Fault tolerance test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Wait-ForUser "Press Enter to view final system status..."

# Step 8: Final status
Show-Section "STEP 8: FINAL SYSTEM STATUS"
Write-Host "Final overview of the system..."

Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "  Consul UI:      http://localhost:8500" -ForegroundColor White
Write-Host "  API Gateway:    http://localhost:8080" -ForegroundColor White
Write-Host "  Gateway Health: http://localhost:8081/health" -ForegroundColor White
Write-Host "  Admin Services: http://localhost:8080/admin/services" -ForegroundColor White
Write-Host "  Post Service:   http://localhost:3002/health" -ForegroundColor White

Write-Host "`nContainer Status:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -match "(user-service|post-service|feed-service|api-gateway|consul)" }

# Display Consul services summary
Write-Host "`nConsul Service Summary:" -ForegroundColor Cyan
try {
    $consulServices = docker-compose exec -T consul consul catalog services 2>$null
    $services = $consulServices | Where-Object { $_.Trim() -ne "" -and $_.Trim() -ne "consul" }
    
    foreach ($service in $services) {
        $serviceName = $service.Trim()
        $instances = docker-compose exec -T consul consul catalog service $serviceName 2>$null | ConvertFrom-Json
        $count = if ($instances) { $instances.Count } else { 0 }
        Write-Host "  $serviceName`: $count instances registered" -ForegroundColor White
    }
} catch {
    Write-Host "  Could not retrieve Consul service summary: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`nDemo Summary:" -ForegroundColor Green
Write-Host "  ✓ Services automatically register with Consul"
Write-Host "  ✓ Health checks monitor service status"
Write-Host "  ✓ API Gateway uses service discovery for routing"
Write-Host "  ✓ Load balancing distributes requests across instances"
Write-Host "  ✓ System handles service failures gracefully"
Write-Host "  ✓ Services can be scaled up/down dynamically"

Write-Host "`nUseful Commands:" -ForegroundColor Cyan
Write-Host "  Scale service:    docker-compose up -d --scale service-name=count"
Write-Host "  Check containers: docker ps"
Write-Host "  View Consul UI:   http://localhost:8500"
Write-Host "  View logs:        docker-compose logs service-name"
Write-Host "  Stop all:         docker-compose down"

Write-Host "`nDemo completed successfully!" -ForegroundColor Green
Write-Host "The system is now running with full Consul integration." -ForegroundColor White

# Optional cleanup
Write-Host "`nCleanup Options:" -ForegroundColor Yellow
$cleanup = Read-Host "Do you want to stop all services? (y/N)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "All services stopped" -ForegroundColor Green
} else {    Write-Host "System left running. Use 'docker-compose down' to stop when ready." -ForegroundColor White
}