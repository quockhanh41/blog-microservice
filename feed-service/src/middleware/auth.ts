import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const extractUserId = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // In a real implementation, you would verify JWT token here
  // For now, we'll extract userId from headers (assuming API Gateway handles JWT verification)
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found in request' });
  }

  req.userId = userId;
  next();
};
