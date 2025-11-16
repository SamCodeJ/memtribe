import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import LoggerService from '../services/logger.service.js';

const prisma = new PrismaClient();

/**
 * Get system logs (Admin only)
 * GET /api/admin/logs
 */
export const getSystemLogs = asyncHandler(async (req, res) => {
  const {
    log_type,
    action,
    user_id,
    limit = 100,
    offset = 0,
    startDate,
    endDate
  } = req.query;

  const result = await LoggerService.getLogs({
    log_type,
    action,
    user_id,
    limit: parseInt(limit),
    offset: parseInt(offset),
    startDate,
    endDate
  });

  res.json(result);
});

/**
 * Get log statistics (Admin only)
 * GET /api/admin/logs/stats
 */
export const getLogStatistics = asyncHandler(async (req, res) => {
  const stats = await LoggerService.getStatistics();
  res.json(stats);
});

/**
 * Clear old logs (Admin only)
 * POST /api/admin/logs/clear
 */
export const clearOldLogs = asyncHandler(async (req, res) => {
  const { daysToKeep = 30 } = req.body;
  
  const deletedCount = await LoggerService.clearOldLogs(daysToKeep);
  
  res.json({
    success: true,
    message: `Cleared ${deletedCount} old logs`,
    deleted_count: deletedCount
  });
});

/**
 * Get all users with their subscription plans (Admin only)
 * GET /api/admin/users/subscriptions
 */
export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const {
    subscription_plan,
    search,
    limit = 50,
    offset = 0
  } = req.query;

  const where = {};

  // Filter by subscription plan
  if (subscription_plan) {
    where.subscription_plan = subscription_plan;
  }

  // Search by name or email
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { full_name: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        subscription_plan: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    users,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Get subscription statistics (Admin only)
 * GET /api/admin/subscriptions/stats
 */
export const getSubscriptionStatistics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    starterUsers,
    proUsers,
    businessUsers,
    enterpriseUsers,
    totalEvents,
    packages
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscription_plan: 'starter' } }),
    prisma.user.count({ where: { subscription_plan: 'pro' } }),
    prisma.user.count({ where: { subscription_plan: 'business' } }),
    prisma.user.count({ where: { subscription_plan: 'enterprise' } }),
    prisma.event.count(),
    prisma.package.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' }
    })
  ]);

  res.json({
    total_users: totalUsers,
    by_plan: {
      starter: starterUsers,
      pro: proUsers,
      business: businessUsers,
      enterprise: enterpriseUsers
    },
    total_events: totalEvents,
    available_packages: packages
  });
});

/**
 * Update user subscription plan (Admin only)
 * PUT /api/admin/users/:userId/subscription
 */
export const updateUserSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { subscription_plan } = req.body;

  // Validate subscription plan
  const validPlans = ['starter', 'pro', 'business', 'enterprise'];
  if (!validPlans.includes(subscription_plan)) {
    return res.status(400).json({
      error: 'Invalid subscription plan. Must be: starter, pro, business, or enterprise'
    });
  }

  // Update user subscription
  const user = await prisma.user.update({
    where: { id: userId },
    data: { subscription_plan }
  });

  // Log the change
  await LoggerService.info(
    'subscription_updated',
    `Admin updated user subscription to ${subscription_plan}`,
    {
      user_id: userId,
      user_email: user.email,
      metadata: { new_plan: subscription_plan }
    }
  );

  res.json({
    success: true,
    message: 'Subscription plan updated',
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      subscription_plan: user.subscription_plan
    }
  });
});

/**
 * Get system overview (Admin dashboard)
 * GET /api/admin/overview
 */
export const getSystemOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalEvents,
    totalRSVPs,
    totalMedia,
    recentLogs,
    subscriptionStats
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.rsvp.count(),
    prisma.media.count(),
    prisma.systemLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 5
    }),
    prisma.user.groupBy({
      by: ['subscription_plan'],
      _count: true
    })
  ]);

  res.json({
    total_users: totalUsers,
    total_events: totalEvents,
    total_rsvps: totalRSVPs,
    total_media: totalMedia,
    recent_logs: recentLogs,
    subscription_breakdown: subscriptionStats
  });
});

