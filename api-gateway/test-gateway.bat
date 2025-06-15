@echo off
REM Test script for API Gateway

echo Testing API Gateway...

REM Test the health endpoint
echo Testing health endpoint...
curl -s http://localhost:8081/health

REM Test gateway info endpoint
echo Testing gateway info endpoint...
curl -s http://localhost:8080/gateway-info

REM Test users endpoint with GET
echo Testing users endpoint...
curl -s -H "Authorization: Bearer test-token" http://localhost:8080/users

REM Test posts endpoint with GET
echo Testing posts endpoint...
curl -s -H "Authorization: Bearer test-token" http://localhost:8080/posts

REM Test feed endpoint with GET
echo Testing feed endpoint...
curl -s -H "Authorization: Bearer test-token" http://localhost:8080/feed

echo Tests completed!
