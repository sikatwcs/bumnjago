import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Fungsi utama untuk memeriksa status server
async function checkServerStatus() {
  console.log('=== SERVER CHECK ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${process.env.PORT || 3000}`);

  // Memeriksa JWT Secret
  checkJwtSecret();

  // Memeriksa koneksi database
  await checkDatabaseConnection();

  // Memeriksa admin
  await checkAdminExists();

  console.log('=== CHECK COMPLETE ===');
}

// Memeriksa JWT Secret
function checkJwtSecret() {
  console.log('\n--- JWT Secret Check ---');
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    console.error('This will cause authentication to fail');
  } else if (jwtSecret === 'your-secret-key' || jwtSecret === 'rahasia123') {
    console.warn('JWT_SECRET is using a default/weak value. Consider changing it for production.');
  } else {
    console.log('JWT_SECRET is properly configured');
  }
  
  // Coba buat token JWT untuk memastikan berfungsi
  try {
    const token = jwt.sign(
      { id: 1, email: 'test@example.com', role: 'admin' },
      jwtSecret || 'fallback-for-test',
      { expiresIn: '1h' }
    );
    console.log('JWT token generation: Success');
  } catch (error: any) {
    console.error('JWT token generation failed:', error.message);
  }
}

// Memeriksa koneksi database
async function checkDatabaseConnection() {
  console.log('\n--- Database Connection Check ---');
  try {
    await prisma.$connect();
    console.log('Database connection: Success');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database query test: Success');
  } catch (error: any) {
    console.error('Database connection failed:', error.message);
  }
}

// Memeriksa apakah ada admin di database
async function checkAdminExists() {
  console.log('\n--- Admin Check ---');
  try {
    const adminCount = await prisma.admin.count();
    console.log(`Found ${adminCount} admin accounts`);
    
    if (adminCount === 0) {
      console.warn('No admin accounts found. You may need to initialize an admin account.');
    } else {
      // Cek admin pertama (tanpa mengungkapkan data sensitif)
      const firstAdmin = await prisma.admin.findFirst({
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      });
      console.log('First admin account:', {
        id: firstAdmin?.id,
        email: firstAdmin?.email,
        createdAt: firstAdmin?.createdAt
      });
    }
  } catch (error: any) {
    console.error('Admin check failed:', error.message);
  }
}

// Jalankan pengecekan
checkServerStatus()
  .catch((error: any) => {
    console.error('Server check failed:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 