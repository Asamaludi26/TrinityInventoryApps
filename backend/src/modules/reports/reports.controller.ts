import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  UserRole,
  AssetStatus,
  AssetCondition,
  RequestStatus,
} from "@prisma/client";

@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.ADMIN_PURCHASE)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/reports/assets/inventory
   * Get asset inventory report
   */
  @Get("assets/inventory")
  async getAssetInventoryReport(
    @Query("status") status?: AssetStatus,
    @Query("condition") condition?: AssetCondition,
    @Query("categoryId") categoryId?: string,
    @Query("typeId") typeId?: string,
    @Query("modelId") modelId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.reportsService.getAssetInventoryReport({
      status,
      condition,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      typeId: typeId ? parseInt(typeId, 10) : undefined,
      modelId: modelId ? parseInt(modelId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * GET /api/reports/assets/movements
   * Get asset movement report
   */
  @Get("assets/movements")
  async getAssetMovementReport(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.reportsService.getAssetMovementReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * GET /api/reports/requests
   * Get request summary report
   */
  @Get("requests")
  async getRequestReport(
    @Query("status") status?: RequestStatus,
    @Query("requestedBy") requestedBy?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.reportsService.getRequestReport({
      status,
      requestedBy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * GET /api/reports/loans
   * Get loan status report
   */
  @Get("loans")
  async getLoanReport(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.reportsService.getLoanReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * GET /api/reports/customers
   * Get customer report
   */
  @Get("customers")
  async getCustomerReport(@Query("customerId") customerId?: string) {
    return this.reportsService.getCustomerReport(customerId);
  }

  /**
   * GET /api/reports/maintenances
   * Get maintenance history report
   */
  @Get("maintenances")
  async getMaintenanceReport(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.reportsService.getMaintenanceReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
