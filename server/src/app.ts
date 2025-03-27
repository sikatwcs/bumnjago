import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

// Import routes
import authRouter from './routes/auth';
import paymentRouter from './routes/payments';
import questionerRouter from './routes/questioner';
import adminTryoutRouter from './routes/admin-tryout';
import adminRouter from './routes/admin';
import tryoutRouter from './routes/tryout';

const app = express();

// Konfigurasi CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://bumnjagos.vercel.app', 'https://jagobumn.com', 'https://www.jagobumn.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
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

// Serve static files from uploads directory
app.use('/uploads', express.static('/var/www/uploads'));

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
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