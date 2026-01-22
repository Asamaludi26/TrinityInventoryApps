import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssetStatus, ItemStatus, LoanRequestStatus, CustomerStatus } from '@prisma/client';

export interface DashboardSummary {
  assets: {
    total: number;
    inStorage: number;
    inUse: number;
    inCustody: number;
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
    id: bigint;
    action: string;
    entityType: string;
    entityId: string;
    userName: string;
    timestamp: Date;
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
  inCustody: number;
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
      // Asset statistics (Asset has no deletedAt field)
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { id: true },
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

      // Overdue loans - LoanRequest uses LoanRequestStatus
      this.prisma.loanRequest.count({
        where: {
          status: LoanRequestStatus.ON_LOAN,
        },
      }),

      // Customer statistics (Customer model doesn't have deletedAt)
      this.prisma.customer.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Recent activities (last 10) - ActivityLog uses timestamp and userName
      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          userName: true,
          timestamp: true,
        },
      }),
    ]);

    // Process asset stats
    const assetCounts = this.aggregateGroupBy(assetStats, 'status');
    const assets = {
      total: Object.values(assetCounts).reduce((a, b) => a + b, 0),
      inStorage: assetCounts[AssetStatus.IN_STORAGE] || 0,
      inUse: assetCounts[AssetStatus.IN_USE] || 0,
      inCustody: assetCounts[AssetStatus.IN_CUSTODY] || 0,
      underRepair: assetCounts[AssetStatus.UNDER_REPAIR] || 0,
    };

    // Process request stats - Request uses ItemStatus
    const requestCounts = this.aggregateGroupBy(requestStats, 'status');
    const requests = {
      total: Object.values(requestCounts).reduce((a, b) => a + b, 0),
      pending: requestCounts[ItemStatus.PENDING] || 0,
      approved:
        (requestCounts[ItemStatus.LOGISTIC_APPROVED] || 0) +
        (requestCounts[ItemStatus.APPROVED] || 0),
      completed: requestCounts[ItemStatus.COMPLETED] || 0,
      thisMonth: requestsThisMonth,
    };

    // Process loan stats - LoanRequest uses LoanRequestStatus
    const loanCounts = this.aggregateGroupBy(loanStats, 'status');
    const loans = {
      total: Object.values(loanCounts).reduce((a, b) => a + b, 0),
      active: loanCounts[LoanRequestStatus.ON_LOAN] || 0,
      overdue: overdueLoans,
      returned: loanCounts[LoanRequestStatus.RETURNED] || 0,
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
   * Get stock summary by type (schema uses StandardItem, not AssetModel)
   */
  async getStockSummary(): Promise<StockSummary[]> {
    const types = await this.prisma.assetType.findMany({
      include: {
        category: true,
        assets: {
          select: { status: true },
        },
      },
    });

    return types.map(type => {
      const statusCounts: Record<string, number> = {};
      type.assets.forEach(asset => {
        statusCounts[asset.status] = (statusCounts[asset.status] || 0) + 1;
      });

      return {
        modelId: type.id,
        modelName: type.name,
        brand: '', // Type doesn't have brand
        typeName: type.name,
        categoryName: type.category.name,
        totalStock: type.assets.length,
        inStorage: statusCounts[AssetStatus.IN_STORAGE] || 0,
        inUse: statusCounts[AssetStatus.IN_USE] || 0,
        inCustody: statusCounts[AssetStatus.IN_CUSTODY] || 0,
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
   * Uses AssetType since there's no AssetModel in schema
   */
  async getLowStockAlerts(threshold = 5) {
    const types = await this.prisma.assetType.findMany({
      include: {
        category: true,
        assets: {
          where: {
            status: AssetStatus.IN_STORAGE,
          },
        },
      },
    });

    return types
      .filter(type => type.assets.length < threshold)
      .map(type => ({
        typeId: type.id,
        typeName: type.name,
        brand: '', // Type doesn't have brand in schema
        categoryName: type.category.name,
        currentStock: type.assets.length,
        threshold,
      }));
  }

  /**
   * Get upcoming loan returns (due in next 7 days)
   * LoanRequest doesn't have expectedReturn - return dates are on LoanItem
   */
  async getUpcomingReturns(days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Query loans with items that have return dates in the upcoming window
    return this.prisma.loanRequest.findMany({
      where: {
        status: LoanRequestStatus.ON_LOAN,
        items: {
          some: {
            returnDate: {
              gte: now,
              lte: futureDate,
            },
          },
        },
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        items: {
          where: {
            returnDate: {
              gte: now,
              lte: futureDate,
            },
          },
          orderBy: { returnDate: 'asc' },
        },
      },
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
