#!/usr/bin/env pwsh

# Fix line endings issue
Write-Host "Configuring Git line ending handling..." -ForegroundColor Cyan
git config --global core.autocrlf input

Write-Host "Removing files from Git cache..." -ForegroundColor Cyan
git rm --cached -r .

Write-Host "Resetting repository..." -ForegroundColor Cyan
git reset --hard

# Set executable permissions for entrypoint.sh files (needed when working with Linux-based Docker images)
Write-Host "Setting executable permissions on entrypoint.sh files..." -ForegroundColor Cyan

# Find all entrypoint.sh files and ensure they have LF line endings
$entrypointFiles = Get-ChildItem -Path . -Filter "entrypoint.sh" -Recurse
foreach ($file in $entrypointFiles) {
    Write-Host "Converting line endings for: $($file.FullName)" -ForegroundColor Yellow
    $content = Get-Content -Path $file.FullName -Raw
    $content = $content -replace "`r`n", "`n"
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Fixed line endings for: $($file.FullName)" -ForegroundColor Green
}

Write-Host "Line ending fix complete. You can now rebuild your Docker containers." -ForegroundColor Green
