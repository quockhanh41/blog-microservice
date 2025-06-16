import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserById,
  getAllUsers, 
  getFollowingUsers, 
  followUser,
  unfollowUser,
  getProfile,
  updateProfile
} from './user.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);

// Protected routes (require JWT)
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.get('/users/:id/following', authenticateJWT, getFollowingUsers);
router.post('/users/:id/follow', authenticateJWT, followUser);
router.delete('/users/:id/unfollow', authenticateJWT, unfollowUser);

export default router;
