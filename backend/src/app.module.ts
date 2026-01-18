import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { RequestsModule } from "./modules/requests/requests.module";
import { LoansModule } from "./modules/loans/loans.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ActivityLogsModule } from "./modules/activity-logs/activity-logs.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { HealthController } from "./common/health/health.controller";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database
    PrismaModule,

    // Feature Modules
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
})
export class AppModule {}
