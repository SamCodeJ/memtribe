import express from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser, refreshToken, updateCurrentUser, getAllUsers, updateUser } from '../controllers/auth.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required')
  ],
  validate,
  register
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

// Get current user
router.get('/me', authenticate, getCurrentUser);

// Update current user
router.put('/me', authenticate, updateCurrentUser);

// Get all users (admin only)
router.get('/users', authenticate, requireAdmin, getAllUsers);

// Update user by ID (admin only)
router.put('/users/:id', authenticate, requireAdmin, updateUser);

// Refresh token
router.post('/refresh', refreshToken);

export default router;
