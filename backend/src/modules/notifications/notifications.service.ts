import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationDto {
  recipientId: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType?: string;
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
        title: dto.title,
        message: dto.message,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
      },
    });
  }

  /**
   * Create notifications for multiple users
   */
  async createBulk(
    recipientIds: number[],
    notification: Omit<CreateNotificationDto, "recipientId">,
  ) {
    return this.prisma.notification.createMany({
      data: recipientIds.map((recipientId) => ({
        recipientId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        referenceType: notification.referenceType,
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
        orderBy: { createdAt: "desc" },
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
  async markAsRead(id: number, recipientId: number) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        recipientId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
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
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete a notification
   */
  async remove(id: number, recipientId: number) {
    return this.prisma.notification.deleteMany({
      where: {
        id,
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
        createdAt: { lt: cutoffDate },
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
  async notifyNewRequest(
    adminUserIds: number[],
    requestId: string,
    requesterName: string,
  ) {
    return this.createBulk(adminUserIds, {
      type: NotificationType.REQUEST_CREATED,
      title: "Permintaan Baru",
      message: `${requesterName} membuat permintaan baru`,
      referenceType: "request",
      referenceId: requestId,
    });
  }

  /**
   * Notify about request approval
   */
  async notifyRequestApproved(
    recipientId: number,
    requestId: string,
    approverName: string,
  ) {
    return this.create({
      recipientId,
      type: NotificationType.REQUEST_APPROVED,
      title: "Permintaan Disetujui",
      message: `Permintaan Anda telah disetujui oleh ${approverName}`,
      referenceType: "request",
      referenceId: requestId,
    });
  }

  /**
   * Notify about loan approval
   */
  async notifyLoanApproved(
    recipientId: number,
    loanId: string,
    approverName: string,
  ) {
    return this.create({
      recipientId,
      type: NotificationType.LOAN_APPROVED,
      title: "Pinjaman Disetujui",
      message: `Pinjaman Anda telah disetujui oleh ${approverName}`,
      referenceType: "loan",
      referenceId: loanId,
    });
  }

  /**
   * Notify about maintenance due
   */
  async notifyMaintenanceDue(
    technicianId: number,
    assetId: string,
    assetName: string,
  ) {
    return this.create({
      recipientId: technicianId,
      type: NotificationType.MAINTENANCE_DUE,
      title: "Jadwal Maintenance",
      message: `${assetName} memerlukan maintenance`,
      referenceType: "asset",
      referenceId: assetId,
    });
  }
}
