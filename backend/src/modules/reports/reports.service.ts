import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  AssetStatus,
  AssetCondition,
  ItemStatus,
  LoanRequestStatus,
  Prisma, // Import namespace Prisma untuk akses tipe WhereInput
} from '@prisma/client';

export interface AssetReportFilters {
  status?: AssetStatus;
  condition?: AssetCondition;
  categoryId?: number;
  typeId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface RequestReportFilters {
  status?: ItemStatus;
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
    /**
     * PERBAIKAN: Menggunakan Prisma.AssetWhereInput
     */
    const where: Prisma.AssetWhereInput = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.condition) where.condition = filters.condition;
    if (filters?.typeId) where.typeId = filters.typeId;
    if (filters?.categoryId) where.categoryId = filters.categoryId;

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        type: {
          include: { category: true },
        },
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    /**
     * PERBAIKAN: Mendefinisikan struktur objek summary secara eksplisit
     * menggantikan 'Record<string, any>'
     */
    const summary: Record<
      string,
      {
        total: number;
        byStatus: Record<string, number>;
        byCondition: Record<string, number>;
      }
    > = {};

    assets.forEach(asset => {
      const categoryName = asset.category?.name || asset.type?.category?.name || 'Uncategorized';

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
      assets: assets.map(a => ({
        id: a.id,
        name: a.name,
        brand: a.brand,
        serialNumber: a.serialNumber,
        status: a.status,
        condition: a.condition,
        location: a.location,
        category: a.category?.name,
        type: a.type?.name,
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
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });

    // Summary by movement type
    const summaryByType: Record<string, number> = {};
    movements.forEach(m => {
      summaryByType[m.type] = (summaryByType[m.type] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalMovements: movements.length,
      summaryByType,
      movements: movements.map(m => ({
        id: m.id,
        assetName: m.assetName,
        brand: m.brand,
        movementType: m.type,
        quantity: m.quantity,
        balanceAfter: m.balanceAfter,
        referenceId: m.referenceId,
        relatedAssetId: m.relatedAssetId,
        actorName: m.actorName,
        date: m.date,
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
    /**
     * PERBAIKAN: Menggunakan Prisma.RequestWhereInput
     */
    const where: Prisma.RequestWhereInput = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.requestedBy) {
      where.requester = {
        name: { contains: filters.requestedBy, mode: 'insensitive' },
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
      orderBy: { createdAt: 'desc' },
    });

    // Summary by status
    const summaryByStatus: Record<string, number> = {};
    requests.forEach(r => {
      summaryByStatus[r.status] = (summaryByStatus[r.status] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      filters,
      totalRequests: requests.length,
      summaryByStatus,
      requests: requests.map(r => ({
        id: r.id,
        docNumber: r.docNumber,
        division: r.divisionName,
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
    /**
     * PERBAIKAN: Menggunakan Prisma.LoanRequestWhereInput
     */
    const where: Prisma.LoanRequestWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const loans = await this.prisma.loanRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    // Check for overdue based on LoanItem returnDate
    const overdue = loans.filter(l => {
      if (l.status !== LoanRequestStatus.ON_LOAN) return false;
      const hasOverdueItems = l.items.some(
        item => item.returnDate && new Date(item.returnDate) < now,
      );
      return hasOverdueItems;
    });

    // Summary by status
    const summaryByStatus: Record<string, number> = {};
    loans.forEach(l => {
      summaryByStatus[l.status] = (summaryByStatus[l.status] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalLoans: loans.length,
      overdueCount: overdue.length,
      summaryByStatus,
      loans: loans.map(l => {
        // Get earliest return date from items
        const returnDates = l.items.filter(i => i.returnDate).map(i => new Date(i.returnDate!));
        const earliestReturn =
          returnDates.length > 0 ? new Date(Math.min(...returnDates.map(d => d.getTime()))) : null;

        const hasOverdueItems = l.items.some(
          item => item.returnDate && new Date(item.returnDate) < now,
        );

        return {
          id: l.id,
          docNumber: l.id,
          requester: l.requester?.name,
          status: l.status,
          purpose: l.notes,
          requestDate: l.requestDate,
          expectedReturn: earliestReturn,
          isOverdue: l.status === LoanRequestStatus.ON_LOAN && hasOverdueItems,
        };
      }),
    };
  }

  // =========================================================================
  // CUSTOMER REPORTS
  // =========================================================================

  /**
   * Get customer report
   */
  async getCustomerReport(customerId?: string) {
    /**
     * PERBAIKAN: Menggunakan Prisma.CustomerWhereInput
     */
    const where: Prisma.CustomerWhereInput = {};

    if (customerId) {
      where.id = customerId;
    }

    const customers = await this.prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Get installed materials count per customer
    const customerMaterials = await Promise.all(
      customers.map(async c => {
        const materialCount = await this.prisma.installedMaterial.count({
          where: { customerId: c.id },
        });
        return { customerId: c.id, materialCount };
      }),
    );

    const materialCountMap = customerMaterials.reduce(
      (acc, cm) => {
        acc[cm.customerId] = cm.materialCount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      generatedAt: new Date(),
      totalCustomers: customers.length,
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        address: c.address,
        phone: c.phone,
        email: c.email,
        status: c.status,
        servicePackage: c.servicePackage,
        installedMaterialCount: materialCountMap[c.id] || 0,
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
    /**
     * PERBAIKAN: Menggunakan Prisma.MaintenanceWhereInput
     */
    const where: Prisma.MaintenanceWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const maintenances = await this.prisma.maintenance.findMany({
      where,
      include: {
        assets: {
          select: { id: true, name: true, brand: true },
        },
        customer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary by work type
    const summaryByWorkType: Record<string, number> = {};
    maintenances.forEach(m => {
      m.workTypes.forEach(wt => {
        summaryByWorkType[wt] = (summaryByWorkType[wt] || 0) + 1;
      });
    });

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalMaintenances: maintenances.length,
      summaryByWorkType,
      maintenances: maintenances.map(m => ({
        id: m.id,
        docNumber: m.docNumber,
        customerId: m.customerId,
        customerName: m.customer?.name,
        assetCount: m.assets.length,
        assetNames: m.assets.map(a => a.name).join(', '),
        workTypes: m.workTypes,
        status: m.status,
        problemDescription: m.problemDescription,
        actionsTaken: m.actionsTaken,
        technician: m.technicianName,
        maintenanceDate: m.maintenanceDate,
        completionDate: m.completionDate,
      })),
    };
  }
}
