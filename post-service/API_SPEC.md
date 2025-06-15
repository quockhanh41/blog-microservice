# Post Service API Documentation

## Overview
The Post Service handles CRUD operations for blog posts and maintains a cache of user information for performance optimization.

## Base URL
`http://localhost:3002`

## Authentication
Most endpoints require a JWT token passed through the API Gateway. The Gateway extracts the user ID and passes it in the `x-user-id` header.

## Endpoints

### Health Check
```
GET /health
```
Returns the health status of the service.

**Response:**
```
Post service is running
```

---

### Create Post
```
POST /posts
```
Creates a new blog post.

**Headers:**
- `x-user-id`: UUID of the authenticated user (set by API Gateway)

**Request Body:**
```json
{
  "title": "My Blog Post",
  "content": "This is the content of my blog post..."
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "author_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "title": "My Blog Post",
  "content": "This is the content of my blog post...",
  "created_at": "2025-06-14T10:30:00.000Z"
}
```

---

### Get Posts
```
GET /posts?user_ids=id1,id2&limit=10&sort=desc
```
Retrieves posts, optionally filtered by user IDs.

**Query Parameters:**
- `user_ids` (optional): Comma-separated list of user IDs to filter by
- `limit` (optional): Maximum number of posts to return (default: 50, max: 100)
- `sort` (optional): Sort order - 'asc' or 'desc' (default: 'desc')

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "author_id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "title": "My Blog Post",
    "content": "This is the content of my blog post...",
    "created_at": "2025-06-14T10:30:00.000Z"
  }
]
```

---

### Get All Posts
```
GET /posts/all
```
Retrieves all posts (for testing purposes).

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "author_id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "title": "My Blog Post",
    "content": "This is the content of my blog post...",
    "created_at": "2025-06-14T10:30:00.000Z"
  }
]
```

---

### Get Post by ID
```
GET /posts/:id
```
Retrieves a specific post by its ID.

**Parameters:**
- `id`: UUID of the post

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "author_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "title": "My Blog Post",
  "content": "This is the content of my blog post...",
  "created_at": "2025-06-14T10:30:00.000Z"
}
```

---

### Get User Reference (Testing)
```
GET /user-reference/:userId
```
Retrieves cached user information for a specific user ID.

**Parameters:**
- `userId`: UUID of the user

**Response:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "updated_at": "2025-06-14T10:30:00.000Z"
}
```

## Event Handling

### Kafka Events Consumed

#### user.updated
The service listens for user update events to keep the username cache fresh.

**Event Structure:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "new_username",
  "timestamp": "2025-06-14T10:30:00.000Z"
}
```

When this event is received:
1. Updates the `user_reference` table with the new username
2. Updates all posts by this user with the new cached username

## Error Responses

### 400 Bad Request
```json
{
  "error": "Title and content are required"
}
```

### 401 Unauthorized
```json
{
  "error": "User ID not found in request"
}
```

### 404 Not Found
```json
{
  "error": "Post not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create post"
}
```

## Database Schema

### Posts Table
- `id`: UUID (Primary Key)
- `author_id`: UUID (Foreign Key to User Service)
- `username`: VARCHAR(50) (Cached from User Service)
- `title`: VARCHAR(255)
- `content`: TEXT
- `created_at`: TIMESTAMP

### User Reference Table (Cache)
- `user_id`: UUID (Primary Key)
- `username`: VARCHAR(50)
- `updated_at`: TIMESTAMP

## Service Dependencies

- **User Service**: Called to fetch user information when not in cache
- **Kafka**: Listens for user update events
- **PostgreSQL**: Primary data storage
- **API Gateway**: Provides authentication and routing
