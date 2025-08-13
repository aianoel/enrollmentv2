import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'general';
    
    // Organize files by type
    if (req.path.includes('/modules')) {
      subDir = 'modules';
    } else if (req.path.includes('/assignments')) {
      subDir = 'assignments';
    } else if (req.path.includes('/enrollment')) {
      subDir = 'enrollment';
    } else if (req.path.includes('/profile')) {
      subDir = 'profiles';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for security
const fileFilter = (req: any, file: any, cb: any) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'video/mp4',
    'video/avi',
    'video/quicktime'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5, // Max 5 files per request
  }
});

// Helper to get file URL
export function getFileUrl(filePath: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
}

// Helper to delete file
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Validate file metadata
export interface FileValidation {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}

export function validateFile(file: any, validation: FileValidation = {}): string | null {
  const { maxSize = 50 * 1024 * 1024, allowedTypes, required = false } = validation;

  if (!file) {
    return required ? 'File is required' : null;
  }

  if (file.size > maxSize) {
    return `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`;
  }

  if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
    return `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }

  return null;
}