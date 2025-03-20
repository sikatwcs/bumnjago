import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createPayment, handlePaymentCallback, checkPaymentStatus } from '../utils/tripay';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Buat transaksi pembayaran
router.post('/create', async (req, res) => {
  try {
    const { tryoutId, method } = req.body;
    const payment = await prisma.payment.create({
      data: {
        tryoutId,
        method,
        status: 'PENDING'
      }
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Callback dari Tripay
router.post('/callback', async (req, res) => {
  try {
    const callback = req.body;
    await handlePaymentCallback(callback);
    res.json({ message: 'Callback berhasil diproses' });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memproses callback' });
  }
});

// Cek status pembayaran
router.get('/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const status = await checkPaymentStatus(reference);
    res.json({ data: status });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengecek status pembayaran' });
  }
});

// Export dengan cara yang benar
export default router; 