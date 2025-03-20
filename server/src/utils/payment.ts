import midtransClient from 'midtrans-client';
import { PrismaClient, Transaction, User, Profile, TryoutList } from '@prisma/client';

const prisma = new PrismaClient();

// Inisialisasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

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

    // Parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: `ORDER-${transaction.id}`,
        gross_amount: Number(transaction.amount)
      },
      customer_details: {
        first_name: transaction.user.profile.name,
        email: transaction.user.email,
        phone: transaction.user.profile.phone
      },
      item_details: [
        {
          id: transaction.tryoutList.id.toString(),
          price: Number(transaction.tryoutList.price),
          quantity: 1,
          name: transaction.tryoutList.title
        }
      ]
    };

    // Buat transaksi di Midtrans
    const token = await snap.createTransaction(parameter);

    // Update transaksi dengan token
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentToken: token,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
      }
    });

    return token;
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error;
  }
};

interface MidtransNotification {
  order_id: string;
  transaction_status: string;
  payment_type: string;
}

export const handlePaymentNotification = async (notification: any) => {
  try {
    const statusResponse = await snap.transaction.notification(notification) as MidtransNotification;
    const orderId = statusResponse.order_id;
    const transactionId = parseInt(orderId.split('-')[1]);

    // Update status transaksi
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: statusResponse.transaction_status === 'settlement' ? 'success' : 'failed',
        paymentMethod: statusResponse.payment_type
      }
    });

    // Jika pembayaran berhasil, update status payment dan buat ownership
    if (statusResponse.transaction_status === 'settlement') {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { payment: true }
      });

      if (transaction) {
        await prisma.payment.update({
          where: { transactionId },
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
    }

    return statusResponse;
  } catch (error) {
    console.error('Payment notification error:', error);
    throw error;
  }
}; 