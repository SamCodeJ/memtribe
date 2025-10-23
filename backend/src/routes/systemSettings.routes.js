import express from 'express';
import {
  getSettings,
  getSettingByKey,
  updateSetting,
  createSettings,
  updateSettingsById,
  getSettingsById
} from '../controllers/systemSettings.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all settings (returns array - could include multiple setting records)
router.get('/', authenticate, requireAdmin, getSettings);

// Create new settings object (admin only)
router.post('/', authenticate, requireAdmin, createSettings);

// Get/Update by ID (UUID) or key (string)
// Check if parameter is UUID-like (contains hyphens)
router.get('/:identifier', authenticate, requireAdmin, (req, res, next) => {
  console.log('GET settings identifier:', req.params.identifier);
  if (req.params.identifier.includes('-')) {
    // Treat as ID
    req.params.id = req.params.identifier;
    return getSettingsById(req, res, next);
  } else {
    // Treat as key
    req.params.key = req.params.identifier;
    return getSettingByKey(req, res, next);
  }
});

router.put('/:identifier', authenticate, requireAdmin, (req, res, next) => {
  console.log('PUT settings identifier:', req.params.identifier);
  console.log('PUT settings body:', req.body);
  if (req.params.identifier.includes('-')) {
    // Treat as ID
    req.params.id = req.params.identifier;
    return updateSettingsById(req, res, next);
  } else {
    // Treat as key
    req.params.key = req.params.identifier;
    return updateSetting(req, res, next);
  }
});

export default router;
