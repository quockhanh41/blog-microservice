# Blog Microservices

A modern blog system built with microservices architecture, featuring service discovery, caching, event-driven communication, and containerized deployment.

## Overview

This project implements a blog platform using microservices architecture with:

- **User Service**: Handles user authentication, registration, and follow relationships (TypeScript + Express + PostgreSQL)
- **Post Service**: Manages creating and retrieving blog posts (TypeScript + Express + PostgreSQL + Kafka)
- **Feed Service**: Generates personalized content feeds with Redis caching (TypeScript + Express + Redis)
- **API Gateway**: Provides a unified entry point with service discovery (Express + Consul)
- **Frontend**: Next.js web application with modern UI

## Architecture Features

The system implements the following microservices patterns and techniques:

### ✅ Implemented
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

## Technologies Stack

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

## Getting Started

### Prerequisites

- **Docker Desktop**: Latest version with Docker Compose
- **Node.js**: Version 18+ (for local development)
- **Git**: For cloning the repository

### Quick Start with Docker

#### Option 1: Full Docker Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd blog-microservices

# Start all services (infrastructure + microservices)
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]
```

This will start:
- **API Gateway** on `http://localhost:8080`
- **Frontend** on `http://localhost:3000`
- **PostgreSQL** databases on ports `5432` and `5433`
- **Redis** on port `6379`
- **Kafka** on port `9092`
- **Consul** UI on `http://localhost:8500`

#### Option 2: Infrastructure Only + PM2 Services

For development with hot reloading:

```bash
# Start infrastructure services only
docker-compose -f docker-compose.infrastructure.yml up -d

# Install dependencies for all services
npm install

# Start microservices with PM2 (Windows)
.\script\start-with-pm2-dev.ps1

# Or for production mode
.\script\start-with-pm2.ps1
```

### Service Endpoints

Once running, the services will be available at:

| Service | Docker Port | PM2 Port | Description |
|---------|-------------|----------|-------------|
| API Gateway | 8080 | 8080 | Main API endpoint |
| Frontend | 3000 | 3000 | Web application |
| User Service | 3001-3010 | 3001 | User management |
| Post Service | 3002-3011 | 3002 | Blog posts |
| Feed Service | 3003-3012 | 3003 | Content feeds |
| Consul | 8500 | 8500 | Service discovery UI |

### API Usage Examples

#### Authentication

```bash
# Register a new user
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

#### Creating Posts

```bash
# Create a post (requires JWT token)
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"title":"My Blog Post","content":"This is my first post!","tags":["tech","blog"]}'
```

#### Getting Feeds

```bash
# Get personalized feed (requires JWT token)
curl -X GET http://localhost:8080/api/feed \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Development

### Local Development Setup

```bash
# Install dependencies for all services
npm install

# Start infrastructure services
docker-compose -f docker-compose.infrastructure.yml up -d

# Start individual services in development mode
cd user-service && npm run dev
cd post-service && npm run dev  
cd feed-service && npm run dev
cd api-gateway && npm start
cd Frontend && npm run dev
```

### Database Management

```bash
# Run database migrations
cd user-service && npx prisma migrate dev
cd post-service && npx prisma migrate dev

# Generate Prisma client
cd user-service && npx prisma generate
cd post-service && npx prisma generate

# View database in Prisma Studio
cd user-service && npx prisma studio
cd post-service && npx prisma studio
```

### Useful Commands

```bash
# Stop all Docker services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Stop PM2 services
.\script\stop-pm2.ps1

# Check Consul service registry
.\script\consul-status.ps1

# Reset and restart everything
.\script\reset-and-start.ps1

# View service logs
docker-compose logs -f api-gateway
docker-compose logs -f user-service
pm2 logs api-gateway
```

## Monitoring & Health Checks

### Service Health Endpoints

- API Gateway: `http://localhost:8081/health`
- User Service: `http://localhost:3001/health`  
- Post Service: `http://localhost:3002/health`
- Feed Service: `http://localhost:3003/health`

### Consul Dashboard

Visit `http://localhost:8500` to view:
- Service registration status
- Health check results
- Service discovery configuration
- Key-value store

### PM2 Monitoring

```bash
# View process status
pm2 status

# Monitor processes
pm2 monit

# View detailed logs
pm2 logs [process-name]
```

## Project Structure

```
blog-microservices/
├── api-gateway/          # API Gateway service
├── user-service/         # User management microservice
├── post-service/         # Blog post microservice  
├── feed-service/         # Content feed microservice
├── Frontend/             # Next.js web application
├── script/               # PowerShell deployment scripts
├── init-scripts/         # Database initialization
├── logs/                 # Application logs
├── docker-compose.yml    # Full Docker deployment
├── docker-compose.infrastructure.yml  # Infrastructure only
├── ecosystem.config.js   # PM2 configuration
└── README.md
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000-3003, 5432-5433, 6379, 8080, 8500, 9092 are available
2. **Docker Issues**: Restart Docker Desktop if containers fail to start
3. **Database Connection**: Wait for PostgreSQL health checks to pass before starting services
4. **Service Discovery**: Check Consul logs if services can't find each other

### Debug Commands

```bash
# Check Docker service health
docker-compose ps

# View specific service logs
docker-compose logs user-service

# Test API Gateway connectivity
curl http://localhost:8080/health

# Check Consul service registration
curl http://localhost:8500/v1/agent/services
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
