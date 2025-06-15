#!/bin/bash

# Test script for API Gateway

echo "Testing API Gateway..."

# Test the health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:8081/health

# Test gateway info endpoint
echo "Testing gateway info endpoint..."
curl -s http://localhost:8080/gateway-info

# Test users endpoint with GET
echo "Testing users endpoint..."
curl -s -H "Authorization: Bearer test-token" http://localhost:8080/users

# Test posts endpoint with GET
echo "Testing posts endpoint..."
curl -s -H "Authorization: Bearer test-token" http://localhost:8080/posts

# Test feed endpoint with GET
echo "Testing feed endpoint..."
curl -s -H "Authorization: Bearer test-token" http://localhost:8080/feed

echo "Tests completed!"
