import axios from 'axios';
import { User } from '../types';

export class UserServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users`, {
        params: { ids: userIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}
