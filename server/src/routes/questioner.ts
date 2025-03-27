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

    console.log('Login attempt for questioner:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email dan password harus diisi' 
      });
    }

    // Cek jika questioner ada
    const questioner = await prisma.questioner.findUnique({
      where: { email }
    });

    if (!questioner) {
      console.log('Questioner not found:', email);
      return res.status(404).json({ 
        success: false,
        message: 'Email atau password salah' 
      });
    }

    // Verifikasi password
    const validPassword = await bcrypt.compare(password, questioner.password);
    if (!validPassword) {
      console.log('Invalid password for questioner:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Email atau password salah' 
      });
    }

    // Buat token JWT
    const token = jwt.sign(
      { 
        id: questioner.id, 
        email: questioner.email, 
        role: 'questioner',
        name: questioner.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for questioner:', email);

    // Kirim response dengan format yang konsisten
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: questioner.id,
          name: questioner.name,
          email: questioner.email,
          role: 'questioner'
        }
      }
    });
  } catch (error: unknown) {
    console.error('Questioner login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan server',
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

// Get all tryout lists
router.get('/tryoutlists', authenticateQuestioner, async (req, res) => {
  try {
    console.log('Fetching tryout lists for questioner:', req.user?.id);

    // Pastikan user terautentikasi
    if (!req.user?.id) {
      return res.status(401).json({ 
        message: 'Unauthorized access'
      });
    }

    // Ambil data dari database dengan error handling yang lebih baik
    const tryoutLists = await prisma.tryoutList.findMany({
      where: {
        status: true // Hanya ambil yang aktif
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        batch: true,
        type: true,
        status: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true
      }
    }).catch(error => {
      console.error('Database error:', error);
      throw new Error('Failed to fetch tryout lists from database');
    });
    
    // Konversi BigInt price ke string dengan error handling
    const response = tryoutLists.map(tryout => {
      try {
        return {
          ...tryout,
          price: tryout.price.toString()
        };
      } catch (error) {
        console.error('Error converting price for tryout:', tryout.id, error);
        return {
          ...tryout,
          price: '0' // Fallback jika ada error konversi
        };
      }
    });
    
    console.log('Successfully fetched tryout lists:', response.length);
    res.json(response);
  } catch (error) {
    console.error('Error in /tryoutlists endpoint:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get tryouts by tryout list ID
router.get('/tryouts/:tryoutListId', authenticateQuestioner, async (req, res) => {
  try {
    const tryoutListId = parseInt(req.params.tryoutListId);
    
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
    console.error('Error fetching tryouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new tryout question
router.post('/tryouts', authenticateQuestioner, async (req, res) => {
  try {
    const {
      tryoutListId,
      number,
      question,
      explanation,
      imageUrl,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer,
      type,
      subType
    } = req.body;

    const newTryout = await prisma.tryout.create({
      data: {
        tryoutListId: parseInt(tryoutListId),
        number: parseInt(number),
        question,
        explanation,
        imageUrl,
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

    res.status(201).json(newTryout);
  } catch (error) {
    console.error('Error creating tryout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tryout question
router.put('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      question,
      explanation,
      imageUrl,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer,
      type,
      subType
    } = req.body;

    const updatedTryout = await prisma.tryout.update({
      where: { id },
      data: {
        question,
        explanation,
        imageUrl,
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

    res.json(updatedTryout);
  } catch (error) {
    console.error('Error updating tryout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tryout question
router.delete('/tryouts/:id', authenticateQuestioner, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.tryout.delete({
      where: { id }
    });
    
    res.json({ message: 'Tryout deleted successfully' });
  } catch (error) {
    console.error('Error deleting tryout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
