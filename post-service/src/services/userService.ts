import axios from 'axios';
import { User } from '../types';
import { ConsulServiceRegistry } from './consulService';

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
        'post-service', // Current service name
        'post-service', // Current service address
        parseInt(process.env.PORT || '3002') // Current service port
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

  async getUserById(userId: string): Promise<User | null> {
    try {
      const serviceUrl = await this.getServiceUrl();
      const response = await axios.get(`${serviceUrl}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
      const serviceUrl = await this.getServiceUrl();
      const response = await axios.get(`${serviceUrl}/users`, {
        params: { ids: userIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}
