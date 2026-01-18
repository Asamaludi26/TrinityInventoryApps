import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerStatus } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.customer.create({
      data: {
        ...dto,
        id,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: CustomerStatus;
    search?: string;
  }) {
    const { skip = 0, take = 50, status, search } = params || {};

    const where: any = {
      deletedAt: null,
    };

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

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCustomerAssets(id: string) {
    await this.findOne(id);

    return this.prisma.asset.findMany({
      where: { customerId: id, deletedAt: null },
      include: { model: true },
    });
  }
}
