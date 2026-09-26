import multer from 'multer';
import path from 'path';
import { getStorageDir, generateStorageKey } from '../services/storageService.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getStorageDir());
  },
  filename: (req, file, cb) => {
    const key = generateStorageKey(file.originalname);
    cb(null, key);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const dangerousExts = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs', '.php', '.phtml', '.html', '.js'];

  if (dangerousExts.includes(ext)) {
    return cb(new Error('This file extension is blocked for security reasons.'), false);
  }

  // Check MIME type or allowed extension
  const isAllowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.pdf'].includes(ext);
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error('This file type is not currently supported. ProofPath supports JPG, PNG, HEIC, and PDF.'), false);
  }
};

export const uploadEvidenceMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
    files: 1,
  },
  fileFilter,
});
