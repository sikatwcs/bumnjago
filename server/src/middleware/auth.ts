import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock users untuk testing jika database tidak tersedia
const mockUsers = [
  {
    id: 1,
    email: 'test@example.com',
    profile: {
      name: 'Test User'
    }
  }
];

// Fungsi untuk mengecek apakah database tersedia
const isDatabaseAvailable = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error in middleware, using mock data:', error);
    return false;
  }
};

interface JwtPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    
    // Cek apakah database tersedia
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Cek apakah user masih ada di database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User tidak ditemukan' });
      }
      
      req.userId = decoded.userId;
      req.user = {
        id: user.id,
        email: user.email,
        name: user.profile?.name
      };
    } else {
      // Gunakan mock data jika database tidak tersedia
      console.log('Using mock data in authMiddleware');
      
      // Anggap token valid dan berikan akses ke mock user
      req.userId = decoded.userId;
      
      // Gunakan mockUser yang sesuai jika tersedia
      const mockUser = mockUsers.find(u => u.id === decoded.userId);
      if (mockUser) {
        req.user = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.profile?.name
        };
      } else {
        // Default user jika tidak ada yang cocok
        req.user = {
          id: decoded.userId,
          email: 'mock@example.com',
          name: 'Mock User'
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Authenticating admin request...');
    
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid or missing authorization header');
      return res.status(401).json({ message: 'Authentication token required' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Token received, verifying...');

    // Ambil JWT Secret
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      console.log('Token verified for admin:', decoded.email);
      
      // Cek apakah database tersedia
      const dbAvailable = await isDatabaseAvailable();
      
      if (dbAvailable) {
        // Cek apakah ini admin
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id }
        });
        
        if (!admin) {
          console.log('Admin authentication failed: Admin not found for id', decoded.id);
          return res.status(403).json({ message: 'Admin access required' });
        }
        
        req.user = admin;
        console.log('Admin successfully authenticated:', { id: admin.id, email: admin.email });
      } else {
        // Untuk pengembangan, ijinkan akses admin
        console.log('Using mock admin in authenticateAdmin middleware');
        req.user = {
          id: decoded.id || 1,
          email: decoded.email || 'admin@example.com',
          name: decoded.name || 'Mock Admin'
        };
      }
      
      next();
    } catch (jwtError: any) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Invalid token: ' + jwtError.message });
    }
  } catch (error: any) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateQuestioner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Authenticating questioner request...');
    
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid or missing authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received, verifying...');

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as any;

      console.log('Token verified for questioner:', decoded.email);

      if (decoded.role !== 'questioner') {
        console.log('Invalid role:', decoded.role);
        return res.status(403).json({ message: 'Not authorized as questioner' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      console.log('Authentication successful');
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
}; 