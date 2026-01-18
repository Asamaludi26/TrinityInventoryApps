import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("✅ Database connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("🔌 Database disconnected");
  }

  /**
   * Soft delete helper - marks record as deleted without removing
   */
  async softDelete(model: string, id: number | string) {
    return (this as any)[model].update({
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
