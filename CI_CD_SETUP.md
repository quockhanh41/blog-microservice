# CI/CD Setup for Blog Microservices

This document describes the CI/CD workflows set up for the Blog Microservices project.

## GitHub Actions Workflows

We have set up three different GitHub Actions workflows to accommodate different deployment scenarios:

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

This is a comprehensive CI/CD pipeline designed for Kubernetes deployment:

- **Triggers**: Runs on pushes to main/master/develop branches, pull requests to these branches, and can be manually triggered
- **Steps**:
  - Tests each microservice individually
  - Builds and pushes Docker images for each service
  - Deploys to Kubernetes (development, staging, or production environments)

### 2. Simple CI/CD Pipeline (`ci-cd-simple.yml`)

A simpler pipeline for deploying to platforms like Render:

- **Triggers**: Same as the main pipeline
- **Steps**:
  - Builds and tests all services
  - Builds and pushes Docker images
  - Deploys to Render using their API

### 3. Docker Compose CI (`docker-compose-ci.yml`)

Used for testing the entire application stack together:

- **Triggers**: Runs on all pushes and pull requests
- **Steps**:
  - Starts all services using Docker Compose
  - Verifies health of all services
  - Runs integration tests
  - Collects logs if tests fail

## Required Secrets

For these workflows to work, you need to set up the following secrets in your GitHub repository:

### For Docker Hub Publishing
- `DOCKER_HUB_USERNAME` - Your Docker Hub username
- `DOCKER_HUB_TOKEN` - Your Docker Hub access token

### For Kubernetes Deployment
- `KUBE_CONFIG` - Your Kubernetes configuration file (base64 encoded)

### For Render Deployment
- `RENDER_API_KEY` - Your Render API key
- `RENDER_SERVICE_ID_PREFIX` - Prefix for your Render service IDs

## Setting Up Local Development

For local development, you can use:

```bash
# Start infrastructure services (databases, message brokers, etc.)
npm run infra:start

# Start all services in development mode
npm run dev

# Build all services
npm run build:all

# Run with PM2 process manager
npm run pm2:start
```

## CI/CD Pipeline Flow

1. Developer pushes code to a branch
2. GitHub Actions runs tests and builds Docker images
3. If on main/master branch, deployment occurs automatically
4. The deployment environment is determined by the branch:
   - `main/master` → production
   - `develop` → staging
   - Other branches → development (if manually triggered)

## Monitoring Deployments

- Kubernetes deployments can be monitored through your cluster's dashboard
- Render deployments can be monitored through the Render dashboard
- All workflow runs can be viewed in the Actions tab of your GitHub repository
