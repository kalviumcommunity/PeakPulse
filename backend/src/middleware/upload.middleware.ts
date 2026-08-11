import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { CSV_CONFIG } from '../config/csv.config.js';
import { ensureUploadDir, sanitizeFilename } from '../utils/csv.utils.js';

// Ensure upload directory exists
ensureUploadDir(CSV_CONFIG.uploadDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CSV_CONFIG.uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = sanitizeFilename(file.originalname);
    const filename = `${timestamp}-${sanitized}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.csv') {
    return cb(new Error('Only CSV files are allowed'));
  }

  // Check mimetype
  if (!CSV_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }

  cb(null, true);
};

// Configure multer
export const uploadCSV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: CSV_CONFIG.maxFileSize,
    files: 1
  }
});
