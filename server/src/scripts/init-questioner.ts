/**
 * Script untuk inisialisasi questioner pertama.
 * 
 * Gunakan:
 * 1. Pastikan file .env berisi QUESTIONER_INIT_KEY
 * 2. npm run ts-node server/src/scripts/init-questioner.ts
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

const createQuestioner = async () => {
  try {
    // Cek apakah sudah ada questioner
    const questionerCount = await prisma.questioner.count();
    
    if (questionerCount > 0) {
      console.log('Questioner sudah diinisialisasi sebelumnya. Gunakan reset-questioner untuk mereset.');
      return;
    }
    
    const name = await question('Nama Questioner: ');
    const email = await question('Email Questioner: ');
    const password = await question('Password Questioner: ');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Buat questioner
    const questioner = await prisma.questioner.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    
    console.log(`Questioner berhasil dibuat:\nID: ${questioner.id}\nNama: ${questioner.name}\nEmail: ${questioner.email}`);
  } catch (error) {
    console.error('Error creating questioner:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
};

createQuestioner(); 