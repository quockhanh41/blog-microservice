import axios from 'axios';

export interface Post {
  id: string;
  author_id: string;
  username: string;
  title: string;
  content: string;
  created_at: string;
}

export class PostServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.POST_SERVICE_URL || 'http://localhost:3002';
  }

  async getPostsByUserIds(userIds: string[], limit: number = 50, sort: string = 'desc'): Promise<Post[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/posts`, {
        params: {
          user_ids: userIds,
          limit,
          sort
        },
        paramsSerializer: (params) => {
          // Convert array to comma-separated string
          const { user_ids, ...rest } = params;
          const serialized = new URLSearchParams(rest as Record<string, string>);
          
          if (user_ids && Array.isArray(user_ids)) {
            user_ids.forEach(id => serialized.append('user_ids', id));
          }
          console.log(`Serialized params: ${serialized.toString()}`);
          // Return the serialized string
          return serialized.toString();
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }
}
