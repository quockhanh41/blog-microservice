import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendUserUpdatedEvent } from './kafka';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createUser(username: string, email: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword
      }
    });

    // Notify other services about new user
    await sendUserUpdatedEvent({
      id: user.id,
      username: user.username,
      eventType: 'user.created'
    });

    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async getFollowingUsers(userId: string): Promise<{ id: string; username: string }[]> {
    const follows = await this.prisma.follow.findMany({
      where: {
        follower_id: userId
      },
      include: {
        followed: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return follows.map(follow => follow.followed);
  }

  async getAllUsers(): Promise<{ id: string; username: string }[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true
      },
      orderBy: {
        username: 'asc'
      }
    });

    return users;
  }

  async followUser(followerId: string, followedId: string): Promise<void> {
    // Check if already following
    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        follower_id: followerId,
        followed_id: followedId
      }
    });

    if (existingFollow) {
      throw new Error('Already following this user');
    }

    await this.prisma.follow.create({
      data: {
        follower_id: followerId,
        followed_id: followedId
      }
    });
  }

  async unfollowUser(followerId: string, followedId: string): Promise<void> {
    // Check if currently following
    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        follower_id: followerId,
        followed_id: followedId
      }
    });

    if (!existingFollow) {
      throw new Error('Not following this user');
    }

    await this.prisma.follow.delete({
      where: {
        id: existingFollow.id
      }
    });
  }

  async updateUser(id: string, data: { username?: string }): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data
    });

    // Notify other services about user update
    if (data.username) {
      await sendUserUpdatedEvent({
        id: user.id,
        username: user.username,
        eventType: 'user.updated'
      });
    }

    return user;
  }
}
