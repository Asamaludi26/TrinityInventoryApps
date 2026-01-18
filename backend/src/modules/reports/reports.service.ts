import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AssetStatus, AssetCondition, RequestStatus } from "@prisma/client";

export interface AssetReportFilters {
  status?: AssetStatus;
  condition?: AssetCondition;
  categoryId?: number;
  typeId?: number;
  modelId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface RequestReportFilters {
  status?: RequestStatus;
  requestedBy?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // ASSET REPORTS
  // =========================================================================

  /**
   * Get asset inventory report
   */
  async getAssetInventoryReport(filters?: AssetReportFilters) {
    const where: any = { deletedAt: null };

    if (filters?.status) where.status = filters.status;
    if (filters?.condition) where.condition = filters.condition;
    if (filters?.modelId) where.modelId = filters.modelId;

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        model: {
          include: {
            type: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Group by category for summary
    const summary: Record<string, any> = {};
    assets.forEach((asset) => {
      const categoryName = asset.model?.type?.category?.name || "Uncategorized";
      if (!summary[categoryName]) {
        summary[categoryName] = {
          total: 0,
          byStatus: {},
          byCondition: {},
        };
      }
      summary[categoryName].total++;
      summary[categoryName].byStatus[asset.status] =
        (summary[categoryName].byStatus[asset.status] || 0) + 1;
      summary[categoryName].byCondition[asset.condition] =
        (summary[categoryName].byCondition[asset.condition] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      filters,
      totalAssets: assets.length,
      summary,
      assets: assets.map((a) => ({
        id: a.id,
        name: a.name,
        brand: a.brand,
        serialNumber: a.serialNumber,
        status: a.status,
        condition: a.condition,
        location: a.location,
        category: a.model?.type?.category?.name,
        type: a.model?.type?.name,
        model: a.model?.name,
        createdAt: a.createdAt,
      })),
    };
  }

  /**
   * Get asset movement report
   */
  async getAssetMovementReport(startDate: Date, endDate: Date) {
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "desc" },
    });

    // Summary by movement type
    const summaryByType: Record<string, number> = {};
    movements.forEach((m) => {
      summaryByType[m.movementType] = (summaryByType[m.movementType] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalMovements: movements.length,
      summaryByType,
      movements: movements.map((m) => ({
        id: m.id,
        assetId: m.assetId,
        movementType: m.movementType,
        quantity: m.quantity,
        unit: m.unit,
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        previousBalance: m.previousBalance,
        newBalance: m.newBalance,
        performedBy: m.performedBy,
        createdAt: m.createdAt,
      })),
    };
  }

  // =========================================================================
  // REQUEST REPORTS
  // =========================================================================

  /**
   * Get request summary report
   */
  async getRequestReport(filters?: RequestReportFilters) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.requestedBy) {
      where.requester = {
        name: { contains: filters.requestedBy, mode: "insensitive" },
      };
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const requests = await this.prisma.request.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Summary by status
    const summaryByStatus: Record<string, number> = {};
    requests.forEach((r) => {
      summaryByStatus[r.status] = (summaryByStatus[r.status] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      filters,
      totalRequests: requests.length,
      summaryByStatus,
      requests: requests.map((r) => ({
        id: r.id,
        docNumber: r.docNumber,
        division: r.division,
        orderType: r.orderType,
        status: r.status,
        requester: r.requester?.name,
        itemCount: r.items.length,
        totalQuantity: r.items.reduce((sum, i) => sum + i.quantity, 0),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };
  }

  // =========================================================================
  // LOAN REPORTS
  // =========================================================================

  /**
   * Get loan status report
   */
  async getLoanReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const loans = await this.prisma.loanRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const overdue = loans.filter(
      (l) =>
        l.status === "APPROVED" &&
        l.expectedReturn &&
        new Date(l.expectedReturn) < now,
    );

    // Summary by status
    const summaryByStatus: Record<string, number> = {};
    loans.forEach((l) => {
      summaryByStatus[l.status] = (summaryByStatus[l.status] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalLoans: loans.length,
      overdueCount: overdue.length,
      summaryByStatus,
      loans: loans.map((l) => ({
        id: l.id,
        docNumber: l.docNumber,
        requester: l.requester?.name,
        status: l.status,
        purpose: l.purpose,
        requestDate: l.requestDate,
        expectedReturn: l.expectedReturn,
        isOverdue:
          l.status === "APPROVED" &&
          l.expectedReturn &&
          new Date(l.expectedReturn) < now,
      })),
    };
  }

  // =========================================================================
  // CUSTOMER REPORTS
  // =========================================================================

  /**
   * Get customer report
   */
  async getCustomerReport(customerId?: string) {
    const where: any = { deletedAt: null };
    if (customerId) {
      where.id = customerId;
    }

    const customers = await this.prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
    });

    // Get installed assets count per customer
    const customerAssets = await Promise.all(
      customers.map(async (c) => {
        const assetCount = await this.prisma.asset.count({
          where: { customerId: c.id },
        });
        return { customerId: c.id, assetCount };
      }),
    );

    const assetCountMap = customerAssets.reduce(
      (acc, ca) => {
        acc[ca.customerId] = ca.assetCount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      generatedAt: new Date(),
      totalCustomers: customers.length,
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        phone: c.phone,
        email: c.email,
        status: c.status,
        serviceType: c.serviceType,
        serviceSpeed: c.serviceSpeed,
        assetCount: assetCountMap[c.id] || 0,
      })),
    };
  }

  // =========================================================================
  // MAINTENANCE REPORTS
  // =========================================================================

  /**
   * Get maintenance history report
   */
  async getMaintenanceReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const maintenances = await this.prisma.maintenance.findMany({
      where,
      include: {
        asset: {
          select: { id: true, name: true, brand: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Summary by type
    const summaryByType: Record<string, number> = {};
    const totalCost = maintenances.reduce((sum, m) => {
      summaryByType[m.type] = (summaryByType[m.type] || 0) + 1;
      const laborCost = m.laborCost?.toNumber() || 0;
      const partsCost = m.partsCost?.toNumber() || 0;
      return sum + laborCost + partsCost;
    }, 0);

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalMaintenances: maintenances.length,
      totalCost,
      summaryByType,
      maintenances: maintenances.map((m) => ({
        id: m.id,
        docNumber: m.docNumber,
        assetId: m.assetId,
        assetName: m.asset?.name,
        type: m.type,
        status: m.status,
        problemDescription: m.problemDescription,
        actionTaken: m.actionTaken,
        technician: m.technician,
        maintenanceDate: m.maintenanceDate,
        completedDate: m.completedDate,
        laborCost: m.laborCost?.toNumber(),
        partsCost: m.partsCost?.toNumber(),
      })),
    };
  }
}
