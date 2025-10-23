import express from 'express';
import {
  getFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  filterFeatures
} from '../controllers/feature.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all features (public)
router.get('/', getFeatures);

// Filter features (public) - must come before POST /
router.post('/filter', filterFeatures);

// Get feature by ID (public)
router.get('/:id', getFeatureById);

// Create feature (admin only)
router.post('/', authenticate, requireAdmin, createFeature);

// Update feature (admin only)
router.put('/:id', authenticate, requireAdmin, updateFeature);

// Delete feature (admin only)
router.delete('/:id', authenticate, requireAdmin, deleteFeature);

export default router;
