import express from 'express';
import {
  createMedia,
  getMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  filterMedia
} from '../controllers/media.controller.js';
import { optionalAuth, authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all media
router.get('/', optionalAuth, getMedia);

// Filter media (POST for complex queries)
router.post('/filter', optionalAuth, filterMedia);

// Get media by ID
router.get('/:id', optionalAuth, getMediaById);

// Create media (public - no auth required)
router.post('/', createMedia);

// Update media (requires auth)
router.put('/:id', authenticate, updateMedia);

// Delete media (requires auth)
router.delete('/:id', authenticate, deleteMedia);

export default router;

