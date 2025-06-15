import { Response } from 'express';
import { PostService } from '../services/postService';
import { CreatePostRequest, GetPostsQuery } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper function to safely parse query parameter as string array
function parseStringArray(param: any): string[] | undefined {
  if (!param) return undefined;
  
  if (Array.isArray(param)) {
    return param.filter(item => typeof item === 'string' && item.trim() !== '');
  }
  
  if (typeof param === 'string') {
    return param.split(',').filter(id => id.trim() !== '');
  }
  
  return undefined;
}

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, content }: CreatePostRequest = req.body;
      const authorId = req.userId!;

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      const post = await this.postService.createPost(authorId, { title, content });
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }  async getPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Handle user_ids parameter which can be string or array
      let userIds: string[] | undefined;
      if (req.query.user_ids) {
        console.log('user_ids type:', typeof req.query.user_ids);
        console.log('user_ids value:', req.query.user_ids);
        
        userIds = parseStringArray(req.query.user_ids);
      }

      const query: GetPostsQuery = {
        user_ids: userIds,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sort: (req.query.sort as 'asc' | 'desc') || 'desc'
      };

      console.log('Final query:', query);
      const posts = await this.postService.getPostsByUserIds(query);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  async getPostById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const post = await this.postService.getPostById(id);
      
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  }
  // For testing purposes - get user reference
  async getUserReference(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userRef = await this.postService.getUserReference(userId);
      
      if (!userRef) {
        res.status(404).json({ error: 'User reference not found' });
        return;
      }

      res.json(userRef);
    } catch (error) {
      console.error('Error fetching user reference:', error);
      res.status(500).json({ error: 'Failed to fetch user reference' });
    }
  }

  async getPostsByUserId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const query: GetPostsQuery = {
        user_ids: [userId],
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sort: (req.query.sort as 'asc' | 'desc') || 'desc'
      };

      const posts = await this.postService.getPostsByUserIds(query);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts by user ID:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }
}
