import express from 'express';
import {
  getPackageFeatures,
  getPackageFeatureById,
  createPackageFeature,
  updatePackageFeature,
  deletePackageFeature
} from '../controllers/packageFeature.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all package features (public)
router.get('/', getPackageFeatures);

// Get package feature by ID (public)
router.get('/:id', getPackageFeatureById);

// Create package feature (admin only)
router.post('/', authenticate, requireAdmin, createPackageFeature);

// Update package feature (admin only)
router.put('/:id', authenticate, requireAdmin, updatePackageFeature);

// Delete package feature (admin only)
router.delete('/:id', authenticate, requireAdmin, deletePackageFeature);

export default router;

