import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateQuestioner } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Enum untuk tipe test dan subtipe
enum TestType {
  TKD_BUMN = 'TKD_BUMN',
  AKHLAK_BUMN = 'AKHLAK_BUMN',
  TWK_BUMN = 'TWK_BUMN'
}

enum SubType {
  // TKD BUMN
  verbal_logical_reasoning = 'verbal_logical_reasoning',
  number_sequence = 'number_sequence',
  word_classification = 'word_classification',
  diagram_reasoning = 'diagram_reasoning',
  // AKHLAK BUMN
  penilaian_diri_akhlak = 'penilaian_diri_akhlak',
  // TWK BUMN
  wawasan_kebangsaan = 'wawasan_kebangsaan'
}

// Mapping valid subtypes untuk setiap test type
const VALID_SUBTYPES: Record<TestType, SubType[]> = {
  [TestType.TKD_BUMN]: [
    SubType.verbal_logical_reasoning,
    SubType.number_sequence,
    SubType.word_classification,
    SubType.diagram_reasoning
  ],
  [TestType.AKHLAK_BUMN]: [
    SubType.penilaian_diri_akhlak
  ],
  [TestType.TWK_BUMN]: [
    SubType.wawasan_kebangsaan
  ]
};

// Helper function untuk error handling
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

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
  } catch (error: unknown) {
    console.error('Questioner login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
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
  } catch (error: unknown) {
    console.error('Get questioner profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
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
  } catch (error: unknown) {
    console.error('Update questioner profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
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
  } catch (error: unknown) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
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
  } catch (error: unknown) {
    console.error('Create questioner error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
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
  } catch (error: unknown) {
    console.error('Error fetching tryouts:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
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
  } catch (error: unknown) {
    console.error('Error fetching tryout detail:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
  }
});

// Get all tryout lists for questioner
router.get('/tryoutlists', authenticateQuestioner, async (req, res) => {
  try {
    console.log('Fetching tryout lists for questioner:', req.user.id);
    
    const tryoutLists = await prisma.tryoutList.findMany({
      where: {
        // Tambahkan filter jika diperlukan
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found tryout lists:', tryoutLists.length);
    res.json(tryoutLists);
  } catch (error: unknown) {
    console.error('Get tryout lists error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
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
  } catch (error: unknown) {
    console.error('Error fetching tryout questions:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
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

    // Validasi tipe dan subtipe
    if (!Object.values(TestType).includes(type as TestType)) {
      return res.status(400).json({ message: 'Tipe test tidak valid' });
    }

    const testType = type as TestType;
    const validSubTypes = VALID_SUBTYPES[testType];
    
    if (!validSubTypes.includes(subType as SubType)) {
      return res.status(400).json({ message: 'Subtipe tidak valid untuk tipe test ini' });
    }

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
        type: testType,
        subType: subType as SubType,
        imageUrl
      }
    });

    res.status(201).json(newTryout);
  } catch (error: unknown) {
    console.error('Create question error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('tidak ditemukan') || 
          error.message.includes('sudah digunakan')) {
        return res.status(400).json({ message: error.message });
      }
    }

    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
  }
});

// Update tryout question
router.put('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutId = parseInt(req.params.id);
    const updateData = req.body;

    // Validasi tipe dan subtipe jika ada dalam updateData
    if (updateData.type) {
      const testType = updateData.type as TestType;
      if (!Object.values(TestType).includes(testType)) {
        return res.status(400).json({ message: 'Tipe test tidak valid' });
      }

      if (updateData.subType && !VALID_SUBTYPES[testType].includes(updateData.subType as SubType)) {
        return res.status(400).json({ message: 'Subtipe tidak valid untuk tipe test ini' });
      }
    }

    const updatedTryout = await prisma.tryout.update({
      where: { id: tryoutId },
      data: {
        ...updateData,
        tryoutListId: updateData.tryoutListId ? parseInt(updateData.tryoutListId) : undefined,
        number: updateData.number ? parseInt(updateData.number) : undefined,
        type: updateData.type as TestType | undefined,
        subType: updateData.subType as SubType | undefined
      }
    });

    res.json(updatedTryout);
  } catch (error: unknown) {
    console.error('Update question error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('tidak ditemukan') || 
          error.message.includes('sudah digunakan')) {
        return res.status(400).json({ message: error.message });
      }

      if ('code' in error && (error as any).code === 'P2025') {
        return res.status(404).json({ message: 'Soal tidak ditemukan' });
      }
    }

    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
  }
});

// Delete tryout question
router.delete('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutId = parseInt(req.params.id);
    await prisma.tryout.delete({
      where: { id: tryoutId }
    });

    res.json({ message: 'Soal berhasil dihapus' });
  } catch (error: unknown) {
    console.error('Delete question error:', error);
    
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }

    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? handleError(error) : undefined
    });
  }
});

export default router;
