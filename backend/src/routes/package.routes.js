import express from 'express';
import {
  getPackages,
  getPackageById,
  getPackageBySlug,
  getPackageFeatures,
  createPackage,
  updatePackage,
  deletePackage,
  filterPackages
} from '../controllers/package.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all packages (public)
router.get('/', getPackages);

// Filter packages (public) - must come before POST /
router.post('/filter', filterPackages);

// Get package by slug (public) - must come before GET /:id
router.get('/slug/:slug', getPackageBySlug);

// Get package features (public) - must come before GET /:id
router.get('/:id/features', getPackageFeatures);

// Get package by ID (public)
router.get('/:id', getPackageById);

// Create package (admin only)
router.post('/', authenticate, requireAdmin, createPackage);

// Update package (admin only)
router.put('/:id', authenticate, requireAdmin, updatePackage);

// Delete package (admin only)
router.delete('/:id', authenticate, requireAdmin, deletePackage);

export default router;
