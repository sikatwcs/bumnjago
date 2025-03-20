/**
 * Script untuk inisialisasi admin pertama.
 * 
 * Gunakan:
 * 1. Pastikan file .env berisi ADMIN_INIT_KEY
 * 2. npm run ts-node server/src/scripts/init-admin.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import readline from 'readline';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prisma = new PrismaClient();

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

const createAdmin = async () => {
  try {
    // Cek apakah sudah ada admin
    const adminCount = await prisma.admin.count();
    
    if (adminCount > 0) {
      console.log('Admin sudah diinisialisasi sebelumnya. Gunakan reset-admin untuk mereset.');
      return;
    }
    
    const name = await question('Nama Admin: ');
    const email = await question('Email Admin: ');
    const password = await question('Password Admin: ');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Buat admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    
    console.log(`Admin berhasil dibuat:\nID: ${admin.id}\nNama: ${admin.name}\nEmail: ${admin.email}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
};

createAdmin(); 