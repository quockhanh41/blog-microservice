#!/bin/bash

# Script to manage User Service Docker containers

case "$1" in
  start)
    echo "Starting User Service with Docker Compose..."
    docker-compose up -d
    echo "Services started! Check status with: docker-compose ps"
    ;;
  stop)
    echo "Stopping User Service containers..."
    docker-compose down
    ;;
  restart)
    echo "Restarting User Service..."
    docker-compose down
    docker-compose up -d
    ;;
  logs)
    echo "Showing logs for User Service..."
    docker-compose logs -f user-service
    ;;
  build)
    echo "Building User Service image..."
    docker-compose build user-service
    ;;
  clean)
    echo "Cleaning up containers and volumes..."
    docker-compose down -v
    docker system prune -f
    ;;
  status)
    echo "Checking service status..."
    docker-compose ps
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs|build|clean|status}"
    echo ""
    echo "Commands:"
    echo "  start   - Start all services"
    echo "  stop    - Stop all services"
    echo "  restart - Restart all services"
    echo "  logs    - Show user service logs"
    echo "  build   - Build user service image"
    echo "  clean   - Clean up containers and volumes"
    echo "  status  - Show service status"
    exit 1
esac
