import express from 'express';
import { body } from 'express-validator';
import {
  createRSVP,
  getRSVPs,
  getRSVPById,
  updateRSVP,
  deleteRSVP,
  filterRSVPs
} from '../controllers/rsvp.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all RSVPs
router.get('/', optionalAuth, getRSVPs);

// Filter RSVPs (POST for complex queries)
router.post('/filter', optionalAuth, filterRSVPs);

// Get RSVP by ID
router.get('/:id', optionalAuth, getRSVPById);

// Create RSVP (no auth required - public endpoint)
router.post('/',
  [
    body('event_id').notEmpty().withMessage('Event ID is required'),
    body('guest_name').trim().notEmpty().withMessage('Guest name is required'),
    body('guest_email').isEmail().normalizeEmail().withMessage('Valid email is required')
  ],
  validate,
  createRSVP
);

// Update RSVP
router.put('/:id', updateRSVP);

// Delete RSVP
router.delete('/:id', deleteRSVP);

export default router;

