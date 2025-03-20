import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

// Export individual models for easier access
export const { user, profile, tryoutList, tryout, ownership, answer, score } = db; 