# 🚀 Blog Microservices

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://www.docker.com/)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-orange)](https://microservices.io/)

A modern blog system built with microservices architecture, featuring service discovery, caching, event-driven communication, and containerized deployment.

<div align="center">
  <img src="docs\Component diagram.png" alt="Architecture Diagram" width="80%">
</div>

## 📋 Overview

This project implements a blog platform using microservices architecture with:

| Service | Description | Tech Stack |
|---------|-------------|------------|
| 👤 **User Service** | Handles user authentication, registration, and follow relationships | TypeScript, Express, PostgreSQL |
| 📝 **Post Service** | Manages creating and retrieving blog posts | TypeScript, Express, PostgreSQL, Kafka |
| 📊 **Feed Service** | Generates personalized content feeds with caching | TypeScript, Express, Redis |
| 🔄 **API Gateway** | Provides a unified entry point with service discovery | Express, Consul |
| 🖥️ **Frontend** | Web application with modern UI | Next.js, Tailwind CSS |

## 🏗️ Architecture Features

The system implements the following microservices patterns and techniques:

### ✅ Implemented Features
- **API Gateway Pattern**: Single entry point for all client requests
- **Service Discovery**: Dynamic service registration and discovery using Consul
- **JWT Authentication**: Token-based authentication across services
- **Redis Caching**: Performance optimization for feed generation
- **Event-Driven Communication**: Kafka for asynchronous messaging
- **Containerization**: Docker containers for all services
- **Health Checks**: Service health monitoring and graceful degradation

### 🔧 Partially Implemented
- **Rate Limiting**: Dependencies available but not fully configured
- **Centralized Logging**: Individual service logging with Morgan

## 💻 Technologies Stack

### Backend Services
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Databases**: PostgreSQL (User & Post services), Redis (Feed service cache)
- **Message Queue**: Apache Kafka
- **Service Discovery**: HashiCorp Consul
- **Authentication**: JWT tokens
- **API Gateway**: Express with custom routing logic

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 (alternative deployment)
- **Development**: Hot reloading, volume mounts

## 🚦 Getting Started

### Prerequisites

- **Docker Desktop**: Latest version with Docker Compose
- **Node.js**: Version 18+ (for local development)
- **Git**: For cloning the repository

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/quockhanh41/blog-microservice.git
cd blog-microservices

# Start all services in development mode (default)
docker-compose up -d

# Start all services in production mode
ENV=production docker-compose up -d

# Rebuild containers if needed
docker-compose up -d --build
```

### 🔄 Switching Between Development and Production

You can switch between development and production environments using the `ENV` environment variable:

```bash
# For development (default mode with hot-reloading)
docker-compose up -d

# For production (optimized, smaller images)
ENV=production docker-compose up -d

# To stop all services
docker-compose down
```

**Note:** The production mode uses optimized Docker images with:
- Smaller image size (only production dependencies)
- Pre-compiled TypeScript code
- Improved security and performance
- No development tools or hot-reloading

### 🔌 Service Endpoints

Once running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | [http://localhost:3000](http://localhost:3000) | Web application |
| API Gateway | [http://localhost:8080](http://localhost:8080) | API entry point |
| Consul UI | [http://localhost:8500](http://localhost:8500) | Service discovery dashboard |
| PostgreSQL | Ports 5432, 5433 | Database services |
| Redis | Port 6379 | Caching service |
| Kafka | Port 9092 | Message broker |

### 🔑 Demo Account
- **Email**: `user1@example.com`
- **Password**: `password1`

## 📖 Documentation

For detailed API specifications, see the individual service README files:
- [User Service](./user-service/API_SPEC.md)
- [Post Service](./post-service/API_SPEC.md)
- [Feed Service](./feed-service/API_SPEC.md)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

