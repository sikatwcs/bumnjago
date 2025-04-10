import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Mock admin untuk pengujian jika database tidak tersedia
const mockAdmins = [
  {
    id: 1,
    email: 'admin@jagobumn.com',
    password: '$2b$10$O5KXzG5.7fPgaZLmRrM0T.N9lxzM2DMR7imo8jmN3YNbCqUh7XMh2', // hash untuk 'admin123'
    name: 'Admin Test'
  }
];

// Fungsi untuk mengecek apakah database tersedia
const isDatabaseAvailable = async () => {
  try {
    // Coba koneksi ke database
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error in admin routes, using mock data:', error);
    return false;
  }
};

// Login route untuk admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', { email });

    // Validasi input
    if (!email || !password) {
      console.log('Admin login failed: Missing email or password');
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Cek jika admin ada
      const admin = await prisma.admin.findUnique({
        where: { email }
      });

      if (!admin) {
        console.log('Admin login failed: Admin not found for email', email);
        return res.status(404).json({ message: 'Admin tidak ditemukan' });
      }

      // Verifikasi password
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        console.log('Admin login failed: Invalid password for email', email);
        return res.status(401).json({ message: 'Password salah' });
      }

      // Ambil JWT Secret dari environment variable
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      
      // Buat token JWT
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        jwtSecret,
        { expiresIn: '1d' }
      );

      console.log('Admin login successful:', { id: admin.id, email: admin.email });

      res.json({
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      });
    } else {
      // Mode testing, gunakan mock data
      console.log('Using mock data untuk admin login');
      
      // Cari admin di mock data
      const mockAdmin = mockAdmins.find(a => a.email === email);
      
      if (!mockAdmin) {
        return res.status(404).json({ message: 'Admin tidak ditemukan' });
      }
      
      // Verifikasi password
      const validPassword = await bcrypt.compare(password, mockAdmin.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Password salah' });
      }
      
      // Buat token JWT
      const token = jwt.sign(
        { id: mockAdmin.id, email: mockAdmin.email, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );
      
      res.json({
        token,
        admin: {
          id: mockAdmin.id,
          name: mockAdmin.name,
          email: mockAdmin.email
        }
      });
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint untuk membuat admin baru (hanya admin yang bisa akses)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Cek jika email sudah digunakan
      const existingAdmin = await prisma.admin.findUnique({
        where: { email }
      });

      if (existingAdmin) {
        return res.status(400).json({ message: 'Email sudah digunakan' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat admin baru
      const newAdmin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });

      res.status(201).json({
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email
        }
      });
    } else {
      // Mode testing
      res.status(503).json({ message: 'Database tidak tersedia' });
    }
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mendapatkan profil admin yang sedang login
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!admin) {
        return res.status(404).json({ message: 'Admin tidak ditemukan' });
      }

      res.json(admin);
    } else {
      // Mode testing
      const mockAdmin = mockAdmins.find(a => a.id === adminId);
      if (!mockAdmin) {
        return res.status(404).json({ message: 'Admin tidak ditemukan' });
      }
      
      res.json({
        id: mockAdmin.id,
        name: mockAdmin.name,
        email: mockAdmin.email,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error: any) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mendapatkan semua admin (hanya admin yang bisa akses)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const admins = await prisma.admin.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(admins);
    } else {
      // Mode testing
      const adminsData = mockAdmins.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      res.json(adminsData);
    }
  } catch (error: any) {
    console.error('Get all admins error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update profil admin
router.put('/profile', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, email } = req.body;

    // Validasi input
    if (!name && !email) {
      return res.status(400).json({ message: 'Minimal satu field harus diisi' });
    }

    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Update data
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      // Jika email diubah, cek jika sudah digunakan
      if (email) {
        const existingAdmin = await prisma.admin.findFirst({
          where: {
            email,
            id: { not: adminId }
          }
        });

        if (existingAdmin) {
          return res.status(400).json({ message: 'Email sudah digunakan' });
        }
      }

      // Update admin
      const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(updatedAdmin);
    } else {
      // Mode testing
      res.status(503).json({ message: 'Database tidak tersedia' });
    }
  } catch (error: any) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Change password
router.put('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Mendapatkan admin dengan passwordnya
      const admin = await prisma.admin.findUnique({
        where: { id: adminId }
      });

      if (!admin) {
        return res.status(404).json({ message: 'Admin tidak ditemukan' });
      }

      // Verifikasi password lama
      const validPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Password lama salah' });
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.admin.update({
        where: { id: adminId },
        data: { password: hashedPassword }
      });

      res.json({ message: 'Password berhasil diubah' });
    } else {
      // Mode testing
      res.status(503).json({ message: 'Database tidak tersedia' });
    }
  } catch (error: any) {
    console.error('Change admin password error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin initialization (for first time setup)
router.post('/initialize', async (req, res) => {
  try {
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Check if there's any admin already
      const adminCount = await prisma.admin.count();
      
      if (adminCount > 0) {
        return res.status(400).json({ message: 'Admin sudah diinisialisasi' });
      }
      
      const { name, email, password, initKey } = req.body;
      
      // Ensure there's an init key provided and it matches the env var
      if (!initKey || initKey !== process.env.ADMIN_INIT_KEY) {
        return res.status(401).json({ message: 'Kunci inisialisasi tidak valid' });
      }
      
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create first admin
      const newAdmin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });
      
      res.status(201).json({
        message: 'Admin berhasil diinisialisasi',
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email
        }
      });
    } else {
      // Mode testing
      res.status(503).json({ message: 'Database tidak tersedia' });
    }
  } catch (error: any) {
    console.error('Admin initialization error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mendapatkan semua profil pengguna
router.get('/profiles', authenticateAdmin, async (req, res) => {
  try {
    // Cek koneksi database
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const profiles = await prisma.profile.findMany({
        include: {
          user: {
            select: {
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(profiles);
    } else {
      // Mode testing
      res.status(503).json({ message: 'Database tidak tersedia' });
    }
  } catch (error: any) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 