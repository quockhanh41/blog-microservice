import { UserServiceClient } from './userServiceClient';
import { PostServiceClient, Post } from './postServiceClient';
import { RedisService } from './redisService';

export class FeedService {
  private userServiceClient: UserServiceClient;
  private postServiceClient: PostServiceClient;
  private redisService: RedisService;

  constructor() {
    this.userServiceClient = new UserServiceClient();
    this.postServiceClient = new PostServiceClient();
    this.redisService = new RedisService();
  }

  async getUserFeed(userId: string, limit: number = 50): Promise<Post[]> {
    try {
      // Try to get from cache first
      const cachedFeed = await this.redisService.getFeed(userId);
      if (cachedFeed && cachedFeed.length > 0) {
        console.log(`Returning cached feed for user ${userId}`);
        return cachedFeed;
      }

      // If not in cache, generate a new feed
      console.log(`Generating new feed for user ${userId}`);
      
      // Get list of users that the current user follows
      const followingUserIds = await this.userServiceClient.getFollowingUsers(userId);
      
      // Add the user's own posts to the feed (showing their own posts in their feed)
      const userIdsForFeed = [...followingUserIds, userId];
      
      // No following users or self, return empty feed
      if (userIdsForFeed.length === 0) {
        return [];
      }
      
      // Get posts from those users
      const posts = await this.postServiceClient.getPostsByUserIds(userIdsForFeed, limit);
      
      // Sort by creation date (newest first)
      const sortedPosts = posts.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Cache the feed
      await this.redisService.setFeed(userId, sortedPosts);
      
      return sortedPosts;
    } catch (error) {
      console.error('Error generating feed:', error);
      throw new Error('Failed to generate feed');
    }
  }

  async invalidateUserFeed(userId: string): Promise<void> {
    await this.redisService.invalidateFeed(userId);
  }
}
