import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/notifications
   * Get notifications for current user
   */
  @Get()
  async findMyNotifications(
    @CurrentUser() user: { id: number },
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("unreadOnly") unreadOnly?: string,
  ) {
    return this.notificationsService.findByUser(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      unreadOnly: unreadOnly === "true",
    });
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count
   */
  @Get("unread-count")
  async getUnreadCount(@CurrentUser() user: { id: number }) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  @Patch(":id/read")
  async markAsRead(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    await this.notificationsService.markAsRead(id, user.id);
    return { success: true };
  }

  /**
   * POST /api/notifications/mark-all-read
   * Mark all notifications as read
   */
  @Post("mark-all-read")
  async markAllAsRead(@CurrentUser() user: { id: number }) {
    await this.notificationsService.markAllAsRead(user.id);
    return { success: true };
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    await this.notificationsService.remove(id, user.id);
    return { success: true };
  }
}
