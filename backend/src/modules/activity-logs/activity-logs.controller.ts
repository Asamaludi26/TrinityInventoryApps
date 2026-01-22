import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * GET /api/activity-logs
   * Get activity logs with filtering (Admin only)
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  async findAll(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('userName') userName?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityLogsService.findAll({
      entityType,
      entityId,
      action,
      userName,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  /**
   * GET /api/activity-logs/entity
   * Get activity logs for a specific entity
   */
  @Get('entity')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  async findByEntity(@Query('type') entityType: string, @Query('id') entityId: string) {
    return this.activityLogsService.findByEntity(entityType, entityId);
  }

  /**
   * GET /api/activity-logs/recent
   * Get recent activities for dashboard
   */
  @Get('recent')
  async getRecent(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.activityLogsService.getRecent(limitNum);
  }
}
