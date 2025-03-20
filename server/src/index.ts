// src/utils/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import questionerRouter from './routes/questioner';
import paymentRouter from './routes/payments';
import adminTryoutRouter from './routes/admin-tryout';

// Initialize
dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Cek apakah database tersedia
const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Tambahkan middleware CORS dengan konfigurasi yang lebih lengkap
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://157.66.34.226', 
    'http://157.66.34.226:3000',
    'https://your-app.vercel.app' // Sesuaikan dengan domain Vercel Anda
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 jam (dalam detik)
}));

// Middleware untuk request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin-tryout', adminTryoutRouter);
app.use('/api/questioner', questionerRouter);
app.use('/api/payments', paymentRouter);

// Root route untuk pengecekan server
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blue Sky CBT API Server',
    status: 'Running',
    version: '1.0.0'
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`CORS enabled for: ${['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://157.66.34.226', 'http://157.66.34.226:3000', 'https://your-app.vercel.app'].join(', ')}`);
  
  // Cek koneksi database
  const dbConnected = await checkDatabaseConnection();
  if (dbConnected) {
    console.log('✅ Database terhubung!');
  } else {
    console.log('❌ Database tidak terhubung!');
    console.log('💡 MODE TESTING aktif. Menggunakan data mock untuk testing:');
    console.log('   ├─ Email: test@example.com');
    console.log('   └─ Password: password123');
  }
  
  console.log('\n📝 REST API Tersedia:');
  console.log('   ├─ POST /api/auth/login - Login user');
  console.log('   ├─ POST /api/auth/register - Register user baru');
  console.log('   └─ GET /api/auth/me - Mendapatkan informasi user');
});

// Handle shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880')
  }
});

export const getFileUrl = (filename: string) => {
  return `${process.env.UPLOAD_URL}/${filename}`;
};