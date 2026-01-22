import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { RequestsModule } from './modules/requests/requests.module';
import { LoansModule } from './modules/loans/loans.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthController } from './common/health/health.controller';
import { THROTTLE_TTL, THROTTLE_LIMIT } from './common/constants';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    // ==========================================================================
    // Configuration
    // ==========================================================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      expandVariables: true,
    }),

    // ==========================================================================
    // Rate Limiting (Security)
    // ==========================================================================
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: config.get<number>('THROTTLE_TTL', THROTTLE_TTL),
            limit: config.get<number>('THROTTLE_LIMIT', THROTTLE_LIMIT),
          },
          {
            name: 'long',
            ttl: 60000, // 1 minute
            limit: 1000, // 1000 requests per minute for general use
          },
        ],
      }),
    }),

    // ==========================================================================
    // Database
    // ==========================================================================
    PrismaModule,
    PrismaService,

    // ==========================================================================
    // Feature Modules
    // ==========================================================================
    AuthModule,
    UsersModule,
    AssetsModule,
    RequestsModule,
    LoansModule,
    TransactionsModule,
    CustomersModule,
    CategoriesModule,
    DashboardModule,
    NotificationsModule,
    ActivityLogsModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  exports: [PrismaService],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
