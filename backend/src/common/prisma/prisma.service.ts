import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // PERBAIKAN: Inisialisasi Logger NestJS
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    // PERBAIKAN BARIS 21: Gunakan logger.log
    this.logger.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    // PERBAIKAN BARIS 26: Gunakan logger.log
    this.logger.log('🔌 Database disconnected');
  }

  /**
   * Soft delete helper - marks record as deleted without removing
   */
  async softDelete(model: string, id: number | string) {
    /**
     * PERBAIKAN BARIS 44:
     * Mendefinisikan tipe Delegate secara spesifik alih-alih menggunakan 'any'.
     * Kita memberi tahu TypeScript bahwa model yang dipanggil pasti memiliki method 'update'
     * dengan struktur argumen tertentu.
     */
    type SoftDeleteDelegate = {
      update: (args: {
        where: { id: number | string };
        data: { deletedAt: Date };
      }) => Promise<unknown>;
    };

    return (this as unknown as Record<string, SoftDeleteDelegate>)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Exclude soft-deleted records in queries
   */
  excludeDeleted() {
    return { deletedAt: null };
  }
}
