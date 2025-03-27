import { Router } from 'express';
import { authenticateQuestioner } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Login questioner
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for questioner:', { email });
    
    // Cari questioner berdasarkan email
    const questioner = await prisma.questioner.findUnique({
      where: { email }
    });
    console.log('Found questioner:', questioner);

    if (!questioner) {
      console.log('Questioner not found');
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Verifikasi password (Anda perlu menambahkan hash password nanti)
    if (password !== questioner.password) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate token JWT
    const token = jwt.sign(
      { id: questioner.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    console.log('Generated token for questioner:', { id: questioner.id });

    res.json({
      token,
      questioner: {
        id: questioner.id,
        name: questioner.name,
        email: questioner.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get questioner profile
router.get('/profile', authenticateQuestioner, async (req, res) => {
  try {
    const questioner = await prisma.questioner.findUnique({
      where: { id: req.user.id },
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
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tryout lists for questioner
router.get('/tryoutlists', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutLists = await prisma.tryoutList.findMany({
      where: {
        // Tambahkan filter jika diperlukan
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tryoutLists);
  } catch (error) {
    console.error('Get tryout lists error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tryout details
router.get('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutId = parseInt(req.params.id);
    const tryout = await prisma.tryout.findMany({
      where: {
        tryoutListId: tryoutId
      },
      include: {
        tryoutList: true
      },
      orderBy: {
        number: 'asc'
      }
    });

    if (!tryout) {
      return res.status(404).json({ message: 'Tryout tidak ditemukan' });
    }

    res.json(tryout);
  } catch (error) {
    console.error('Get tryout details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new question
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
      subType
    } = req.body;

    const newQuestion = await prisma.tryout.create({
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
        subType
      }
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update question
router.put('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const updateData = req.body;

    const updatedQuestion = await prisma.tryout.update({
      where: { id: questionId },
      data: {
        ...updateData,
        tryoutListId: parseInt(updateData.tryoutListId),
        number: parseInt(updateData.number)
      }
    });

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete question
router.delete('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    await prisma.tryout.delete({
      where: { id: questionId }
    });

    res.json({ message: 'Soal berhasil dihapus' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 