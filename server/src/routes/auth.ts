import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Mock users untuk pengujian jika database tidak tersedia
const mockUsers = [
  {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$O5KXzG5.7fPgaZLmRrM0T.N9lxzM2DMR7imo8jmN3YNbCqUh7XMh2', // hash untuk 'password123'
    profile: {
      id: 1,
      userId: 1,
      name: 'Test User',
      province: 'Jakarta',
      phone: '08123456789',
      gender: 'male',
      instance: 'Test School'
    }
  }
];

// Fungsi untuk mengecek apakah database tersedia
const isDatabaseAvailable = async () => {
  try {
    // Coba koneksi ke database
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error, using mock data:', error);
    return false;
  }
};

// Route register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, province, phone, gender, instance } = req.body;

    // Validasi input
    if (!email || !password || !name || !province || !phone || !gender || !instance) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    console.log('Registrasi baru:', { 
      email, 
      name, 
      province, // Pastikan province ada
      phone, 
      gender, 
      instance 
    });

    // Validate gender
    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'Gender harus male atau female' });
    }

    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Cek apakah email sudah terdaftar
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat user dan profile dalam satu transaksi
      const result = await prisma.$transaction(async (prisma) => {
        // Buat user
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            profile: {
              create: {
                name,
                province,
                phone,
                gender,
                instance
              }
            }
          },
          include: {
            profile: true
          }
        });

        // Log data yang disimpan
        console.log('User created with profile:', {
          id: user.id,
          email: user.email,
          profile: user.profile
        });

        // Buat token
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        return { user, token };
      });

      // Hapus password dari response
      const userResponse = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.profile?.name,
        profile: result.user.profile
      };

      res.status(201).json({ 
        message: 'User berhasil dibuat',
        user: userResponse,
        token: result.token
      });
    } else {
      // Mode testing, gunakan mock data
      console.log('Using mock data untuk registrasi');

      // Cek apakah email sudah terdaftar
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat user baru
      const newUser = {
        id: mockUsers.length + 1,
        email,
        password: hashedPassword,
        profile: {
          id: mockUsers.length + 1,
          userId: mockUsers.length + 1,
          name,
          province,
          phone,
          gender,
          instance,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUsers.push(newUser);

      // Buat token
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Hapus password dari response
      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.profile.name,
        profile: newUser.profile
      };

      res.status(201).json({ 
        message: 'User berhasil dibuat',
        user: userResponse,
        token
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Route login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Gunakan database jika tersedia
      
      // Cari user berdasarkan email
      const user = await prisma.user.findUnique({ 
        where: { email },
        include: { profile: true }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Verifikasi password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Password salah' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );

      // Ambil informasi user yang diperlukan
      const userInfo = {
        id: user.id,
        email: user.email,
        name: user.profile?.name
      };

      res.json({ token, user: userInfo });
    } else {
      // Gunakan mock data jika database tidak tersedia
      console.log('Using mock login:', { email });
      
      // Cari user di mock data
      const mockUser = mockUsers.find(u => u.email === email);
      
      if (!mockUser) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      // Verifikasi password
      const validPassword = await bcrypt.compare(password, mockUser.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Password salah' });
      }
      
      // Generate token
      const token = jwt.sign(
        { userId: mockUser.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );
      
      const userInfo = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.profile.name
      };
      
      res.json({ token, user: userInfo });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Route untuk mendapatkan informasi user berdasarkan token
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }
    
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Cari user berdasarkan ID dari token
      const user = await prisma.user.findUnique({ 
        where: { id: decoded.userId },
        include: { profile: true }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      // Ambil informasi user yang diperlukan
      const userInfo = {
        id: user.id,
        email: user.email,
        name: user.profile?.name
      };
      
      res.json(userInfo);
    } else {
      // Gunakan mock data
      const mockUser = mockUsers.find(u => u.id === decoded.userId);
      
      if (!mockUser) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      const userInfo = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.profile.name
      };
      
      res.json(userInfo);
    }
  } catch (error) {
    console.error('Auth/me error:', error);
    res.status(401).json({ message: 'Token tidak valid' });
  }
});

// Route untuk mendapatkan profil user
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              createdAt: true
            }
          }
        }
      });
      
      if (!profile) {
        return res.status(404).json({ message: 'Profil tidak ditemukan' });
      }
      
      res.json(profile);
    } else {
      // Gunakan mock data
      const mockProfile = mockUsers.find(u => u.id === userId)?.profile;
      if (!mockProfile) {
        return res.status(404).json({ message: 'Profil tidak ditemukan' });
      }
      
      res.json(mockProfile);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Route untuk memperbarui profil user
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, province, phone, gender, instance } = req.body;
    
    // Validasi input
    if (!name || !province || !phone || !gender || !instance) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    
    // Validasi gender
    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'Gender harus male atau female' });
    }
    
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          name,
          province,
          phone,
          gender,
          instance
        }
      });
      
      res.json(updatedProfile);
    } else {
      // Update mock data
      const mockUserIndex = mockUsers.findIndex(u => u.id === userId);
      if (mockUserIndex === -1) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      mockUsers[mockUserIndex].profile = {
        ...mockUsers[mockUserIndex].profile,
        name,
        province,
        phone,
        gender,
        instance,
      };
      
      res.json(mockUsers[mockUserIndex].profile);
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Route untuk mengubah password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }
    
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Cari user berdasarkan ID
      const user = await prisma.user.findUnique({ 
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      // Verifikasi password lama
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Password saat ini tidak valid' });
      }
      
      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
      
      res.json({ message: 'Password berhasil diubah' });
    } else {
      // Gunakan mock data
      const mockUserIndex = mockUsers.findIndex(u => u.id === userId);
      if (mockUserIndex === -1) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      // Verifikasi password lama
      const validPassword = await bcrypt.compare(currentPassword, mockUsers[mockUserIndex].password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Password saat ini tidak valid' });
      }
      
      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      mockUsers[mockUserIndex].password = hashedPassword;
      
      res.json({ message: 'Password berhasil diubah' });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Export dengan cara yang benar
export default router;
