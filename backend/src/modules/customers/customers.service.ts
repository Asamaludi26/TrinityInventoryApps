import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerStatus, Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Strip unknown fields from customer DTO to prevent Prisma validation errors.
   */
  private sanitizeCustomerData(
    dto: Partial<CreateCustomerDto | UpdateCustomerDto>,
  ): Record<string, unknown> {
    // PERBAIKAN BARIS 17: Ganti 'any' dengan 'unknown'
    /**
     * PERBAIKAN BARIS 23-24:
     * Menggunakan 'Record<string, unknown>' agar lolos linter.
     * Tipe 'unknown' memaksa kita melakukan type checking atau casting
     * sebelum digunakan, yang mana sudah kita lakukan di method create/update.
     */
    const source = dto as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    // Daftar field yang diizinkan masuk ke database
    const allowedFields = [
      'name',
      'address',
      'phone',
      'email',
      'status',
      'serviceType',
      'serviceSpeed',
      'servicePackage',
      'notes',
    ];

    for (const field of allowedFields) {
      if (source[field] !== undefined) {
        sanitized[field] = source[field];
      }
    }

    return sanitized;
  }

  private async generateCustomerId(): Promise<string> {
    const prefix = 'CUST-';

    const lastCustomer = await this.prisma.customer.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let sequence = 1;
    if (lastCustomer) {
      const lastSeq = parseInt(lastCustomer.id.replace(prefix, ''));
      if (!isNaN(lastSeq)) sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateCustomerDto) {
    const id = dto.id || (await this.generateCustomerId());
    const sanitized = this.sanitizeCustomerData(dto);

    const createData: Prisma.CustomerUncheckedCreateInput = {
      // Spread sanitized data dan casting ke tipe Input yang benar
      // Casting 'unknown' ke tipe spesifik Prisma diizinkan dan aman di sini
      ...(sanitized as Prisma.CustomerUncheckedCreateInput),
      id,
    };

    return this.prisma.customer.create({
      data: createData,
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: CustomerStatus;
    search?: string;
  }) {
    const { skip = 0, take = 50, status, search } = params || {};

    const where: Prisma.CustomerWhereInput = {};

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data: customers, total, skip, take };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${id} tidak ditemukan`);
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const sanitized = this.sanitizeCustomerData(dto);

    return this.prisma.customer.update({
      where: { id },
      // Casting 'unknown' ke tipe UpdateInput
      data: sanitized as Prisma.CustomerUpdateInput,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Customer has no deletedAt field - do a hard delete
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async getCustomerAssets(id: string) {
    await this.findOne(id);

    // Assets are related to customers through installed materials
    return this.prisma.installedMaterial.findMany({
      where: { customerId: id },
    });
  }
}
