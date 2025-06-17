# Consul Integration Guide

This guide explains how to use Consul for service discovery and scaling in the blog microservices application.

## Overview

Consul provides:
- Service Discovery
- Health Checking
- Key-Value Store
- Load Balancing
- Service Mesh (Connect)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │   Post Service  │    │   Feed Service  │
│    (Scaled)     │    │    (Scaled)     │    │    (Scaled)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       Consul           │
                    │   Service Discovery    │
                    │   Health Checking      │
                    │   Load Balancing       │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     API Gateway        │
                    │   Dynamic Routing      │
                    │   Load Balancing       │
                    │   Service Discovery    │
                    └────────────────────────┘
```

## Quick Start

### 1. Start the system with Consul
```bash
docker-compose up -d
```

### 2. Check Consul status
```powershell
# PowerShell
.\consul-status.ps1

# Or visit Consul UI
# http://localhost:8500
```

### 3. Scale services
```powershell
# Scale post-service to 3 instances
.\scale-service.ps1 -ServiceName post-service -ScaleCount 3

# Scale feed-service to 2 instances
.\scale-service.ps1 -ServiceName feed-service -ScaleCount 2

# Scale user-service to 2 instances
.\scale-service.ps1 -ServiceName user-service -ScaleCount 2
```

### 4. Test service discovery
```bash
# Check registered services
docker-compose exec consul consul catalog services

# Check service health
docker-compose exec consul consul health service post-service

# Test API Gateway integration
.\test-api-gateway.ps1
```

## Service Registration

Each service automatically registers itself with Consul when it starts:

```typescript
// Example from post-service
const consulRegistry = new ConsulServiceRegistry(
  consulHost,
  consulPort,
  'post-service',
  serviceAddress,
  servicePort
);

await consulRegistry.register();
```

### Registration Details
- **Service ID**: `{service-name}-{address}-{port}`
- **Health Check**: HTTP endpoint `/health` checked every 10s
- **Tags**: `['microservice', 'blog', service-name]`
- **Meta**: `{ version: '1.0.0', environment: NODE_ENV }`

## Service Discovery

Services use Consul to discover other services instead of hardcoded URLs:

```typescript
// Before (hardcoded URL)
const userServiceUrl = 'http://user-service:3001';

// After (service discovery)
const userServiceClient = new UserServiceClient();
const serviceUrl = await userServiceClient.getServiceUrl('user-service');
```

### Load Balancing
- Simple random selection among healthy instances
- Automatic failover to healthy instances
- Circuit breaker pattern for resilience

## Health Checks

All services expose a health endpoint:

```json
GET /health

{
  "status": "healthy",
  "service": "post-service",
  "timestamp": "2025-06-17T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Health Check Configuration
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Deregister After**: 30 seconds of critical status

## Scaling Services

### Using PowerShell Script
```powershell
# Scale post-service to 3 instances
.\scale-service.ps1 -ServiceName post-service -ScaleCount 3

# Scale back to 1 instance
.\scale-service.ps1 -ServiceName post-service -ScaleCount 1
```

### Using Docker Compose
```bash
# Scale using docker-compose
docker-compose up -d --scale post-service=3

# Check running instances
docker-compose ps
```

### Manual Scaling
1. Create multiple service instances with different ports
2. Each instance registers with Consul automatically
3. Other services discover all instances via Consul
4. Load balancing happens automatically

## Consul Web UI

Access the Consul Web UI at: http://localhost:8500

Features:
- View all registered services
- Check service health status
- Monitor service instances
- View key-value store
- Configure access control

## Environment Variables

### Consul Configuration
- `CONSUL_HOST`: Consul server hostname (default: localhost)
- `CONSUL_PORT`: Consul HTTP port (default: 8500)

### Service Configuration
- `SERVICE_ADDRESS`: Service address for registration (default: service-name)
- `PORT`: Service port (default: varies by service)

## Troubleshooting

### Service Not Registering
1. Check Consul is running: `docker-compose ps consul`
2. Check service logs: `docker-compose logs {service-name}`
3. Verify environment variables: `CONSUL_HOST`, `CONSUL_PORT`

### Service Discovery Failed
1. Check if service is registered: `docker-compose exec consul consul catalog services`
2. Check service health: `docker-compose exec consul consul health service {service-name}`
3. Verify network connectivity between services

### Health Check Failures
1. Ensure `/health` endpoint is accessible
2. Check service is responding on correct port
3. Verify Docker network configuration

## Commands Reference

### Consul CLI Commands
```bash
# List all services
docker-compose exec consul consul catalog services

# Get service details
docker-compose exec consul consul catalog service {service-name}

# Check service health
docker-compose exec consul consul health service {service-name}

# List cluster members
docker-compose exec consul consul members

# View Consul configuration
docker-compose exec consul consul info
```

### Docker Compose Commands
```bash
# Start all services
docker-compose up -d

# Scale a specific service
docker-compose up -d --scale {service-name}={count}

# Check service status
docker-compose ps

# View service logs
docker-compose logs {service-name}

# Stop and remove services
docker-compose down
```

### PowerShell Scripts
```powershell
# Check Consul status and services
.\consul-status.ps1

# Scale a service
.\scale-service.ps1 -ServiceName {service-name} -ScaleCount {count}
```

## Best Practices

### Service Registration
- Use meaningful service names
- Include version information in metadata
- Implement proper health checks
- Handle registration failures gracefully

### Service Discovery
- Implement retry logic for failed discoveries
- Cache service URLs with TTL
- Use circuit breaker pattern
- Fall back to configured URLs if discovery fails

### Health Checks
- Keep health checks lightweight
- Check dependencies (database, external services)
- Return appropriate HTTP status codes
- Include relevant health information

### Scaling
- Monitor resource usage before scaling
- Consider database connection limits
- Use proper load testing
- Implement graceful shutdown

## Security Considerations

### Network Security
- Use Docker networks for service isolation
- Implement proper firewall rules
- Consider service mesh for mutual TLS

### Access Control
- Enable Consul ACLs in production
- Use tokens for service registration
- Implement proper authentication

### Data Security
- Encrypt sensitive configuration in KV store
- Use secrets management for credentials
- Rotate service certificates regularly

## API Gateway Integration

The API Gateway acts as a central entry point and uses Consul for dynamic service discovery:

### Dynamic Routing
- Automatically discovers backend services via Consul
- Load balances requests across healthy service instances
- Provides fallback to configured URLs if Consul is unavailable

### Service Discovery in Gateway
```javascript
// API Gateway discovers services dynamically
const serviceUrl = await consulRegistry.getServiceUrl('user-service');
// Routes request to healthy instance automatically
```

### Admin Endpoints
- **GET /admin/services**: View all discovered services and instances
- **GET /admin/health**: Check API Gateway and backend service health  
- **POST /admin/cache/clear**: Clear service discovery cache
- **POST /admin/cache/clear/:service**: Clear cache for specific service

### Request Flow
1. Client sends request to API Gateway (http://localhost:8080)
2. Gateway discovers healthy service instances via Consul
3. Gateway load balances and proxies request to selected instance
4. Response is returned to client

Example:
```
Client → GET /users/123 → API Gateway → Consul Discovery → User Service Instance → Response
```
