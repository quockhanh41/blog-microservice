import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
export const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  follow: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Mock Kafka Service
export const mockKafkaService = {
  sendUserUpdatedEvent: jest.fn(),
};

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ id: 'mock-user-id', username: 'mock-username' })),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(() => Promise.resolve('mock-salt')),
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Setup before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(10000);
