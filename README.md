# Blog Microservices

A modern blog system built with microservices architecture.

## Overview

This project implements a blog platform using microservices architecture with:

- **User Service**: Handles user authentication, registration, and follow relationships
- **Post Service**: Manages creating and retrieving blog posts
- **Feed Service**: Generates personalized content feeds
- **API Gateway**: Provides a unified entry point for clients

## Architecture

The system follows these architectural principles:
- Service independence
- Event-driven communication
- Eventual consistency
- API Gateway pattern

## Technologies

- TypeScript & Express.js
- PostgreSQL (User and Post services)
- Redis (Feed service caching)
- Kafka (Event messaging)
- Express Gateway
- Docker & Docker Compose
- OpenTelemetry & Jaeger (Tracing)
- JWT Authentication

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 16+

### Running the Project

1. Clone the repository
2. Start all services:
   ```
   npm run dev
   ```

3. The API Gateway will be available at http://localhost:8080

### 🔄 Running with Fresh Data (No Persistence)

This project is configured to **NOT persist data** between container restarts. Every time you start the containers, all data (databases, Redis cache, Kafka messages) will be reset.

**Option 1: Using PowerShell script**
```powershell
.\reset-and-start.ps1
```

**Option 2: Using Batch script**
```batch
reset-and-start.bat
```

**Option 3: Manual commands**
```bash
# Stop and remove all containers with volumes
docker-compose down --volumes --remove-orphans

# Clean up Docker system
docker system prune -f

# Remove any remaining volumes
docker volume prune -f

# Start fresh containers
docker-compose up --build --force-recreate
```

**Note**: 
- PostgreSQL databases will be empty on each startup
- Redis cache will be cleared
- Kafka topics and messages will be reset
- All user accounts, posts, and follows will need to be recreated

## Service Endpoints

### User Service
- POST `/register` - Register a new user
- POST `/login` - Authenticate a user and get JWT
- GET `/users/{id}` - Get user details
- GET `/users/{id}/following` - Get followed users
- POST `/users/{id}/follow` - Follow a user

### Post Service
- POST `/posts` - Create a new post
- GET `/posts?user_ids=[]` - Get posts by user IDs

### Feed Service
- GET `/feed` - Get personalized feed (requires JWT)

## Development

Each service can be developed independently:

```bash
cd user-service
npm run dev
```

## Documentation

For detailed architecture information, see the [architecture document](../docs/blog_microservices_architecture.md).
