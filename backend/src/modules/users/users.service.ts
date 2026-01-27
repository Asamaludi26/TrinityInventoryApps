import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { UserRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DEFAULT_USER_PASSWORD, ROLE_ACCOUNT_LIMITS } from '../../common/constants';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper untuk membersihkan field undefined.
   * PERBAIKAN: Mengganti 'Record<string, any>' menjadi 'Partial<CreateUserDto>'
   * agar type-safe dan tidak memicu linter warning.
   */
  private sanitizeUserData(dto: Partial<CreateUserDto | UpdateUserDto>): Partial<CreateUserDto> {
    const { email, password, name, role, divisionId, permissions } = dto || {};

    // Inisialisasi dengan tipe Partial DTO, bukan any
    const sanitized: Partial<CreateUserDto> = {};

    if (email !== undefined) sanitized.email = email;
    if (password !== undefined) sanitized.password = password;
    if (name !== undefined) sanitized.name = name;
    if (role !== undefined) sanitized.role = role;
    if (divisionId !== undefined) sanitized.divisionId = divisionId;
    if (permissions !== undefined) sanitized.permissions = permissions;

    return sanitized;
  }

  /**
   * Validasi batas jumlah akun per role.
   * - SUPER_ADMIN: maksimal 1 akun
   * - ADMIN_LOGISTIK: maksimal 3 akun
   * - ADMIN_PURCHASE: maksimal 3 akun
   * @param role Role yang akan divalidasi
   * @param excludeUserId User ID yang dikecualikan (untuk edit)
   */
  private async validateRoleAccountLimit(role: string, excludeUserId?: number): Promise<void> {
    const limit = ROLE_ACCOUNT_LIMITS[role];

    // Jika role tidak ada batas (STAFF, LEADER, TEKNISI), lewati validasi
    if (!limit) return;

    const whereClause: Prisma.UserWhereInput = {
      role: role as UserRole,
      isActive: true,
    };

    // Jika edit, kecualikan user yang sedang diedit
    if (excludeUserId) {
      whereClause.id = { not: excludeUserId };
    }

    const currentCount = await this.prisma.user.count({ where: whereClause });

    if (currentCount >= limit) {
      const roleDisplayName = this.getRoleDisplayName(role);
      throw new ConflictException(
        `Batas maksimal akun ${roleDisplayName} sudah tercapai (${limit} akun). ` +
          `Hapus atau nonaktifkan akun yang ada sebelum membuat yang baru.`,
      );
    }
  }

  /**
   * Helper untuk mendapatkan nama role yang user-friendly
   */
  private getRoleDisplayName(role: string): string {
    const displayNames: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN_LOGISTIK: 'Admin Logistik',
      ADMIN_PURCHASE: 'Admin Purchase',
      STAFF: 'Staff',
      LEADER: 'Leader',
      TEKNISI: 'Teknisi',
    };
    return displayNames[role] || role;
  }

  /**
   * Mendapatkan informasi batas dan jumlah akun per role
   */
  async getRoleAccountCounts(): Promise<
    {
      role: string;
      displayName: string;
      limit: number | null;
      current: number;
      available: number | null;
    }[]
  > {
    const roles = Object.keys(ROLE_ACCOUNT_LIMITS);

    const counts = await Promise.all(
      roles.map(async role => {
        const count = await this.prisma.user.count({
          where: { role: role as UserRole, isActive: true },
        });
        const limit = ROLE_ACCOUNT_LIMITS[role];
        return {
          role,
          displayName: this.getRoleDisplayName(role),
          limit,
          current: count,
          available: limit ? limit - count : null,
        };
      }),
    );

    return counts;
  }

  async create(createUserDto: CreateUserDto) {
    // 1. Validasi Email Unik
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    // 2. Validasi Batas Jumlah Akun per Role
    const targetRole = (createUserDto.role as UserRole) || UserRole.STAFF;
    await this.validateRoleAccountLimit(targetRole);

    // 3. Validasi Division (Jika ada)
    if (createUserDto.divisionId) {
      const division = await this.prisma.division.findUnique({
        where: { id: createUserDto.divisionId },
      });
      if (!division) {
        throw new BadRequestException(
          `Division dengan ID ${createUserDto.divisionId} tidak ditemukan`,
        );
      }
    }

    // 4. Gunakan password dari DTO atau default password
    // Jika menggunakan default password, set mustChangePassword = true
    const useDefaultPassword = !createUserDto.password;
    const passwordToHash = createUserDto.password || DEFAULT_USER_PASSWORD;
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);
    const sanitized = this.sanitizeUserData(createUserDto);

    // Menggunakan Prisma.UserUncheckedCreateInput untuk support foreign key langsung
    const createData: Prisma.UserUncheckedCreateInput = {
      // Kita gunakan nullish coalescing (??) atau assertion aman jika diperlukan,
      // tapi karena validasi di atas sudah ada, ini aman.
      name: sanitized.name as string,
      email: sanitized.email as string,
      password: hashedPassword,
      role: targetRole,
      divisionId: sanitized.divisionId,
      permissions: sanitized.permissions,
      mustChangePassword: useDefaultPassword, // True jika pakai default password
    };

    return this.prisma.user.create({
      data: createData,
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

    const where: Prisma.UserWhereInput = {
      isActive: true,
    };

    if (role) {
      where.role = role;
    }

    if (divisionId) {
      where.divisionId = divisionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    // PERBAIKAN: Rename 'password' menjadi '_password' atau '_'
    // agar linter mengabaikannya (unused variable check)
    const sanitizedUsers = users.map(user => {
      const { password: _password, ...rest } = user;
      return rest;
    });

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
    const existingUser = await this.findOne(id); // Ensure exists

    // Validasi jika role diubah
    if (updateUserDto.role && updateUserDto.role !== existingUser.role) {
      await this.validateRoleAccountLimit(updateUserDto.role, id);
    }

    const sanitized = this.sanitizeUserData(updateUserDto);

    // Jika password disertakan dalam update biasa (updateUserDto), hash juga
    // Namun sebaiknya gunakan changePassword untuk keamanan lebih baik
    if (sanitized.password) {
      sanitized.password = await bcrypt.hash(sanitized.password, 10);
    }

    const updateData: Prisma.UserUncheckedUpdateInput = {
      ...sanitized,
    };

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        division: true,
      },
    });

    const { password: _password, ...result } = updated;
    return result;
  }

  // METHOD BARU: changePassword
  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    // 1. Cari user
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // 2. Verifikasi password lama
    // Jika user punya password (misal bukan login social), cek validitasnya
    if (user.password) {
      const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Kata sandi saat ini salah');
      }
    }

    // 3. Validasi: Password baru tidak boleh sama dengan password saat ini
    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('Kata sandi baru tidak boleh sama dengan kata sandi saat ini');
    }

    // 4. Hash password baru
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // 5. Update di database - juga reset mustChangePassword flag
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: false, // Reset flag setelah user ganti password
        // Opsional: revoke refresh token agar user harus login ulang
        refreshToken: null,
      },
    });

    const { password: _password, ...result } = updated;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
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

  /**
   * Verifikasi password saat ini untuk fitur kelola akun.
   * Digunakan untuk validasi real-time sebelum submit.
   */
  async verifyPassword(
    id: number,
    verifyPasswordDto: VerifyPasswordDto,
  ): Promise<{ valid: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user || !user.password) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(verifyPasswordDto.password, user.password);
    return { valid: isMatch };
  }
}
