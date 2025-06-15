import { Router } from 'express';
import { FeedController } from '../controllers/feedController';
import { extractUserId } from '../middleware/auth';

const router = Router();
const feedController = new FeedController();

// Get personalized feed for the authenticated user
router.get('/feed', extractUserId, (req, res) => feedController.getFeed(req, res));

// Manually invalidate the feed cache (useful for testing or debugging)
router.post('/feed/invalidate', extractUserId, (req, res) => feedController.invalidateFeed(req, res));

export default router;
