import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Hash password if provided plain
    const password = createUserDto.password.startsWith("$2")
      ? createUserDto.password // Already hashed
      : await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password,
        role: createUserDto.role || UserRole.STAFF,
      },
      include: {
        division: true,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    role?: UserRole;
    divisionId?: number;
    search?: string;
  }) {
    const { skip = 0, take = 50, role, divisionId, search } = params || {};

    const where: any = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (divisionId) {
      where.divisionId = divisionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          division: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return {
      data: sanitizedUsers,
      total,
      skip,
      take,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        division: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        division: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Ensure exists

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        division: true,
      },
    });

    const { password, ...result } = updated;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure exists

    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async markPasswordResetRequested(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordResetRequested: true,
        passwordResetRequestDate: new Date(),
      },
    });
  }

  async resetPassword(id: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordResetRequested: false,
        passwordResetRequestDate: null,
      },
    });
  }

  async updatePermissions(id: number, permissions: string[]) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { permissions },
    });
  }
}
