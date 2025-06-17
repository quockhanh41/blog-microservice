import axios from 'axios';
import { ConsulServiceRegistry } from './consulService';

export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export class UserServiceClient {
  private baseUrl: string;
  private consulRegistry?: ConsulServiceRegistry;

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    
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
        const userServiceUrl = await this.consulRegistry.getServiceUrl('user-service');
        if (userServiceUrl) {
          return userServiceUrl;
        }
      } catch (error) {
        console.warn('Failed to discover user-service via Consul, falling back to configured URL:', error);
      }
    }
    
    return this.baseUrl;
  }

  async getFollowingUsers(userId: string, authToken?: string): Promise<string[]> {
    try {
      const headers: any = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const serviceUrl = await this.getServiceUrl();
      const response = await axios.get(`${serviceUrl}/users/${userId}/following`, {
        headers
      });
      return response.data.map((user: User) => user.id);
    } catch (error) {
      console.error('Error fetching following users:', error);
      throw new Error('Failed to fetch following users');
    }
  }

  async getUserById(userId: string, authToken?: string): Promise<User> {
    try {
      const headers: any = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const serviceUrl = await this.getServiceUrl();
      const response = await axios.get(`${serviceUrl}/users/${userId}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }
}
