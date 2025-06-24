# CI/CD Setup for Blog Microservices

This document provides an overview of the Continuous Integration and Continuous Deployment workflows created for the Blog Microservices project.

## Workflows Overview

### CI Workflow (`ci-final.yml`)

The CI workflow runs on every push to `main`, `master`, and `develop` branches, as well as on pull requests to these branches. It performs the following operations:

1. **Linting and Type Checking**
   - Lints all services (particularly Frontend)
   - Performs TypeScript type checking for TypeScript services

2. **Building**
   - Installs dependencies for each service
   - Generates Prisma clients for services that use Prisma
   - Builds each service
   - Uploads build artifacts for subsequent jobs

3. **Testing**
   - Sets up required services (PostgreSQL, Redis)
   - Runs tests for the user-service
   - Tests can be expanded to include other services

4. **Docker Image Building**
   - Builds Docker images for all services
   - Pushes images to Docker Hub (only on push events, not PRs)
   - Tags images with both the commit SHA and `latest`

5. **Integration Testing**
   - Starts all services using Docker Compose
   - Verifies health of services
   - Runs integration tests (to be implemented)
   - Collects logs if tests fail

### CD Workflow (`cd.yml`)

The CD workflow runs automatically after a successful CI workflow on the `main` or `master` branch, or can be triggered manually. It handles deployment to Render:

1. **Deployment to Render**
   - Triggers deploy hooks for each service on Render
   - Waits for deployments to complete
   - Verifies deployments (can be customized)

## Required Secrets

For these workflows to work, you need to set up the following secrets in your GitHub repository:

### For CI Workflow
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token

### For CD Workflow (Render Deployment)
- `RENDER_DEPLOY_HOOK_API_GATEWAY`: Render deploy hook URL for the API Gateway
- `RENDER_DEPLOY_HOOK_USER_SERVICE`: Render deploy hook URL for the User Service
- `RENDER_DEPLOY_HOOK_POST_SERVICE`: Render deploy hook URL for the Post Service
- `RENDER_DEPLOY_HOOK_FEED_SERVICE`: Render deploy hook URL for the Feed Service
- `RENDER_DEPLOY_HOOK_FRONTEND`: Render deploy hook URL for the Frontend

## How to Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add each of the required secrets listed above

## How to Use These Workflows

### CI Workflow
The CI workflow runs automatically on push and pull request events. No manual action is required.

### CD Workflow
The CD workflow runs automatically after a successful CI workflow on the main/master branch. It can also be triggered manually:

1. Go to your GitHub repository
2. Click on "Actions" > "Blog Microservices CD"
3. Click "Run workflow"
4. Select the branch to deploy from
5. Click "Run workflow"

## Customizing the Workflows

### Adding Tests for Other Services

To add tests for post-service, feed-service, or other services:

1. Add similar steps to the `test` job in `ci-final.yml`
2. Configure the necessary database/environment for each service

### Integration Tests

The integration test job is set up but doesn't have actual test commands. To add integration tests:

1. Modify the "Run integration tests" step in the `integration` job
2. Add your test commands (e.g., curl endpoints, run test scripts)

### Deploying to Other Platforms

To deploy to platforms other than Render:

1. Create a new workflow file or modify the existing `cd.yml`
2. Add the appropriate deployment steps for your platform

## Local Development

For local development, you can use:

```bash
# Start all services with Docker Compose
npm run start

# Start in development mode
npm run dev

# Build all services
npm run build:all
```

## Troubleshooting

If you encounter issues with the CI/CD workflows:

1. Check the workflow run logs in GitHub Actions
2. Verify that all required secrets are set correctly
3. Ensure your service configurations (e.g., Dockerfile, health check endpoints) are correct
4. Check the README.md files in each service directory for service-specific information
