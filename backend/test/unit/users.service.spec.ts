import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    role: UserRole.STAFF,
    divisionId: 1,
    division: { id: 1, name: 'Engineering' },
    permissions: [],
    passwordResetRequested: false,
    passwordResetRequestDate: null,
    // Type assertion ini membantu saat mockUser digunakan di tempat lain
    deletedAt: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDivision = {
    id: 1,
    name: 'Engineering',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            division: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.division.findUnique as jest.Mock).mockResolvedValue(mockDivision);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        divisionId: 1,
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: '$2b$10$hashedpassword',
          }),
        }),
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if division not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.division.findUnique as jest.Mock).mockResolvedValue(null);

      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        divisionId: 999,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update(1, { name: 'Updated Name' });

      // Password should be excluded from result
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should hash password when updating', async () => {
      const updatedUser = { ...mockUser, password: '$2b$10$newhashedpassword' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      await service.update(1, { password: 'newpassword' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: '$2b$10$hashedpassword',
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      // Mock return value yang memiliki deletedAt terisi
      const deletedUser = {
        ...mockUser,
        deletedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(deletedUser);

      const result = await service.remove(1);

      /**
       * PERBAIKAN UTAMA:
       * Menggunakan casting '(result as any)' karena TypeScript menganggap tipe 'User'
       * dari Prisma belum memiliki properti 'deletedAt' secara definisi statis.
       */
      expect((result as any).deletedAt).not.toBeNull();
      expect((result as any).deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with hashed value', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await service.resetPassword(1, 'newpassword');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          password: '$2b$10$hashedpassword',
          passwordResetRequested: false,
          passwordResetRequestDate: null,
        }),
      });
    });
  });
});
