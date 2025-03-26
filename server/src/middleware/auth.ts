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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Cek apakah database tersedia
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Cek apakah ini admin
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id }
      });
      
      if (!admin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      req.user = admin;
    } else {
      // Untuk pengembangan, ijinkan akses admin
      console.log('Using mock admin in authenticateAdmin middleware');
      req.user = {
        id: decoded.id || 1,
        email: 'admin@example.com',
        name: 'Mock Admin'
      };
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authenticateQuestioner = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    console.log('Mencoba verifikasi token dengan JWT_SECRET:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('Token berhasil diverifikasi:', decoded);
    
    // Cek apakah database tersedia
    const dbAvailable = await isDatabaseAvailable();
    console.log('Database tersedia:', dbAvailable);
    
    if (dbAvailable) {
      // Cek apakah ini questioner
      const questioner = await prisma.questioner.findUnique({
        where: { id: decoded.id }
      });
      console.log('Questioner ditemukan:', questioner);
      
      if (!questioner) {
        return res.status(403).json({ message: 'Questioner access required' });
      }
      
      req.user = questioner;
    } else {
      // Untuk pengembangan, ijinkan akses questioner
      console.log('Using mock questioner in authenticateQuestioner middleware');
      req.user = {
        id: decoded.id || 1,
        email: 'questioner@example.com',
        name: 'Mock Questioner'
      };
    }
    
    next();
  } catch (error) {
    console.error('Error verifikasi token:', error);
    return res.status(403).json({ 
      message: 'Invalid token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 