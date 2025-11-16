import express from 'express';
import {
  getSystemLogs,
  getLogStatistics,
  clearOldLogs,
  getUserSubscriptions,
  getSubscriptionStatistics,
  updateUserSubscription,
  getSystemOverview,
  getMonthlyRevenue,
  getFinancialStats,
  getSubscriptionActivity
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// System Logs Routes
router.get('/logs', getSystemLogs);
router.get('/logs/stats', getLogStatistics);
router.post('/logs/clear', clearOldLogs);

// User Subscription Routes
router.get('/users/subscriptions', getUserSubscriptions);
router.get('/subscriptions/stats', getSubscriptionStatistics);
router.put('/users/:userId/subscription', updateUserSubscription);

// Finance Routes
router.get('/finance/monthly-revenue', getMonthlyRevenue);
router.get('/finance/stats', getFinancialStats);
router.get('/finance/activity', getSubscriptionActivity);

// System Overview
router.get('/overview', getSystemOverview);

export default router;

