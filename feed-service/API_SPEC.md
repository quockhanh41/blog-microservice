# Feed Service API Specification

## Overview

The Feed Service is responsible for generating and providing personalized feeds for users based on their follow relationships. It interacts with the User Service to get a list of users that the current user follows, and then with the Post Service to fetch posts from those users.

## Base URL

```
http://localhost:3003
```

## Authentication

All endpoints except for health check require authentication. The authentication is handled by the API Gateway, which extracts the user ID from the JWT token and passes it in the `x-user-id` header.

## Endpoints

### Get Personalized Feed

Returns a personalized feed for the authenticated user, containing posts from users they follow as well as their own posts, sorted by creation date (newest first).

**URL**: `/feed`

**Method**: `GET`

**Auth required**: Yes (via `x-user-id` header)

**Query Parameters**:

| Parameter | Type    | Description                                      | Default |
|-----------|---------|--------------------------------------------------|---------|
| limit     | integer | Maximum number of posts to return                | 50      |

**Success Response**:

- **Code**: 200 OK
- **Content example**:

```json
[
  {
    "id": "post-uuid",
    "author_id": "user-uuid",
    "username": "john_doe",
    "title": "Sample Post Title",
    "content": "This is the content of the post.",
    "created_at": "2025-06-14T10:30:00.000Z"
  },
  // More posts...
]
```

**Error Responses**:

- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "User ID not found in request" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch feed" }`

### Invalidate Feed Cache

Invalidates the cached feed for the authenticated user. This is useful for testing or when you want to force a refresh of the feed.

**URL**: `/feed/invalidate`

**Method**: `POST`

**Auth required**: Yes (via `x-user-id` header)

**Success Response**:

- **Code**: 200 OK
- **Content**: `{ "message": "Feed cache invalidated successfully" }`

**Error Responses**:

- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "User ID not found in request" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to invalidate feed" }`

### Health Check

Used to verify that the service is running.

**URL**: `/health`

**Method**: `GET`

**Auth required**: No

**Success Response**:

- **Code**: 200 OK
- **Content**: `"Feed service is running"`

## Service Dependencies

The Feed Service depends on the following services:

1. **User Service** - To get the list of users that the current user follows
   - Endpoint: `GET /users/{id}/following`

2. **Post Service** - To get posts from a list of user IDs
   - Endpoint: `GET /posts?user_ids=[]`

## Caching

The Feed Service uses Redis to cache user feeds. Each feed is cached with the key `feed:{user_id}` and has a TTL of 5 minutes. This improves performance for repeated requests and reduces load on the User and Post services.

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in JSON format. The service handles errors from dependent services gracefully and returns meaningful error messages to the client.
