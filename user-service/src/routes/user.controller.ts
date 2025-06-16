import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
// import { KafkaService } from '../services/kafka';

const prisma = new PrismaClient();
const userService = new UserService(prisma);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const user = await userService.createUser(username, email, password);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.findUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return only public information
    res.status(200).json({
      id: user.id,
      username: user.username
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get following users
export const getFollowingUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const followingUsers = await userService.getFollowingUsers(id);

    res.status(200).json(followingUsers);
  } catch (error) {
    console.error('Get following users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Follow a user
export const followUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // follower_id
    console.log('Follow user request:', req.body);
    const { targetUserId } = req.body; // followed_id
    const userId = (req as any).user.id; // from JWT

    // Ensure the authenticated user is the one trying to follow
    if (id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only manage your own follow relationships' });
    }

    // Basic validation
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    // Check if both users exist
    const follower = await userService.findUserById(userId);
    const followed = await userService.findUserById(targetUserId);

    console.log('Follower:', follower);
    console.log('Followed:', followed);
    if (!follower || !followed) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent following yourself
    if (userId === targetUserId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Create follow relationship
    await userService.followUser(userId, targetUserId);

    res.status(200).json({ message: 'Successfully followed user' });
  } catch (error: any) {
    console.error('Follow user error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message === 'Already following this user') {
      return res.status(400).json({ error: message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unfollow a user
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // follower_id
    console.log('Unfollow user request:', req.body);
    const { targetUserId } = req.body; // followed_id
    const userId = (req as any).user.id; // from JWT

    // Ensure the authenticated user is the one trying to unfollow
    if (id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only manage your own follow relationships' });
    }

    // Basic validation
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    // Check if both users exist
    const follower = await userService.findUserById(userId);
    const followed = await userService.findUserById(targetUserId);

    console.log('Follower:', follower);
    console.log('Followed:', followed);
    if (!follower || !followed) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent unfollowing yourself (though this shouldn't be possible)
    if (userId === targetUserId) {
      return res.status(400).json({ error: 'You cannot unfollow yourself' });
    }

    // Remove follow relationship
    await userService.unfollowUser(userId, targetUserId);

    res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (error: any) {
    console.error('Unfollow user error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message === 'Not following this user') {
      return res.status(400).json({ error: message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile (authenticated user's own profile)
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // from JWT

    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user profile information
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // from JWT
    const { username } = req.body;

    // Find existing user
    const existingUser = await userService.findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user profile (only username for now)
    const updatedUser = await userService.updateUser(userId, { username });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
