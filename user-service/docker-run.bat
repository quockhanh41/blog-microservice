@echo off
REM Script to manage User Service Docker containers

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="build" goto build
if "%1"=="clean" goto clean
if "%1"=="status" goto status
goto usage

:start
echo Starting User Service with Docker Compose...
docker-compose up -d
echo Services started! Check status with: docker-compose ps
goto end

:stop
echo Stopping User Service containers...
docker-compose down
goto end

:restart
echo Restarting User Service...
docker-compose down
docker-compose up -d
goto end

:logs
echo Showing logs for User Service...
docker-compose logs -f user-service
goto end

:build
echo Building User Service image...
docker-compose build user-service
goto end

:clean
echo Cleaning up containers and volumes...
docker-compose down -v
docker system prune -f
goto end

:status
echo Checking service status...
docker-compose ps
goto end

:usage
echo Usage: %0 {start^|stop^|restart^|logs^|build^|clean^|status}
echo.
echo Commands:
echo   start   - Start all services
echo   stop    - Stop all services
echo   restart - Restart all services
echo   logs    - Show user service logs
echo   build   - Build user service image
echo   clean   - Clean up containers and volumes
echo   status  - Show service status

:end
