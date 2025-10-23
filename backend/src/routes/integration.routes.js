import express from 'express';
import multer from 'multer';
import {
  uploadFile,
  generateImage,
  sendEmail
} from '../controllers/integration.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads (use memory storage for S3/local)
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory buffer
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Upload file to S3
router.post('/upload-file', optionalAuth, upload.single('file'), uploadFile);

// Generate AI image
router.post('/generate-image', optionalAuth, generateImage);

// Send email
router.post('/send-email', optionalAuth, sendEmail);

export default router;

