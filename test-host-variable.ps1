# Test script to verify the fix for the $host variable conflict

try {
    # Create a test array of objects
    $testResponses = @(
        [PSCustomObject]@{hostname = "server1"},
        [PSCustomObject]@{hostname = "server2"},
        [PSCustomObject]@{hostname = "server1"},
        [PSCustomObject]@{hostname = "server3"}
    )

    # Group by hostname - similar to what our script does
    $hostnames = $testResponses | Select-Object -ExpandProperty hostname | Group-Object

    # Count successful requests
    $successfulRequests = $testResponses.Count

    # Display results - using hostnameGroup instead of host
    Write-Host "Testing load balancing display with non-conflicting variable name:"
    if ($hostnames.Count -gt 1) {
        Write-Host "`nLoad balancing is working - requests distributed across instances:" -ForegroundColor Green
        foreach ($hostnameGroup in $hostnames) {
            Write-Host "  - $($hostnameGroup.Name): $($hostnameGroup.Count) requests" -ForegroundColor White
            $percentage = [math]::Round(($hostnameGroup.Count / $successfulRequests) * 100)
            Write-Host "      ($percentage`% of traffic)" -ForegroundColor Gray
        }
        
        Write-Host "`nTest completed successfully!" -ForegroundColor Green
    }
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
}
