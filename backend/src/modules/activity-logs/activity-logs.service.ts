import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export type EntityType =
  | 'asset'
  | 'request'
  | 'loan'
  | 'handover'
  | 'installation'
  | 'dismantle'
  | 'maintenance'
  | 'customer'
  | 'user'
  | 'category'
  | 'type'
  | 'model';

export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'COMPLETE'
  | 'CANCEL'
  | 'LOGIN'
  | 'LOGOUT'
  | 'STATUS_CHANGE';

export interface LogActivityOptions {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  changes?: Record<string, any>;
}

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an activity
   */
  async log(options: LogActivityOptions) {
    return this.prisma.activityLog.create({
      data: {
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
        performedBy: options.performedBy,
        changes: options.changes || {},
      },
    });
  }

  /**
   * Get activity logs with filtering and pagination
   */
  async findAll(options?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    performedBy?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.entityType) {
      where.entityType = options.entityType;
    }

    if (options?.entityId) {
      where.entityId = options.entityId;
    }

    if (options?.action) {
      where.action = options.action;
    }

    if (options?.performedBy) {
      where.performedBy = {
        contains: options.performedBy,
        mode: 'insensitive',
      };
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options?.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options?.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get activity logs for a specific entity
   */
  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecent(limit = 10) {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        action: true,
        performedBy: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get user activity history
   */
  async findByUser(userName: string, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: {
        performedBy: userName,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Cleanup old logs (for maintenance)
   */
  async cleanupOld(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });
  }

  // =========================================================================
  // CONVENIENCE METHODS FOR COMMON LOGGING PATTERNS
  // =========================================================================

  async logAssetCreated(assetId: string, performedBy: string, assetData?: any) {
    return this.log({
      entityType: 'asset',
      entityId: assetId,
      action: 'CREATE',
      performedBy,
      changes: assetData,
    });
  }

  async logAssetUpdated(assetId: string, performedBy: string, changes?: any) {
    return this.log({
      entityType: 'asset',
      entityId: assetId,
      action: 'UPDATE',
      performedBy,
      changes,
    });
  }

  async logRequestCreated(requestId: string, performedBy: string, details?: any) {
    return this.log({
      entityType: 'request',
      entityId: requestId,
      action: 'CREATE',
      performedBy,
      changes: details,
    });
  }

  async logRequestApproved(requestId: string, performedBy: string, details?: any) {
    return this.log({
      entityType: 'request',
      entityId: requestId,
      action: 'APPROVE',
      performedBy,
      changes: details,
    });
  }

  async logRequestRejected(requestId: string, performedBy: string, reason: string) {
    return this.log({
      entityType: 'request',
      entityId: requestId,
      action: 'REJECT',
      performedBy,
      changes: { reason },
    });
  }

  async logUserLogin(userId: number, userName: string) {
    return this.log({
      entityType: 'user',
      entityId: userId.toString(),
      action: 'LOGIN',
      performedBy: userName,
    });
  }

  async logUserLogout(userId: number, userName: string) {
    return this.log({
      entityType: 'user',
      entityId: userId.toString(),
      action: 'LOGOUT',
      performedBy: userName,
    });
  }
}
