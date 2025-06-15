import { UserService } from '../src/services/user.service';
import { mockPrisma } from './setup';
import bcrypt from 'bcryptjs';

// Mock the sendUserUpdatedEvent function
jest.mock('../src/services/kafka', () => ({
  sendUserUpdatedEvent: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockPrisma as any);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = {
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await userService.createUser('testuser', 'test@example.com', 'password123');

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mock-salt');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password_hash: 'hashed-password',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle database errors', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      await expect(
        userService.createUser('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Database error');
    });
  });

  describe('findUserById', () => {
    it('should find user by ID', async () => {
      const mockUser = {
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findUserById('user-id-123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.findUserById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findUserByEmail('test@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getFollowingUsers', () => {
    it('should return list of following users', async () => {
      const mockFollows = [
        {
          followed: {
            id: 'user-2',
            username: 'user2',
          },
        },
        {
          followed: {
            id: 'user-3',
            username: 'user3',
          },
        },
      ];

      mockPrisma.follow.findMany.mockResolvedValue(mockFollows);

      const result = await userService.getFollowingUsers('user-1');

      expect(mockPrisma.follow.findMany).toHaveBeenCalledWith({
        where: { follower_id: 'user-1' },
        include: {
          followed: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      expect(result).toEqual([
        { id: 'user-2', username: 'user2' },
        { id: 'user-3', username: 'user3' },
      ]);
    });
  });

  describe('followUser', () => {
    it('should create follow relationship successfully', async () => {
      mockPrisma.follow.findFirst.mockResolvedValue(null);
      mockPrisma.follow.create.mockResolvedValue({
        id: 'follow-id',
        follower_id: 'user-1',
        followed_id: 'user-2',
        followed_at: new Date(),
      });

      await userService.followUser('user-1', 'user-2');

      expect(mockPrisma.follow.findFirst).toHaveBeenCalledWith({
        where: {
          follower_id: 'user-1',
          followed_id: 'user-2',
        },
      });

      expect(mockPrisma.follow.create).toHaveBeenCalledWith({
        data: {
          follower_id: 'user-1',
          followed_id: 'user-2',
        },
      });
    });

    it('should throw error if already following', async () => {
      mockPrisma.follow.findFirst.mockResolvedValue({
        id: 'existing-follow',
        follower_id: 'user-1',
        followed_id: 'user-2',
        followed_at: new Date(),
      });

      await expect(userService.followUser('user-1', 'user-2')).rejects.toThrow(
        'Already following this user'
      );

      expect(mockPrisma.follow.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        id: 'user-id-123',
        username: 'updateduser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser('user-id-123', {
        username: 'updateduser',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
        data: { username: 'updateduser' },
      });

      expect(result).toEqual(mockUpdatedUser);
    });
  });
});
