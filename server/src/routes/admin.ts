import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Login route untuk admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek jika admin ada
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin tidak ditemukan' });
    }

    // Verifikasi password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mendapatkan profil admin yang sedang login
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    
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
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mendapatkan semua admin (hanya admin yang bisa akses)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin initialization (for first time setup)
router.post('/initialize', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Admin initialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mendapatkan semua profil pengguna
router.get('/profiles', authenticateAdmin, async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 