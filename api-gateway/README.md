# API Gateway

The API Gateway provides a single entry point for all client requests to the microservices.

## Overview

The API Gateway handles:
- Routing requests to the appropriate microservice
- Authentication and authorization
- CORS handling
- Rate limiting
- Request logging

## Configuration

The gateway configuration is defined in two main files:
- `config/gateway.config.yml`: API endpoints, policies, and pipelines
- `config/system.config.yml`: System configuration, plugins, and database connections

## API Endpoints

The following API endpoints are available through the gateway:

### User Service (http://localhost:8080/users/*)
- `GET /users`: List all users
- `GET /users/:id`: Get user by ID
- `POST /users`: Create a new user
- `PUT /users/:id`: Update a user
- `DELETE /users/:id`: Delete a user
- `POST /users/:id/follow`: Follow a user
- `DELETE /users/:id/follow`: Unfollow a user

### Auth Endpoints (http://localhost:8080/auth/*)
- `POST /auth/login`: User login
- `POST /auth/register`: User registration

### Post Service (http://localhost:8080/posts/*)
- `GET /posts`: List all posts
- `GET /posts/:id`: Get post by ID
- `POST /posts`: Create a new post
- `PUT /posts/:id`: Update a post
- `DELETE /posts/:id`: Delete a post
- `POST /posts/:id/like`: Like a post
- `DELETE /posts/:id/like`: Unlike a post

### Feed Service (http://localhost:8080/feed/*)
- `GET /feed`: Get user's personalized feed
- `GET /feed/trending`: Get trending posts
- `GET /feed/recent`: Get recent posts

## Development

To add new endpoints or policies to the gateway:

1. Modify the `config/gateway.config.yml` file
2. Add the new service endpoint URL
3. Create a new pipeline or update an existing one
4. Restart the gateway service

## Production Considerations

For production deployments:
- Use HTTPS with proper SSL certificates
- Configure appropriate rate limits
- Store JWT secrets securely
- Enable detailed logging for debugging
