import express from 'express';
import { body } from 'express-validator';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  filterEvents
} from '../controllers/event.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all events (with optional filtering)
router.get('/', optionalAuth, getEvents);

// Filter events (POST for complex queries)
router.post('/filter', optionalAuth, filterEvents);

// Get event by ID
router.get('/:id', optionalAuth, getEventById);

// Create event (requires auth)
router.post('/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('start_date').isISO8601().withMessage('Valid start date is required'),
    body('location').trim().notEmpty().withMessage('Location is required')
  ],
  validate,
  createEvent
);

// Update event (requires auth)
router.put('/:id', authenticate, updateEvent);

// Delete event (requires auth)
router.delete('/:id', authenticate, deleteEvent);

export default router;

