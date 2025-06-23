import axios from 'axios';
import { ConsulServiceRegistry } from './consulService';
require('dotenv').config();
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
  private consulRegistry?: ConsulServiceRegistry;

  constructor() {
    this.baseUrl = process.env.POST_SERVICE_URL || 'http://localhost:3002';
    
    // Initialize Consul registry for service discovery
    const consulHost = process.env.CONSUL_HOST;
    const consulPort = process.env.CONSUL_PORT;
    
    if (consulHost && consulPort) {
      this.consulRegistry = new ConsulServiceRegistry(
        consulHost,
        parseInt(consulPort),
        'feed-service', // Current service name
        'feed-service', // Current service address
        parseInt(process.env.PORT || '3003') // Current service port
      );
    }
  }

  private async getServiceUrl(): Promise<string> {
    if (this.consulRegistry) {
      try {
        const postServiceUrl = await this.consulRegistry.getServiceUrl('post-service');
        if (postServiceUrl) {
          return postServiceUrl;
        }
      } catch (error) {
        console.warn('Failed to discover post-service via Consul, falling back to configured URL:', error);
      }
    }
    
    return this.baseUrl;
  }

  async getPostsByUserIds(userIds: string[], limit: number = 50, sort: string = 'desc'): Promise<Post[]> {
    try {
      const serviceUrl = await this.getServiceUrl();
      const response = await axios.get(`${serviceUrl}/posts`, {
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
