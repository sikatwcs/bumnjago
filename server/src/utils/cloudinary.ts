import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadUrl = process.env.UPLOAD_URL || 'http://localhost:3000/uploads';

// Pastikan direktori upload ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadFile = async (file: Express.Multer.File) => {
  try {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Tulis file ke disk
    await fs.promises.writeFile(filepath, file.buffer);

    // Return URL yang bisa diakses
    const fileUrl = `${uploadUrl}/${filename}`;
    
    return {
      url: fileUrl,
      path: filepath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}; 