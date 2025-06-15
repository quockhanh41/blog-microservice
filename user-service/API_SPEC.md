# User Service API Specification

Base URL: `http://localhost:3001`

## Authentication
- Some endpoints require JWT token in Authorization header: `Bearer <token>`

---

## 1. Register User
**POST** `/register`

### Request Body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Response (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response (400 Bad Request):
```json
{
  "error": "All fields are required"
}
```

---

## 2. Login User
**POST** `/login`

### Request Body:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Response (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

---

## 3. Get User by ID
**GET** `/users/{id}`

### Path Parameters:
- `id`: User UUID

### Response (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe"
}
```

### Error Response (404 Not Found):
```json
{
  "error": "User not found"
}
```

---

## 4. Get Following Users
**GET** `/users/{id}/following`

### Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters:
- `id`: User UUID

### Response (200 OK):
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "username": "alice_smith"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "username": "bob_jones"
  }
]
```

### Error Response (401 Unauthorized):
```json
{
  "error": "Authorization header missing"
}
```

---

## 5. Follow User
**POST** `/users/{id}/follow`

### Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters:
- `id`: Follower's User UUID (must match JWT token user ID)

### Request Body:
```json
{
  "targetUserId": "660e8400-e29b-41d4-a716-446655440001"
}
```

### Response (200 OK):
```json
{
  "message": "Successfully followed user"
}
```

### Error Responses:

**400 Bad Request** (Following yourself):
```json
{
  "error": "You cannot follow yourself"
}
```

**403 Forbidden** (Wrong user):
```json
{
  "error": "Forbidden: You can only manage your own follow relationships"
}
```

**404 Not Found** (User not found):
```json
{
  "error": "User not found"
}
```

---

## 6. Health Check
**GET** `/health`

### Response (200 OK):
```
User service is running
```

---

# Postman Test Collection Setup

## Step 1: Create Environment
1. In Postman, create a new Environment named "Blog Microservices"
2. Add variables:
   - `base_url`: `http://localhost:3001`
   - `jwt_token`: (will be set automatically)
   - `user_id`: (will be set automatically)

## Step 2: Test Scenarios

### Scenario 1: User Registration & Login
1. **Register a new user**
   - Method: POST
   - URL: `{{base_url}}/register`
   - Body (raw JSON):
   ```json
   {
     "username": "testuser1",
     "email": "test1@example.com",
     "password": "password123"
   }
   ```
   - Test Script (to save token):
   ```javascript
   if (pm.response.code === 201) {
     const response = pm.response.json();
     pm.environment.set("jwt_token", response.token);
     pm.environment.set("user_id", response.user.id);
   }
   ```

2. **Login with registered user**
   - Method: POST
   - URL: `{{base_url}}/login`
   - Body (raw JSON):
   ```json
   {
     "email": "test1@example.com",
     "password": "password123"
   }
   ```

### Scenario 2: User Operations
3. **Get user profile**
   - Method: GET
   - URL: `{{base_url}}/users/{{user_id}}`

4. **Register second user for follow test**
   - Method: POST
   - URL: `{{base_url}}/register`
   - Body (raw JSON):
   ```json
   {
     "username": "testuser2",
     "email": "test2@example.com",
     "password": "password123"
   }
   ```
   - Test Script:
   ```javascript
   if (pm.response.code === 201) {
     const response = pm.response.json();
     pm.environment.set("target_user_id", response.user.id);
   }
   ```

5. **Follow another user**
   - Method: POST
   - URL: `{{base_url}}/users/{{user_id}}/follow`
   - Headers: `Authorization: Bearer {{jwt_token}}`
   - Body (raw JSON):
   ```json
   {
     "targetUserId": "{{target_user_id}}"
   }
   ```

6. **Get following list**
   - Method: GET
   - URL: `{{base_url}}/users/{{user_id}}/following`
   - Headers: `Authorization: Bearer {{jwt_token}}`

### Scenario 3: Error Cases
7. **Test invalid login**
   - Method: POST
   - URL: `{{base_url}}/login`
   - Body (raw JSON):
   ```json
   {
     "email": "test1@example.com",
     "password": "wrongpassword"
   }
   ```

8. **Test unauthorized access**
   - Method: GET
   - URL: `{{base_url}}/users/{{user_id}}/following`
   - (Don't include Authorization header)

9. **Test following yourself**
   - Method: POST
   - URL: `{{base_url}}/users/{{user_id}}/follow`
   - Headers: `Authorization: Bearer {{jwt_token}}`
   - Body (raw JSON):
   ```json
   {
     "targetUserId": "{{user_id}}"
   }
   ```

## Pre-request Script for Authentication
For requests that need authentication, add this to Pre-request Script:
```javascript
if (!pm.environment.get("jwt_token")) {
    throw new Error("JWT token not found. Please login first.");
}
```

## Common Test Assertions
Add these to Test tab for validation:
```javascript
// Check response time
pm.test("Response time is less than 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

// Check content type
pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```
