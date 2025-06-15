# User Service Testing Guide

## Overview
This document describes the testing strategy and implementation for the User Service.

## Testing Stack
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for integration tests
- **ts-jest**: TypeScript preprocessor for Jest
- **@types/jest**: TypeScript definitions for Jest

## Test Structure

### Unit Tests
- `user.service.test.ts` - Tests for UserService business logic
- `kafka.service.test.ts` - Tests for Kafka messaging service
- `auth.middleware.test.ts` - Tests for JWT authentication middleware
- `utils.test.ts` - Tests for utility functions

### Integration Tests
- `user.controller.test.ts` - End-to-end API tests

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Coverage Goals
- **Unit Tests**: >90% code coverage
- **Integration Tests**: Cover all API endpoints
- **Edge Cases**: Error handling and validation

## Testing Best Practices

### 1. Mocking
- Mock external dependencies (Prisma, Kafka, bcrypt, JWT)
- Use Jest mocks for consistent test environments
- Mock only what's necessary

### 2. Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the expected outcome

### 3. Test Naming
- Use descriptive names that explain what is being tested
- Follow the pattern: `should [expected behavior] when [condition]`

### 4. Test Data
- Use consistent test data across tests
- Create factory functions for complex test objects
- Keep test data minimal but realistic

## Test Examples

### Unit Test Example
```typescript
describe('UserService', () => {
  it('should create a user successfully', async () => {
    // Arrange
    const mockUser = { id: '123', username: 'test', email: 'test@example.com' };
    mockPrisma.user.create.mockResolvedValue(mockUser);

    // Act
    const result = await userService.createUser('test', 'test@example.com', 'password');

    // Assert
    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { username: 'test', email: 'test@example.com', password_hash: 'hashed-password' }
    });
  });
});
```

### Integration Test Example
```typescript
describe('POST /register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });
});
```

## Mock Configuration

### Prisma Mock
```typescript
export const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  follow: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
};
```

### JWT Mock
```typescript
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ id: 'mock-user-id', username: 'mock-username' })),
}));
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Test Environment

### Environment Variables for Testing
```bash
NODE_ENV=test
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
JWT_SECRET="test-secret"
KAFKA_BROKERS="localhost:9092"
```

### Database Setup for Testing
- Use separate test database
- Reset database state between tests
- Use transactions for test isolation

## Debugging Tests

### Common Issues
1. **Async/Await**: Ensure all async operations are properly awaited
2. **Mock Cleanup**: Clear mocks between tests using `jest.clearAllMocks()`
3. **Database State**: Ensure clean database state for each test
4. **Environment Variables**: Use test-specific environment variables

### Debug Commands
```bash
# Run specific test file
npm test user.service.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
npm test -- --debug
```

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain test coverage above 90%
4. Update this documentation if needed
