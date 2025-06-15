# Post Service

The Post Service is responsible for managing blog posts in the microservices architecture. It handles CRUD operations on posts and maintains a cache of user information for performance optimization.

## Features

- ✅ Create, read posts
- ✅ User information caching
- ✅ Kafka event consumption for user updates
- ✅ JWT authentication support (via API Gateway)
- ✅ Database migrations with Prisma
- ✅ Docker support
- ✅ Health check endpoint

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Message Queue**: Kafka
- **Containerization**: Docker

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Kafka (for event handling)
- Docker (optional, for containerized deployment)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Initialize database (optional)
   npm run db:init
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

## Development

### Run in development mode:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
npm start
```

### Database management:
```bash
# View database in Prisma Studio
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## Docker Deployment

### Build and run with Docker Compose:
```bash
docker-compose up --build
```

### Build Docker image:
```bash
docker build -t post-service .
```

### Run Docker container:
```bash
docker run -p 3002:3002 --env-file .env post-service
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Posts
- `POST /posts` - Create a new post (requires authentication)
- `GET /posts` - Get posts (with optional filtering)
- `GET /posts/all` - Get all posts
- `GET /posts/:id` - Get specific post by ID

### Testing/Debug
- `GET /user-reference/:userId` - Get cached user information

See [API_SPEC.md](API_SPEC.md) for detailed API documentation.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3002` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `USER_SERVICE_URL` | User service base URL | `http://localhost:3001` |
| `KAFKA_BROKER` | Kafka broker address | `localhost:9092` |
| `NODE_ENV` | Environment mode | `development` |

## Database Schema

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  username VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Reference Table (Cache)
```sql
CREATE TABLE user_reference (
  user_id UUID PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Event Handling

The service consumes the following Kafka events:

- **user.updated**: Updates cached user information when users change their profile

## Architecture Integration

### Dependencies:
- **User Service**: Fetches user information when not cached
- **API Gateway**: Provides authentication and request routing

### Used by:
- **Feed Service**: Retrieves posts for user feeds
- **API Gateway**: Routes client requests

## Monitoring and Health

- Health check endpoint: `GET /health`
- Docker health check included
- Graceful shutdown handling

## Development Notes

1. **Caching Strategy**: User information is cached locally to reduce API calls to the User Service
2. **Event-Driven Updates**: Kafka events keep the cache synchronized
3. **Authentication**: JWT validation is handled by the API Gateway
4. **Error Handling**: Comprehensive error handling and logging
5. **Performance**: Pagination and filtering support for large datasets

## Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check network connectivity

2. **Kafka Connection Issues:**
   - Verify Kafka broker is running
   - Check KAFKA_BROKER environment variable
   - Ensure topic 'user.updated' exists

3. **User Service Communication:**
   - Verify USER_SERVICE_URL is correct
   - Ensure User Service is running and accessible
   - Check network policies in containerized environments

### Logs:
The service provides detailed logging for:
- Kafka event processing
- User cache operations
- API request/response cycles
- Database operations
- Error conditions

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update API documentation
4. Ensure Docker builds successfully
5. Test Kafka event handling
