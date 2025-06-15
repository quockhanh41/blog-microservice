import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserById, 
  getFollowingUsers, 
  followUser 
} from './user.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users/:id', getUserById);

// Protected routes (require JWT)
router.get('/users/:id/following', authenticateJWT, getFollowingUsers);
router.post('/users/:id/follow', authenticateJWT, followUser);

export default router;
