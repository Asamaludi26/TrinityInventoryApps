import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssetStatus, RequestStatus, LoanStatus, CustomerStatus } from '@prisma/client';

export interface DashboardSummary {
  assets: {
    total: number;
    inStorage: number;
    inUse: number;
    onLoan: number;
    underRepair: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
    thisMonth: number;
  };
  loans: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  };
  customers: {
    total: number;
    active: number;
    inactive: number;
  };
  recentActivities: {
    id: number;
    action: string;
    entityType: string;
    entityId: string;
    performedBy: string;
    createdAt: Date;
  }[];
}

export interface StockSummary {
  modelId: number;
  modelName: string;
  brand: string;
  typeName: string;
  categoryName: string;
  totalStock: number;
  inStorage: number;
  inUse: number;
  onLoan: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive dashboard summary
   */
  async getSummary(): Promise<DashboardSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Execute all queries in parallel for performance
    const [
      assetStats,
      requestStats,
      requestsThisMonth,
      loanStats,
      overdueLoans,
      customerStats,
      recentActivities,
    ] = await Promise.all([
      // Asset statistics
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null },
      }),

      // Request statistics
      this.prisma.request.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Requests this month
      this.prisma.request.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),

      // Loan statistics
      this.prisma.loanRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Overdue loans
      this.prisma.loanRequest.count({
        where: {
          status: LoanStatus.APPROVED,
          expectedReturn: { lt: now },
        },
      }),

      // Customer statistics
      this.prisma.customer.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null },
      }),

      // Recent activities (last 10)
      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          performedBy: true,
          createdAt: true,
        },
      }),
    ]);

    // Process asset stats
    const assetCounts = this.aggregateGroupBy(assetStats, 'status');
    const assets = {
      total: Object.values(assetCounts).reduce((a, b) => a + b, 0),
      inStorage: assetCounts[AssetStatus.IN_STORAGE] || 0,
      inUse: assetCounts[AssetStatus.IN_USE] || 0,
      onLoan: assetCounts[AssetStatus.ON_LOAN] || 0,
      underRepair: assetCounts[AssetStatus.UNDER_REPAIR] || 0,
    };

    // Process request stats
    const requestCounts = this.aggregateGroupBy(requestStats, 'status');
    const requests = {
      total: Object.values(requestCounts).reduce((a, b) => a + b, 0),
      pending: requestCounts[RequestStatus.PENDING] || 0,
      approved:
        (requestCounts[RequestStatus.LOGISTIC_APPROVED] || 0) +
        (requestCounts[RequestStatus.PURCHASE_APPROVED] || 0),
      completed: requestCounts[RequestStatus.COMPLETED] || 0,
      thisMonth: requestsThisMonth,
    };

    // Process loan stats
    const loanCounts = this.aggregateGroupBy(loanStats, 'status');
    const loans = {
      total: Object.values(loanCounts).reduce((a, b) => a + b, 0),
      active: loanCounts[LoanStatus.APPROVED] || 0,
      overdue: overdueLoans,
      returned: loanCounts[LoanStatus.RETURNED] || 0,
    };

    // Process customer stats
    const customerCounts = this.aggregateGroupBy(customerStats, 'status');
    const customers = {
      total: Object.values(customerCounts).reduce((a, b) => a + b, 0),
      active: customerCounts[CustomerStatus.ACTIVE] || 0,
      inactive: customerCounts[CustomerStatus.INACTIVE] || 0,
    };

    return {
      assets,
      requests,
      loans,
      customers,
      recentActivities,
    };
  }

  /**
   * Get stock summary by model
   */
  async getStockSummary(): Promise<StockSummary[]> {
    const models = await this.prisma.assetModel.findMany({
      include: {
        type: {
          include: {
            category: true,
          },
        },
        assets: {
          where: { deletedAt: null },
          select: { status: true },
        },
      },
    });

    return models.map(model => {
      const statusCounts: Record<string, number> = {};
      model.assets.forEach(asset => {
        statusCounts[asset.status] = (statusCounts[asset.status] || 0) + 1;
      });

      return {
        modelId: model.id,
        modelName: model.name,
        brand: model.brand,
        typeName: model.type.name,
        categoryName: model.type.category.name,
        totalStock: model.assets.length,
        inStorage: statusCounts[AssetStatus.IN_STORAGE] || 0,
        inUse: statusCounts[AssetStatus.IN_USE] || 0,
        onLoan: statusCounts[AssetStatus.ON_LOAN] || 0,
      };
    });
  }

  /**
   * Get monthly trends for the last 6 months
   */
  async getMonthlyTrends() {
    const months: any[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthStr = date.toLocaleString('id-ID', {
        month: 'short',
        year: 'numeric',
      });

      const [requests, handovers, installations] = await Promise.all([
        this.prisma.request.count({
          where: {
            createdAt: { gte: date, lt: nextMonth },
          },
        }),
        this.prisma.handover.count({
          where: {
            createdAt: { gte: date, lt: nextMonth },
          },
        }),
        this.prisma.installation.count({
          where: {
            createdAt: { gte: date, lt: nextMonth },
          },
        }),
      ]);

      months.push({
        month: monthStr,
        requests,
        handovers,
        installations,
      });
    }

    return months;
  }

  /**
   * Get low stock alerts (items with stock below threshold)
   */
  async getLowStockAlerts(threshold = 5) {
    const models = await this.prisma.assetModel.findMany({
      include: {
        type: {
          include: { category: true },
        },
        _count: {
          select: {
            assets: {
              where: {
                status: AssetStatus.IN_STORAGE,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return models
      .filter(model => model._count.assets < threshold)
      .map(model => ({
        modelId: model.id,
        modelName: model.name,
        brand: model.brand,
        typeName: model.type.name,
        categoryName: model.type.category.name,
        currentStock: model._count.assets,
        threshold,
      }));
  }

  /**
   * Get upcoming loan returns (due in next 7 days)
   */
  async getUpcomingReturns(days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.prisma.loanRequest.findMany({
      where: {
        status: LoanStatus.APPROVED,
        expectedReturn: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { expectedReturn: 'asc' },
    });
  }

  /**
   * Helper to aggregate groupBy results
   */
  private aggregateGroupBy(results: any[], key: string): Record<string, number> {
    const counts: Record<string, number> = {};
    results.forEach(r => {
      const keyValue = r[key] || 'unknown';
      counts[keyValue] = r._count?.id || 0;
    });
    return counts;
  }
}
