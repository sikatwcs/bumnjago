import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRouter from './routes/auth';
import paymentRouter from './routes/payments';
import questionerRouter from './routes/questioner';
import adminTryoutRouter from './routes/admin-tryout';
import adminRouter from './routes/admin';
import tryoutRouter from './routes/tryout';

const app = express();
const prisma = new PrismaClient();

// Daftar domain yang diizinkan
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://blue-sky-cbt.vercel.app'
];

// Middleware untuk menangani preflight requests (OPTIONS)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Periksa apakah origin ada dalam daftar yang diizinkan
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Kirim response OK untuk preflight
  res.status(200).end();
});

// Konfigurasi CORS
app.use(cors({
  origin: function(origin, callback) {
    // Izinkan jika origin ada dalam daftar atau jika tidak ada origin (misalnya, permintaan lokal)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));

// Tambahkan middleware untuk headers CORS tambahan
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Konfigurasi cookie
app.use((req, res, next) => {
  res.cookie('options', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  });
  next();
});

// Pastikan folder uploads ada
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/questioner', questionerRouter);
app.use('/api/admin-tryout', adminTryoutRouter);
app.use('/api/admin', adminRouter);
app.use('/api/tryout', tryoutRouter);

// Root route untuk pengecekan server
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'Blue Sky CBT API Server',
    status: 'Running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    // Cek koneksi database
    let dbStatus = 'Ok';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error: any) {
      dbStatus = 'Error: ' + (error.message || 'Unknown database error');
    }
    
    res.json({
      server: {
        status: 'Running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime() + ' seconds'
      },
      database: {
        status: dbStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ 
      status: 'error',
      message: 'API endpoint not found' 
    });
  }
  res.status(404).json({ message: 'Not found' });
});

export default app; 