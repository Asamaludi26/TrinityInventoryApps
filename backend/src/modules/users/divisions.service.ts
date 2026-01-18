import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDivisionDto: CreateDivisionDto) {
    return this.prisma.division.create({
      data: createDivisionDto,
    });
  }

  async findAll() {
    return this.prisma.division.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const division = await this.prisma.division.findUnique({
      where: { id },
      include: {
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!division) {
      throw new NotFoundException(`Division dengan ID ${id} tidak ditemukan`);
    }

    return division;
  }

  async update(id: number, updateDivisionDto: UpdateDivisionDto) {
    await this.findOne(id);

    return this.prisma.division.update({
      where: { id },
      data: updateDivisionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.division.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
