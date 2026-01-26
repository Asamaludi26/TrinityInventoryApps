import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateNotificationDto {
  recipientId: number;
  type: string;
  message: string;
  actorName: string;
  referenceId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new notification
   */
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        recipientId: dto.recipientId,
        type: dto.type,
        message: dto.message,
        actorName: dto.actorName,
        referenceId: dto.referenceId,
      },
    });
  }

  /**
   * Create notifications for multiple users
   */
  async createBulk(
    recipientIds: number[],
    notification: Omit<CreateNotificationDto, 'recipientId'>,
  ) {
    return this.prisma.notification.createMany({
      data: recipientIds.map(recipientId => ({
        recipientId,
        type: notification.type,
        message: notification.message,
        actorName: notification.actorName,
        referenceId: notification.referenceId,
      })),
    });
  }

  /**
   * Get notifications for a user with pagination
   */
  async findByUser(
    recipientId: number,
    options?: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    },
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      recipientId,
      ...(options?.unreadOnly && { isRead: false }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(recipientId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
      },
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number | bigint | string, recipientId: number) {
    return this.prisma.notification.updateMany({
      where: {
        id: BigInt(id),
        recipientId,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(recipientId: number) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Delete a notification
   */
  async remove(id: number | bigint | string, recipientId: number) {
    return this.prisma.notification.deleteMany({
      where: {
        id: BigInt(id),
        recipientId,
      },
    });
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async cleanupOld(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.notification.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
        isRead: true,
      },
    });
  }

  // =========================================================================
  // NOTIFICATION FACTORY METHODS - Convenience methods for common notifications
  // =========================================================================

  /**
   * Notify about new request
   */
  async notifyNewRequest(adminUserIds: number[], requestId: string, requesterName: string) {
    return this.createBulk(adminUserIds, {
      type: 'REQUEST_CREATED',
      message: `${requesterName} membuat permintaan baru`,
      actorName: requesterName,
      referenceId: requestId,
    });
  }

  /**
   * Notify about request approval
   */
  async notifyRequestApproved(recipientId: number, requestId: string, approverName: string) {
    return this.create({
      recipientId,
      type: 'REQUEST_APPROVED',
      message: `Permintaan Anda telah disetujui oleh ${approverName}`,
      actorName: approverName,
      referenceId: requestId,
    });
  }

  /**
   * Notify about loan approval
   */
  async notifyLoanApproved(recipientId: number, loanId: string, approverName: string) {
    return this.create({
      recipientId,
      type: 'LOAN_APPROVED',
      message: `Pinjaman Anda telah disetujui oleh ${approverName}`,
      actorName: approverName,
      referenceId: loanId,
    });
  }

  /**
   * Notify about maintenance due
   */
  async notifyMaintenanceDue(technicianId: number, assetId: string, assetName: string) {
    return this.create({
      recipientId: technicianId,
      type: 'MAINTENANCE_DUE',
      message: `${assetName} memerlukan maintenance`,
      actorName: 'System',
      referenceId: assetId,
    });
  }
}
