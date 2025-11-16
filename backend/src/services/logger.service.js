import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Log system events to database for admin monitoring
 */
export class LoggerService {
  /**
   * Create a system log entry
   * @param {Object} logData - Log data
   * @param {string} logData.log_type - info, warning, error, success
   * @param {string} logData.action - Action type (login, register, etc.)
   * @param {string} logData.message - Log message
   * @param {string} logData.user_id - Optional user ID
   * @param {string} logData.user_email - Optional user email
   * @param {string} logData.ip_address - Optional IP address
   * @param {string} logData.user_agent - Optional user agent
   * @param {Object} logData.metadata - Optional additional JSON data
   */
  static async log({
    log_type,
    action,
    message,
    user_id = null,
    user_email = null,
    ip_address = null,
    user_agent = null,
    metadata = null
  }) {
    try {
      await prisma.systemLog.create({
        data: {
          log_type,
          action,
          message,
          user_id,
          user_email,
          ip_address,
          user_agent,
          metadata
        }
      });
      console.log(`📝 [${log_type.toUpperCase()}] ${action}: ${message}`);
    } catch (error) {
      // If logging fails, don't break the application
      console.error('❌ Failed to create system log:', error.message);
    }
  }

  /**
   * Log info message
   */
  static async info(action, message, data = {}) {
    await this.log({ log_type: 'info', action, message, ...data });
  }

  /**
   * Log success message
   */
  static async success(action, message, data = {}) {
    await this.log({ log_type: 'success', action, message, ...data });
  }

  /**
   * Log warning message
   */
  static async warning(action, message, data = {}) {
    await this.log({ log_type: 'warning', action, message, ...data });
  }

  /**
   * Log error message
   */
  static async error(action, message, data = {}) {
    await this.log({ log_type: 'error', action, message, ...data });
  }

  /**
   * Get system logs with filtering and pagination
   */
  static async getLogs({
    log_type = null,
    action = null,
    user_id = null,
    limit = 100,
    offset = 0,
    startDate = null,
    endDate = null
  }) {
    const where = {};

    if (log_type) where.log_type = log_type;
    if (action) where.action = action;
    if (user_id) where.user_id = user_id;
    
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.systemLog.count({ where })
    ]);

    return {
      logs,
      total,
      limit,
      offset
    };
  }

  /**
   * Get log statistics
   */
  static async getStatistics() {
    const [
      totalLogs,
      errorCount,
      warningCount,
      infoCount,
      successCount,
      recentLogs
    ] = await Promise.all([
      prisma.systemLog.count(),
      prisma.systemLog.count({ where: { log_type: 'error' } }),
      prisma.systemLog.count({ where: { log_type: 'warning' } }),
      prisma.systemLog.count({ where: { log_type: 'info' } }),
      prisma.systemLog.count({ where: { log_type: 'success' } }),
      prisma.systemLog.findMany({
        orderBy: { created_at: 'desc' },
        take: 10
      })
    ]);

    return {
      total: totalLogs,
      by_type: {
        error: errorCount,
        warning: warningCount,
        info: infoCount,
        success: successCount
      },
      recent_logs: recentLogs
    };
  }

  /**
   * Clear old logs (older than specified days)
   */
  static async clearOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.systemLog.deleteMany({
      where: {
        created_at: {
          lt: cutoffDate
        }
      }
    });

    await this.info(
      'log_cleanup',
      `Cleared ${result.count} logs older than ${daysToKeep} days`
    );

    return result.count;
  }
}

export default LoggerService;

