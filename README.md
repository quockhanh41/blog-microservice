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
