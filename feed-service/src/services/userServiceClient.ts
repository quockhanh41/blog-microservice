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

  async getFollowingUsers(userId: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}/following`);
      return response.data.map((user: User) => user.id);
    } catch (error) {
      console.error('Error fetching following users:', error);
      throw new Error('Failed to fetch following users');
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }
}
