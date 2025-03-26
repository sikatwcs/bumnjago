import express from 'express';
import { PrismaClient, TestType, SubType } from '@prisma/client';
import { authenticateAdmin } from '../middleware/auth';
import { uploadFile } from '../utils/upload';
import multer from 'multer';

const router = express.Router();
const prisma = new PrismaClient();

// Konfigurasi multer untuk menyimpan file di memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Hanya terima gambar
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan'));
    }
  }
});

// Get all tryout lists (untuk admin dan questioner)
router.get('/tryoutlists', authenticateAdmin, async (req, res) => {
  try {
    console.log('Mencoba mengambil tryout lists...');

    // Ambil semua tryout list
    const tryoutLists = await prisma.tryoutList.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('Tryout lists yang ditemukan:', tryoutLists);

    // Konversi BigInt price ke string untuk setiap tryout list
    const response = tryoutLists.map(tryout => ({
      ...tryout,
      price: tryout.price.toString()
    }));
    console.log('Response yang akan dikirim:', response);
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching tryout lists:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get tryout list by ID
router.get('/tryoutlists/:id', authenticateAdmin, async (req, res) => {
  try {
    const tryoutListId = parseInt(req.params.id);
    
    const tryoutList = await prisma.tryoutList.findUnique({
      where: { id: tryoutListId }
    });
    
    if (!tryoutList) {
      return res.status(404).json({ message: 'Tryout list tidak ditemukan' });
    }
    
    // Konversi BigInt price ke string
    const response = {
      ...tryoutList,
      price: tryoutList.price.toString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching tryout list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tryout list
router.post('/tryoutlists', authenticateAdmin, async (req, res) => {
  try {
    const { title, price, description, batch, type, status, isOnline, imageUrl } = req.body;
    
    // Validate input
    if (!title || price === undefined || batch === undefined || !type) {
      return res.status(400).json({ message: 'Field wajib: title, price, batch, type' });
    }
    
    const newTryoutList = await prisma.tryoutList.create({
      data: {
        title,
        price: BigInt(price),
        description,
        batch,
        type,
        status: status !== undefined ? status : true,
        isOnline: isOnline !== undefined ? isOnline : true,
        imageUrl
      }
    });
    
    // Convert BigInt to string for JSON
    const response = {
      ...newTryoutList,
      price: newTryoutList.price.toString()
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating tryout list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tryout list
router.put('/tryoutlists/:id', authenticateAdmin, async (req, res) => {
  try {
    const tryoutListId = parseInt(req.params.id);
    const { title, price, description, batch, type, status, isOnline, imageUrl } = req.body;
    
    // Check if tryout list exists
    const existingTryout = await prisma.tryoutList.findUnique({
      where: { id: tryoutListId }
    });
    
    if (!existingTryout) {
      return res.status(404).json({ message: 'Tryout list tidak ditemukan' });
    }
    
    // Update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = BigInt(price);
    if (description !== undefined) updateData.description = description;
    if (batch !== undefined) updateData.batch = batch;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    const updatedTryoutList = await prisma.tryoutList.update({
      where: { id: tryoutListId },
      data: updateData
    });
    
    // Convert BigInt to string for JSON
    const response = {
      ...updatedTryoutList,
      price: updatedTryoutList.price.toString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating tryout list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tryout list
router.delete('/tryoutlists/:id', authenticateAdmin, async (req, res) => {
  try {
    const tryoutListId = parseInt(req.params.id);
    
    // Check if tryout list exists
    const existingTryout = await prisma.tryoutList.findUnique({
      where: { id: tryoutListId }
    });
    
    if (!existingTryout) {
      return res.status(404).json({ message: 'Tryout list tidak ditemukan' });
    }
    
    // Delete related tryouts, scores, etc. first (cascade should handle this)
    await prisma.tryoutList.delete({
      where: { id: tryoutListId }
    });
    
    res.json({ message: 'Tryout list berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting tryout list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// TRYOUT QUESTIONS ENDPOINTS

// Get all questions for a tryout list
router.get('/tryouts/:tryoutListId', authenticateAdmin, async (req, res) => {
  try {
    const tryoutListId = parseInt(req.params.tryoutListId);
    
    const tryouts = await prisma.tryout.findMany({
      where: { tryoutListId },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(tryouts);
  } catch (error) {
    console.error('Error fetching tryout questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tryout question by ID
router.get('/tryouts/question/:id', authenticateAdmin, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    
    const question = await prisma.tryout.findUnique({
      where: { id: questionId }
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error fetching tryout question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tryout question
router.post('/tryouts', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const {
      tryoutListId,
      type,
      subType,
      question,
      explanation,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer
    } = req.body;

    // Upload gambar jika ada
    let imageUrl = null;
    if (req.file) {
      try {
        const uploadResult = await uploadFile(req.file);
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        return res.status(500).json({ message: 'Gagal mengupload gambar' });
      }
    }
    
    // Check if tryout list exists
    const tryoutList = await prisma.tryoutList.findUnique({
      where: { id: parseInt(tryoutListId) }
    });
    
    if (!tryoutList) {
      return res.status(404).json({ message: 'Tryout list tidak ditemukan' });
    }

    // Get the latest question number for this tryout list
    const latestQuestion = await prisma.tryout.findFirst({
      where: { tryoutListId: parseInt(tryoutListId) },
      orderBy: [{ number: 'desc' }]
    });

    const nextNumber = latestQuestion ? latestQuestion.number + 1 : 1;
    
    const newQuestion = await prisma.tryout.create({
      data: {
        tryoutListId: parseInt(tryoutListId),
        type: type as TestType,
        subType: subType as SubType,
        number: nextNumber,
        question,
        explanation: explanation || '',
        optionA,
        optionB,
        optionC,
        optionD,
        optionE,
        correctAnswer,
        imageUrl
      }
    });

    res.json(newQuestion);
  } catch (error) {
    console.error('Error creating tryout question:', error);
    res.status(500).json({ message: 'Gagal membuat soal tryout' });
  }
});

// Update tryout question
router.put('/tryouts/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const {
      type,
      subType,
      question,
      explanation,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer
    } = req.body;
    
    // Check if question exists
    const existingQuestion = await prisma.tryout.findUnique({
      where: { id: questionId }
    });
    
    if (!existingQuestion) {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }

    // Upload gambar jika ada
    let imageUrl = existingQuestion.imageUrl;
    if (req.file) {
      try {
        const uploadResult = await uploadFile(req.file);
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        return res.status(500).json({ message: 'Gagal mengupload gambar' });
      }
    }
    
    // Update data
    const updateData = {
      type: type as TestType,
      subType: subType as SubType,
      question,
      explanation,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer,
      imageUrl
    };
    
    const updatedQuestion = await prisma.tryout.update({
      where: { id: questionId },
      data: updateData
    });
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating tryout question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tryout question
router.delete('/tryouts/:id', authenticateAdmin, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    
    // Check if question exists
    const existingQuestion = await prisma.tryout.findUnique({
      where: { id: questionId }
    });
    
    if (!existingQuestion) {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }
    
    await prisma.tryout.delete({
      where: { id: questionId }
    });
    
    res.json({ message: 'Soal berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting tryout question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tryout questions by tryout list ID
router.get('/tryouts/:tryoutListId/questions', authenticateAdmin, async (req, res) => {
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
    console.error('Error fetching tryout questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 