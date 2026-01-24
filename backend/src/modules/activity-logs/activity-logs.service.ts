import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
// PERBAIKAN: Import 'Prisma' untuk akses tipe WhereInput
import { Prisma } from '@prisma/client';

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
  userId: number;
  userName: string;
  details?: string;
  referenceId?: string;
  assetId?: string;
  customerId?: string;
  requestId?: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an activity
   * Note: ActivityLog schema uses: userId, userName, action, details, entityType, entityId
   */
  async log(options: LogActivityOptions) {
    return this.prisma.activityLog.create({
      data: {
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
        userId: options.userId,
        userName: options.userName,
        details: options.details || JSON.stringify({}),
        referenceId: options.referenceId,
        assetId: options.assetId,
        customerId: options.customerId,
        requestId: options.requestId,
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
    userName?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    /**
     * PERBAIKAN BARIS 85:
     * Menggunakan Prisma.ActivityLogWhereInput menggantikan 'any'.
     */
    const where: Prisma.ActivityLogWhereInput = {};

    if (options?.entityType) {
      where.entityType = options.entityType;
    }

    if (options?.entityId) {
      where.entityId = options.entityId;
    }

    if (options?.action) {
      where.action = options.action;
    }

    if (options?.userName) {
      where.userName = {
        contains: options.userName,
        mode: 'insensitive',
      };
    }

    if (options?.startDate || options?.endDate) {
      where.timestamp = {};
      if (options?.startDate) {
        where.timestamp.gte = options.startDate;
      }
      if (options?.endDate) {
        where.timestamp.lte = options.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
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
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecent(limit = 10) {
    return this.prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        action: true,
        userName: true,
        timestamp: true,
      },
    });
  }

  /**
   * Get user activity history
   */
  async findByUser(userName: string, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: {
        userName: userName,
      },
      orderBy: { timestamp: 'desc' },
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
        timestamp: { lt: cutoffDate },
      },
    });
  }

  // =========================================================================
  // CONVENIENCE METHODS FOR COMMON LOGGING PATTERNS
  // =========================================================================

  async logAssetCreated(
    assetId: string,
    userId: number,
    userName: string,
    /**
     * PERBAIKAN BARIS 199:
     * Menggunakan Record<string, unknown> daripada any.
     */
    assetData?: Record<string, unknown>,
  ) {
    return this.log({
      entityType: 'asset',
      entityId: assetId,
      action: 'CREATE',
      userId,
      userName,
      details: assetData ? JSON.stringify(assetData) : undefined,
      assetId,
    });
  }

  async logAssetUpdated(
    assetId: string,
    userId: number,
    userName: string,
    /**
     * PERBAIKAN BARIS 211:
     * Menggunakan Record<string, unknown> daripada any.
     */
    changes?: Record<string, unknown>,
  ) {
    return this.log({
      entityType: 'asset',
      entityId: assetId,
      action: 'UPDATE',
      userId,
      userName,
      details: changes ? JSON.stringify(changes) : undefined,
      assetId,
    });
  }

  async logRequestCreated(
    requestId: string,
    userId: number,
    userName: string,
    /**
     * PERBAIKAN BARIS 223:
     * Menggunakan Record<string, unknown> daripada any.
     */
    details?: Record<string, unknown>,
  ) {
    return this.log({
      entityType: 'request',
      entityId: requestId,
      action: 'CREATE',
      userId,
      userName,
      details: details ? JSON.stringify(details) : undefined,
      requestId,
    });
  }

  async logRequestApproved(
    requestId: string,
    userId: number,
    userName: string,
    /**
     * PERBAIKAN BARIS 235:
     * Menggunakan Record<string, unknown> daripada any.
     */
    details?: Record<string, unknown>,
  ) {
    return this.log({
      entityType: 'request',
      entityId: requestId,
      action: 'APPROVE',
      userId,
      userName,
      details: details ? JSON.stringify(details) : undefined,
      requestId,
    });
  }

  async logRequestRejected(requestId: string, userId: number, userName: string, reason: string) {
    return this.log({
      entityType: 'request',
      entityId: requestId,
      action: 'REJECT',
      userId,
      userName,
      details: JSON.stringify({ reason }),
      requestId,
    });
  }

  async logUserLogin(userId: number, userName: string) {
    return this.log({
      entityType: 'user',
      entityId: userId.toString(),
      action: 'LOGIN',
      userId,
      userName,
    });
  }

  async logUserLogout(userId: number, userName: string) {
    return this.log({
      entityType: 'user',
      entityId: userId.toString(),
      action: 'LOGOUT',
      userId,
      userName,
    });
  }
}
