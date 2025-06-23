import Redis from 'ioredis';
require('dotenv').config(); // Load environment variables from .env file
export class RedisService {
  private redis: Redis;
  private readonly TTL = 60 * 5; // 5 minutes cache expiry
  constructor() {
    // Connect to Redis using REDIS_URL environment variable or fall back to localhost
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.redis = new Redis(redisUrl);

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      // In production, you might want to implement a reconnection strategy
    });
  }

  async getFeed(userId: string): Promise<any[]> {
    const cacheKey = `feed:${userId}`;
    const cachedFeed = await this.redis.get(cacheKey);
    
    if (cachedFeed) {
      try {
        return JSON.parse(cachedFeed);
      } catch (error) {
        console.error('Error parsing cached feed:', error);
        return [];
      }
    }
    
    return [];
  }

  async setFeed(userId: string, feed: any[]): Promise<void> {
    const cacheKey = `feed:${userId}`;
    await this.redis.set(cacheKey, JSON.stringify(feed), 'EX', this.TTL);
  }

  async invalidateFeed(userId: string): Promise<void> {
    const cacheKey = `feed:${userId}`;
    await this.redis.del(cacheKey);
  }
}
