import { PrismaClient, Transaction, User, Profile, TryoutList } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface TripayConfig {
  apiKey: string;
  privateKey: string;
  merchantCode: string;
  isProduction: boolean;
}

const tripayConfig: TripayConfig = {
  apiKey: process.env.TRIPAY_API_KEY || '',
  privateKey: process.env.TRIPAY_PRIVATE_KEY || '',
  merchantCode: process.env.TRIPAY_MERCHANT_CODE || '',
  isProduction: process.env.TRIPAY_IS_PRODUCTION === 'true'
};

const tripayUrl = tripayConfig.isProduction 
  ? 'https://tripay.co.id/api' 
  : 'https://tripay.co.id/api-sandbox';

interface TransactionWithRelations extends Transaction {
  user: User & {
    profile: Profile | null;
  };
  tryoutList: TryoutList;
}

export const createPayment = async (transactionId: number) => {
  try {
    // Ambil data transaksi
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        tryoutList: true
      }
    }) as TransactionWithRelations | null;

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (!transaction.user.profile) {
      throw new Error('User profile not found');
    }

    // Parameter untuk Tripay
    const parameter = {
      method: 'BRIVA',
      merchant_ref: `ORDER-${transaction.id}`,
      amount: Number(transaction.amount),
      customer_name: transaction.user.profile.name,
      customer_email: transaction.user.email,
      customer_phone: transaction.user.profile.phone,
      order_items: [
        {
          name: transaction.tryoutList.title,
          price: Number(transaction.tryoutList.price),
          quantity: 1
        }
      ]
    };

    // Buat transaksi di Tripay
    const response = await axios.post(
      `${tripayUrl}/transaction/create`,
      parameter,
      {
        headers: {
          'Authorization': `Bearer ${tripayConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const tripayData = response.data.data;

    // Update transaksi dengan data Tripay
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentToken: tripayData.reference,
        paymentCode: tripayData.payment_code,
        paymentMethod: tripayData.method,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
      }
    });

    return {
      reference: tripayData.reference,
      paymentCode: tripayData.payment_code,
      paymentMethod: tripayData.method,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error;
  }
};

interface TripayCallback {
  reference: string;
  status: string;
  payment_method: string;
}

export const handlePaymentCallback = async (callback: TripayCallback) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { paymentToken: callback.reference },
      include: { payment: true }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update status transaksi
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: callback.status === 'PAID' ? 'success' : 'failed',
        paymentMethod: callback.payment_method
      }
    });

    // Jika pembayaran berhasil, update status payment dan buat ownership
    if (callback.status === 'PAID') {
      await prisma.payment.update({
        where: { transactionId: transaction.id },
        data: { status: 'success' }
      });

      await prisma.ownership.create({
        data: {
          userId: transaction.userId,
          tryoutListId: transaction.tryoutListId,
          isDone: false
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Payment callback error:', error);
    throw error;
  }
};

// Fungsi untuk cek status pembayaran
export const checkPaymentStatus = async (reference: string) => {
  try {
    const response = await axios.get(
      `${tripayUrl}/transaction/detail/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${tripayConfig.apiKey}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Payment status check error:', error);
    throw error;
  }
}; 