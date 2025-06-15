import { PrismaClient } from '@prisma/client';
import { Post, CreatePostRequest, GetPostsQuery, UserReference } from '../types';
import { UserServiceClient } from './userService';

export class PostService {
  private prisma: PrismaClient;
  private userServiceClient: UserServiceClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.userServiceClient = new UserServiceClient();
  }

  async createPost(authorId: string, postData: CreatePostRequest): Promise<Post> {
    // Get username from cache or fetch from user service
    const username = await this.getUsernameForAuthor(authorId);
    
    const post = await this.prisma.post.create({
      data: {
        author_id: authorId,
        username: username,
        title: postData.title,
        content: postData.content,
      },
    });

    return post;
  }

  async getPostsByUserIds(query: GetPostsQuery): Promise<Post[]> {
    const { user_ids, limit = 50, sort = 'desc' } = query;

    const posts = await this.prisma.post.findMany({
      where: user_ids ? {
        author_id: {
          in: user_ids
        }
      } : {},
      orderBy: {
        created_at: sort
      },
      take: Math.min(limit, 100), // Cap at 100 posts
    });

    return posts;
  }

  async getPostById(postId: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    });

    return post;
  }

  async updateUserReference(userId: string, username: string): Promise<void> {
    // Update user reference cache
    await this.prisma.userReference.upsert({
      where: { user_id: userId },
      update: { username, updated_at: new Date() },
      create: { user_id: userId, username }
    });

    // Update all posts by this user with the new username
    await this.prisma.post.updateMany({
      where: { author_id: userId },
      data: { username }
    });

    console.log(`Updated username for user ${userId} to ${username}`);
  }

  private async getUsernameForAuthor(authorId: string): Promise<string> {
    // First, try to get from cache
    const userRef = await this.prisma.userReference.findUnique({
      where: { user_id: authorId }
    });

    if (userRef) {
      return userRef.username;
    }

    // If not in cache, fetch from user service
    const user = await this.userServiceClient.getUserById(authorId);
    if (!user) {
      throw new Error(`User with id ${authorId} not found`);
    }

    // Cache the username
    await this.prisma.userReference.create({
      data: {
        user_id: authorId,
        username: user.username
      }
    });

    return user.username;
  }

  async getUserReference(userId: string): Promise<UserReference | null> {
    return await this.prisma.userReference.findUnique({
      where: { user_id: userId }
    });
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.prisma.post.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
