import request from 'supertest';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import userRoutes from '../src/routes';
import { mockPrisma } from './setup';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock Kafka service
jest.mock('../src/services/kafka', () => ({
  sendUserUpdatedEvent: jest.fn(),
  setupKafkaProducer: jest.fn(),
}));

describe('User Controller Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(json());
    app.use(cors());
    app.use(userRoutes);
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
      });
    });

    it('should return 400 if user already exists', async () => {
      const existingUser = {
        id: 'existing-user-id',
        username: 'existinguser',
        email: 'existing@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User already exists with this email');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          // missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'All fields are required');
    });
  });

  describe('POST /login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 for wrong password', async () => {
      const mockUser = {
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID successfully', async () => {
      const mockUser = {
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app).get('/users/user-id-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 'user-id-123',
        username: 'testuser',
      });
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/users/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('GET /users/:id/following', () => {
    it('should get following users successfully with valid JWT', async () => {
      const mockFollows = [
        {
          followed: {
            id: 'user-2',
            username: 'user2',
          },
        },
      ];

      mockPrisma.follow.findMany.mockResolvedValue(mockFollows);

      const token = jwt.sign({ id: 'user-1', username: 'user1' }, 'test-secret');

      const response = await request(app)
        .get('/users/user-1/following')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: 'user-2',
          username: 'user2',
        },
      ]);
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app).get('/users/user-1/following');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authorization header missing');
    });
  });

  describe('POST /users/:id/follow', () => {
    it('should follow user successfully', async () => {
      const mockFollower = {
        id: 'user-1',
        username: 'user1',
        email: 'user1@example.com',
        password_hash: 'hash',
        created_at: new Date(),
      };

      const mockFollowed = {
        id: 'user-2',
        username: 'user2',
        email: 'user2@example.com',
        password_hash: 'hash',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowed);
      mockPrisma.follow.findFirst.mockResolvedValue(null);
      mockPrisma.follow.create.mockResolvedValue({
        id: 'follow-id',
        follower_id: 'user-1',
        followed_id: 'user-2',
        followed_at: new Date(),
      });

      const token = jwt.sign({ id: 'user-1', username: 'user1' }, 'test-secret');

      const response = await request(app)
        .post('/users/user-1/follow')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUserId: 'user-2',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Successfully followed user');
    });

    it('should return 400 when trying to follow yourself', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'user1',
        email: 'user1@example.com',
        password_hash: 'hash',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const token = jwt.sign({ id: 'user-1', username: 'user1' }, 'test-secret');

      const response = await request(app)
        .post('/users/user-1/follow')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUserId: 'user-1',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'You cannot follow yourself');
    });

    it('should return 403 when trying to follow for another user', async () => {
      const token = jwt.sign({ id: 'user-1', username: 'user1' }, 'test-secret');

      const response = await request(app)
        .post('/users/user-2/follow') // Different user ID
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUserId: 'user-3',
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Forbidden: You can only manage your own follow relationships'
      );
    });
  });
});
