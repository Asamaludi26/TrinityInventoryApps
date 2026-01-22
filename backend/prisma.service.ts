import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Method ini dipanggil otomatis saat aplikasi menyala
  async onModuleInit() {
    await this.$connect();
  }

  // Method ini dipanggil otomatis saat aplikasi mati (cleanup)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
