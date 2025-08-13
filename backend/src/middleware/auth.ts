import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    console.log(`🔒 Auth middleware - Headers:`, req.headers.authorization ? 'Present' : 'Missing');

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log(`🎫 Token extracted: ${token ? 'Present' : 'Missing'}`);
    }

    if (!token) {
      console.log(`❌ No token provided for ${req.method} ${req.path}`);
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.log(`❌ JWT_SECRET not defined in environment`);
        throw new Error('JWT_SECRET is not defined');
      }
      
      console.log(`🔍 Verifying token...`);
      const decoded = jwt.verify(token, secret) as any;
      console.log(`✅ Token verified, userId: ${decoded.userId}`);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log(`❌ User not found for userId: ${decoded.userId}`);
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      console.log(`👤 User authenticated: ${user.name} (${user.email})`);
      req.user = user;
      next();
    } catch (error: any) {
      console.log(`❌ Token verification failed:`, error.message);
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
  } catch (error: any) {
    console.log(`❌ Auth middleware error:`, error.message);
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }

    next();
  };
};
