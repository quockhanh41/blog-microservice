# Deploying Blog Microservices on Render

This document provides instructions for deploying the Blog Microservices project on Render.com using the provided `render.yaml` file.

## Prerequisites

Before deploying, you should have:

1. A Render.com account
2. Cloud URLs for:
   - PostgreSQL databases (for user-service and post-service)
   - Redis service (for feed-service)
   - Kafka service (e.g., Confluent Cloud)

## Deployment Process

### 1. Fork or Push Your Repository

Make sure your project is in a Git repository that Render can access (GitHub, GitLab, or Bitbucket).

### 2. Create a Blueprint Instance on Render

1. Go to the Render dashboard
2. Click "New" > "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file and set up the services

### 3. Configure Environment Variables

Before deploying, you'll need to provide the following environment variables:

#### User Service
- `DATABASE_URL`: Your PostgreSQL connection string for the user service
- `KAFKA_BROKERS`: Your Kafka broker address(es)
- `CONFLUENT_API_KEY` and `CONFLUENT_API_SECRET`: If using Confluent Cloud

#### Post Service
- `DATABASE_URL`: Your PostgreSQL connection string for the post service
- `KAFKA_BROKERS`: Your Kafka broker address(es)
- `CONFLUENT_API_KEY` and `CONFLUENT_API_SECRET`: If using Confluent Cloud

#### Feed Service
- `REDIS_URL`: Your Redis connection string

### 4. Deploy the Services

Once you've configured the environment variables, Render will deploy all services defined in the `render.yaml` file.

## Service Architecture

The deployment consists of the following services:

1. **User Service**: Handles user authentication, registration, and user data
2. **Post Service**: Manages blog post creation and retrieval
3. **Feed Service**: Generates personalized feeds with Redis caching
4. **API Gateway**: Routes requests to appropriate services
5. **Frontend**: Next.js application for the user interface
6. **PostgreSQL Databases**: Separate databases for user and post services

## Networking

Render automatically provides HTTPS for all services. The services communicate with each other using their public URLs:

- User Service: https://user-service.onrender.com
- Post Service: https://post-service.onrender.com
- Feed Service: https://feed-service.onrender.com
- API Gateway: https://api-gateway.onrender.com
- Frontend: https://frontend.onrender.com

## Scaling

The `render.yaml` file configures each service with a single instance by default. To scale:

1. Go to the Render dashboard
2. Select a service
3. Navigate to "Settings" > "Scaling"
4. Adjust the number of instances

## Monitoring & Logs

Render provides built-in monitoring and logging:

1. Go to the Render dashboard
2. Select a service
3. Navigate to "Logs" to view service logs
4. Navigate to "Metrics" to view performance metrics

## Troubleshooting

If you encounter issues:

1. Check service logs in the Render dashboard
2. Verify environment variables are correctly set
3. Ensure database connections are properly configured
4. Check that services can communicate with each other

## Additional Information

- This deployment uses the `standard` plan for all services. Adjust according to your needs.
- Health checks are configured to ensure service availability.
- The JWT secret is automatically generated and shared between the user service and API gateway.
