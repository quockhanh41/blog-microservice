import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { extractUserId } from '../middleware/auth';

const router = Router();
const postController = new PostController();

// Create a new post
router.post('/posts', extractUserId, (req, res) => postController.createPost(req, res));

// Get posts by user IDs (used by feed service)
router.get('/posts', (req, res) => postController.getPosts(req, res));

// Get all posts (for testing)
router.get('/posts/all', (req, res) => postController.getAllPosts(req, res));

// Get a specific post by ID
router.get('/posts/:id', (req, res) => postController.getPostById(req, res));

// Get user reference (for testing)
router.get('/user-reference/:userId', (req, res) => postController.getUserReference(req, res));

export default router;
