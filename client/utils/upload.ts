import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  }
});

// Fungsi untuk menghapus file
export const deleteFile = (filename: string) => {
  const filepath = path.join('uploads', filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

// Fungsi untuk mendapatkan URL file
export const getFileUrl = (filename: string) => {
  return `${process.env.UPLOAD_URL}/${filename}`;
};