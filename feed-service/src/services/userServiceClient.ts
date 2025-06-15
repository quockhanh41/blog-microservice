import axios from 'axios';

export interface User {
  id: string;
  username: string;
}

export class UserServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
  }
  async getFollowingUsers(userId: string, authToken?: string): Promise<string[]> {
    try {
      const headers: any = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await axios.get(`${this.baseUrl}/users/${userId}/following`, {
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
      
      const response = await axios.get(`${this.baseUrl}/users/${userId}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }
}
