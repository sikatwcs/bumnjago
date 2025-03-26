import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Konfigurasi upload
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadUrl = process.env.UPLOAD_URL || 'http://157.66.34.226/uploads'; // Sesuaikan dengan IP VPS

// Pastikan direktori upload ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

// Konfigurasi upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  }
});

// Fungsi untuk menghapus file
export const deleteFile = (filename: string) => {
  const filepath = path.join(uploadDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

// Fungsi untuk mendapatkan URL file
export const getFileUrl = (filename: string) => {
  return `/uploads/${filename}`;
};

export const uploadFile = async (file: Express.Multer.File) => {
  try {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Tulis file ke disk
    await fs.promises.writeFile(filepath, file.buffer);

    // Return URL yang bisa diakses dari VPS
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