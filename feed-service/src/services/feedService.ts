import { UserServiceClient } from './userServiceClient';
import { PostServiceClient, Post } from './postServiceClient';
import { RedisService } from './redisService';

// Transformed post interface for frontend
export interface TransformedPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export class FeedService {
  private userServiceClient: UserServiceClient;
  private postServiceClient: PostServiceClient;
  private redisService: RedisService;

  constructor() {
    this.userServiceClient = new UserServiceClient();
    this.postServiceClient = new PostServiceClient();
    this.redisService = new RedisService();
  }  private transformPost(post: Post): TransformedPost {
    // Ensure created_at is properly formatted as ISO string
    let createdAt: string;
    try {
      // Handle date string validation
      if (typeof post.created_at === 'string' && post.created_at.trim() !== '') {
        // Validate the date string
        const date = new Date(post.created_at);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date for post ${post.id}: ${post.created_at}`);
          createdAt = new Date().toISOString(); // Fallback to current date
        } else {
          createdAt = date.toISOString();
        }
      } else {
        console.warn(`Missing or empty date for post ${post.id}`);
        createdAt = new Date().toISOString(); // Fallback to current date
      }
    } catch (error) {
      console.error('Error processing date for post', post.id, error);
      createdAt = new Date().toISOString(); // Fallback to current date
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.author_id,
        username: post.username,
        avatar: undefined // We don't have avatar data from post service
      },
      createdAt: createdAt,
      likesCount: 0, // We don't have likes data from post service yet
      commentsCount: 0, // We don't have comments data from post service yet
      isLiked: false
    };
  }
  async getUserFeed(userId: string, limit: number = 50, authToken?: string, page: number = 1): Promise<{ posts: TransformedPost[], hasMore: boolean, total: number }> {
    try {      // Try to get from cache first
      const cachedFeed = await this.redisService.getFeed(userId);
      let allPosts: TransformedPost[] = [];
      
      if (cachedFeed && cachedFeed.length > 0) {
        console.log(`Returning cached feed for user ${userId}`);
        // Check if cached posts are already transformed by looking for the author property
        if (cachedFeed[0] && 'author' in cachedFeed[0]) {
          // Already transformed
          allPosts = cachedFeed as TransformedPost[];
        } else {
          // Not transformed yet, transform them
          allPosts = cachedFeed.map(post => this.transformPost(post as Post));
        }
      } else {
        // If not in cache, generate a new feed
        console.log(`Generating new feed for user ${userId}`);
        
        // Get list of users that the current user follows
        const followingUserIds = await this.userServiceClient.getFollowingUsers(userId, authToken);
        
        // Add the user's own posts to the feed (showing their own posts in their feed)
        const userIdsForFeed = [...followingUserIds, userId];
        
        // No following users or self, return empty feed
        if (userIdsForFeed.length === 0) {
          return { posts: [], hasMore: false, total: 0 };
        }
        
        // Get posts from those users
        const posts = await this.postServiceClient.getPostsByUserIds(userIdsForFeed, limit * 10); // Get more for caching
        
        // Transform and sort by creation date (newest first)
        allPosts = posts.map(post => this.transformPost(post)).sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Cache the transformed posts
        await this.redisService.setFeed(userId, allPosts);
      }
      
      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedPosts = allPosts.slice(offset, offset + limit);
      const hasMore = offset + limit < allPosts.length;
      
      return {
        posts: paginatedPosts,
        hasMore: hasMore,
        total: allPosts.length
      };
    } catch (error) {
      console.error('Error generating feed:', error);
      throw new Error('Failed to generate feed');
    }
  }

  async invalidateUserFeed(userId: string): Promise<void> {
    await this.redisService.invalidateFeed(userId);
  }
}
