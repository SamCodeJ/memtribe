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

/**
 * Get monthly revenue report (Admin only)
 * GET /api/admin/finance/monthly-revenue
 */
export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  
  // Default to current month if not specified
  const targetDate = new Date();
  const targetYear = year ? parseInt(year) : targetDate.getFullYear();
  const targetMonth = month ? parseInt(month) : targetDate.getMonth() + 1;
  
  // Calculate start and end of month
  const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

  // Get all active subscriptions during this month
  const activeSubscriptions = await prisma.user.findMany({
    where: {
      OR: [
        {
          // Users who had active subscription during the month
          subscription_status: 'active',
          subscription_start: {
            lte: endOfMonth
          },
          OR: [
            { subscription_end: null },
            { subscription_end: { gte: startOfMonth } }
          ]
        },
        {
          // Users who made payment in this month
          last_payment_date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      ]
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      subscription_plan: true,
      subscription_status: true,
      last_payment_date: true,
      created_at: true
    }
  });

  // Get package pricing
  const packages = await prisma.package.findMany({
    where: { is_active: true }
  });

  // Create price map
  const priceMap = {};
  packages.forEach(pkg => {
    priceMap[pkg.package_slug] = {
      monthly: parseFloat(pkg.monthly_price),
      yearly: parseFloat(pkg.yearly_price),
      billing_cycle: pkg.billing_cycle
    };
  });

  // Calculate revenue by plan
  const revenueByPlan = {};
  let totalRevenue = 0;

  activeSubscriptions.forEach(user => {
    const plan = user.subscription_plan;
    const pricing = priceMap[plan];
    
    if (pricing) {
      const monthlyRevenue = pricing.monthly || 0;
      
      if (!revenueByPlan[plan]) {
        revenueByPlan[plan] = {
          users: 0,
          revenue: 0,
          price: monthlyRevenue
        };
      }
      
      revenueByPlan[plan].users += 1;
      revenueByPlan[plan].revenue += monthlyRevenue;
      totalRevenue += monthlyRevenue;
    }
  });

  res.json({
    year: targetYear,
    month: targetMonth,
    month_name: new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' }),
    total_revenue: totalRevenue,
    total_active_subscriptions: activeSubscriptions.length,
    revenue_by_plan: revenueByPlan,
    active_users: activeSubscriptions
  });
});

/**
 * Get financial statistics (Admin only)
 * GET /api/admin/finance/stats
 */
export const getFinancialStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Get packages
  const packages = await prisma.package.findMany({
    where: { is_active: true }
  });

  const priceMap = {};
  packages.forEach(pkg => {
    priceMap[pkg.package_slug] = parseFloat(pkg.monthly_price);
  });

  // Get all active users
  const activeUsers = await prisma.user.findMany({
    where: {
      subscription_status: 'active'
    },
    select: {
      subscription_plan: true,
      subscription_start: true,
      last_payment_date: true
    }
  });

  // Calculate current MRR (Monthly Recurring Revenue)
  let currentMRR = 0;
  const planBreakdown = {};

  activeUsers.forEach(user => {
    const plan = user.subscription_plan;
    const price = priceMap[plan] || 0;
    
    currentMRR += price;
    
    if (!planBreakdown[plan]) {
      planBreakdown[plan] = { count: 0, revenue: 0 };
    }
    planBreakdown[plan].count += 1;
    planBreakdown[plan].revenue += price;
  });

  // Get last 6 months revenue data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    
    const monthUsers = await prisma.user.count({
      where: {
        subscription_status: 'active',
        subscription_start: { lte: endOfMonth },
        OR: [
          { subscription_end: null },
          { subscription_end: { gte: startOfMonth } }
        ]
      }
    });
    
    monthlyData.push({
      year,
      month,
      month_name: date.toLocaleString('default', { month: 'short' }),
      active_users: monthUsers,
      estimated_revenue: monthUsers * (currentMRR / activeUsers.length || 0)
    });
  }

  // Get total users and revenue projections
  const totalUsers = await prisma.user.count();
  const annualProjection = currentMRR * 12;

  res.json({
    current_mrr: currentMRR,
    annual_projection: annualProjection,
    total_active_subscriptions: activeUsers.length,
    total_users: totalUsers,
    plan_breakdown: planBreakdown,
    monthly_trend: monthlyData,
    packages: packages.map(pkg => ({
      slug: pkg.package_slug,
      name: pkg.package_name,
      monthly_price: parseFloat(pkg.monthly_price),
      yearly_price: parseFloat(pkg.yearly_price)
    }))
  });
});

/**
 * Get subscription activity/changes (Admin only)
 * GET /api/admin/finance/activity
 */
export const getSubscriptionActivity = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, year, month } = req.query;

  let dateFilter = {};
  if (year && month) {
    const startOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
    const endOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));
    dateFilter = {
      created_at: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    };
  }

  // Get subscription change logs
  const activities = await prisma.systemLog.findMany({
    where: {
      action: {
        in: ['user_registered', 'subscription_updated', 'user_login']
      },
      ...dateFilter
    },
    orderBy: { created_at: 'desc' },
    take: parseInt(limit),
    skip: parseInt(offset)
  });

  const total = await prisma.systemLog.count({
    where: {
      action: {
        in: ['user_registered', 'subscription_updated']
      },
      ...dateFilter
    }
  });

  res.json({
    activities,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

