import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /api/dashboard/summary
   * Get comprehensive dashboard summary with all key metrics
   */
  @Get("summary")
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  /**
   * GET /api/dashboard/stock-summary
   * Get stock summary grouped by model
   */
  @Get("stock-summary")
  async getStockSummary() {
    return this.dashboardService.getStockSummary();
  }

  /**
   * GET /api/dashboard/trends
   * Get monthly trends for the last 6 months
   */
  @Get("trends")
  async getMonthlyTrends() {
    return this.dashboardService.getMonthlyTrends();
  }

  /**
   * GET /api/dashboard/low-stock-alerts
   * Get items with stock below threshold
   */
  @Get("low-stock-alerts")
  async getLowStockAlerts(@Query("threshold") threshold?: string) {
    const thresholdNum = threshold ? parseInt(threshold, 10) : 5;
    return this.dashboardService.getLowStockAlerts(thresholdNum);
  }

  /**
   * GET /api/dashboard/upcoming-returns
   * Get loans due for return in the next N days
   */
  @Get("upcoming-returns")
  async getUpcomingReturns(@Query("days") days?: string) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.dashboardService.getUpcomingReturns(daysNum);
  }
}
