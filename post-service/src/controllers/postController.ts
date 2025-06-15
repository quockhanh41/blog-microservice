import { Response } from 'express';
import { PostService } from '../services/postService';
import { CreatePostRequest, GetPostsQuery } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

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
  }

  async getPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: GetPostsQuery = {
        user_ids: req.query.user_ids ? (req.query.user_ids as string).split(',') : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sort: (req.query.sort as 'asc' | 'desc') || 'desc'
      };

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

  async getAllPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const posts = await this.postService.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error('Error fetching all posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
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
}
