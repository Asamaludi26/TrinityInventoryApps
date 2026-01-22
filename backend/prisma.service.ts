import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Ambil URL Database dari environment
    const connectionString = process.env.DATABASE_URL;

    // 2. Buat Connection Pool (Jembatan fisik ke DB)
    const pool = new Pool({
      connectionString,
      // Opsional: set max connection agar tidak membebani Docker
      max: 10,
    });

    // 3. Pasang Adapter Prisma di atas Pool
    const adapter = new PrismaPg(pool);

    // 4. Inisialisasi PrismaClient dengan Adapter tersebut
    super({
      adapter,
      // Opsional: Aktifkan log untuk monitoring
      log: ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
