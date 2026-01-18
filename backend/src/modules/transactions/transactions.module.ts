import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { HandoversService } from './handovers.service';
import { InstallationsService } from './installations.service';
import { DismantlesService } from './dismantles.service';
import { MaintenancesService } from './maintenances.service';

@Module({
  controllers: [TransactionsController],
  providers: [HandoversService, InstallationsService, DismantlesService, MaintenancesService],
  exports: [HandoversService, InstallationsService, DismantlesService, MaintenancesService],
})
export class TransactionsModule {}
