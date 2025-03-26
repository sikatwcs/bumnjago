import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateQuestioner } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Login route untuk questioner
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek jika questioner ada
    const questioner = await prisma.questioner.findUnique({
      where: { email }
    });

    if (!questioner) {
      return res.status(404).json({ message: 'Questioner tidak ditemukan' });
    }

    // Verifikasi password
    const validPassword = await bcrypt.compare(password, questioner.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: questioner.id, email: questioner.email, role: 'questioner' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      questioner: {
        id: questioner.id,
        name: questioner.name,
        email: questioner.email
      }
    });
  } catch (error) {
    console.error('Questioner login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mendapatkan profil questioner yang sedang login
router.get('/profile', authenticateQuestioner, async (req, res) => {
  try {
    const questionerId = req.user.id;
    
    const questioner = await prisma.questioner.findUnique({
      where: { id: questionerId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!questioner) {
      return res.status(404).json({ message: 'Questioner tidak ditemukan' });
    }

    res.json(questioner);
  } catch (error) {
    console.error('Get questioner profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profil questioner
router.put('/profile', authenticateQuestioner, async (req, res) => {
  try {
    const questionerId = req.user.id;
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
      const existingQuestioner = await prisma.questioner.findFirst({
        where: {
          email,
          id: { not: questionerId }
        }
      });

      if (existingQuestioner) {
        return res.status(400).json({ message: 'Email sudah digunakan' });
      }
    }

    // Update questioner
    const updatedQuestioner = await prisma.questioner.update({
      where: { id: questionerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedQuestioner);
  } catch (error) {
    console.error('Update questioner profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateQuestioner, async (req, res) => {
  try {
    const questionerId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    // Mendapatkan questioner dengan passwordnya
    const questioner = await prisma.questioner.findUnique({
      where: { id: questionerId }
    });

    if (!questioner) {
      return res.status(404).json({ message: 'Questioner tidak ditemukan' });
    }

    // Verifikasi password lama
    const validPassword = await bcrypt.compare(currentPassword, questioner.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.questioner.update({
      where: { id: questionerId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change questioner password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route untuk membuat questioner baru (hanya admin yang bisa akses)
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    // Cek jika email sudah digunakan
    const existingQuestioner = await prisma.questioner.findUnique({
      where: { email }
    });

    if (existingQuestioner) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat questioner baru
    const newQuestioner = await prisma.questioner.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({
      questioner: {
        id: newQuestioner.id,
        name: newQuestioner.name,
        email: newQuestioner.email,
        createdAt: newQuestioner.createdAt
      }
    });
  } catch (error) {
    console.error('Create questioner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tryouts for questioner
router.get('/tryouts', authenticateQuestioner, async (req, res) => {
  try {
    const questionerId = req.user.id;

    // Ambil semua tryout yang aktif
    const tryouts = await prisma.tryoutList.findMany({
      where: {
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Konversi BigInt price ke string untuk setiap tryout
    const response = tryouts.map(tryout => ({
      ...tryout,
      price: tryout.price.toString()
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching tryouts for questioner:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific tryout detail with questions
router.get('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutId = parseInt(req.params.id);
    const questionerId = req.user.id;

    const tryout = await prisma.tryoutList.findUnique({
      where: {
        id: tryoutId,
        status: true
      },
      include: {
        tryouts: true
      }
    });

    if (!tryout) {
      return res.status(404).json({ message: 'Tryout tidak ditemukan' });
    }

    // Konversi BigInt price ke string
    const response = {
      ...tryout,
      price: tryout.price.toString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching tryout detail:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tryout lists for questioner
router.get('/tryoutlists', authenticateQuestioner, async (req, res) => {
  try {
    console.log('Mencoba mengambil tryout lists...');
    const questionerId = req.user.id;
    console.log('Questioner ID:', questionerId);

    // Ambil semua tryout list
    const tryoutLists = await prisma.tryoutList.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('Tryout lists yang ditemukan:', tryoutLists);

    // Konversi BigInt price ke string untuk setiap tryout
    const response = tryoutLists.map(tryout => ({
      ...tryout,
      price: tryout.price.toString()
    }));
    console.log('Response yang akan dikirim:', response);

    res.json(response);
  } catch (error) {
    console.error('Error fetching tryout lists for questioner:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get tryout questions by tryout list ID
router.get('/tryouts/:tryoutListId', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutListId = parseInt(req.params.tryoutListId);
    const questionerId = req.user.id;

    const tryouts = await prisma.tryout.findMany({
      where: { 
        tryoutListId: tryoutListId
      },
      orderBy: {
        number: 'asc'
      }
    });

    res.json(tryouts);
  } catch (error) {
    console.error('Error fetching tryout questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tryout question
router.post('/tryouts', authenticateQuestioner, async (req, res) => {
  try {
    const {
      tryoutListId,
      number,
      question,
      explanation,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer,
      type,
      subType,
      imageUrl
    } = req.body;

    const newTryout = await prisma.tryout.create({
      data: {
        tryoutListId: parseInt(tryoutListId),
        number: parseInt(number),
        question,
        explanation,
        optionA,
        optionB,
        optionC,
        optionD,
        optionE,
        correctAnswer,
        type,
        subType,
        imageUrl
      }
    });

    res.status(201).json(newTryout);
  } catch (error) {
    console.error('Error creating tryout question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tryout question
router.put('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutId = parseInt(req.params.id);
    const {
      number,
      question,
      explanation,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer,
      type,
      subType,
      imageUrl
    } = req.body;

    const updatedTryout = await prisma.tryout.update({
      where: { id: tryoutId },
      data: {
        number: parseInt(number),
        question,
        explanation,
        optionA,
        optionB,
        optionC,
        optionD,
        optionE,
        correctAnswer,
        type,
        subType,
        imageUrl
      }
    });

    res.json(updatedTryout);
  } catch (error) {
    console.error('Error updating tryout question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
