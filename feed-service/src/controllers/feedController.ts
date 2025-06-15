import { Request, Response } from 'express';
import { FeedService } from '../services/feedService';
import { AuthenticatedRequest } from '../middleware/auth';

export class FeedController {
  private feedService: FeedService;

  constructor() {
    this.feedService = new FeedService();
  }

  async getFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get optional limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      // Get the feed
      const feed = await this.feedService.getUserFeed(userId, limit);
      
      res.status(200).json(feed);
    } catch (error) {
      console.error('Error fetching feed:', error);
      res.status(500).json({ error: 'Failed to fetch feed' });
    }
  }

  async invalidateFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Invalidate the feed
      await this.feedService.invalidateUserFeed(userId);
      
      res.status(200).json({ message: 'Feed cache invalidated successfully' });
    } catch (error) {
      console.error('Error invalidating feed:', error);
      res.status(500).json({ error: 'Failed to invalidate feed' });
    }
  }
}
