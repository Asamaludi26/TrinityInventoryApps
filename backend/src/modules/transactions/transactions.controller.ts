import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { HandoversService } from "./handovers.service";
import { InstallationsService } from "./installations.service";
import { DismantlesService } from "./dismantles.service";
import { MaintenancesService } from "./maintenances.service";
import { CreateHandoverDto } from "./dto/create-handover.dto";
import { CreateInstallationDto } from "./dto/create-installation.dto";
import { CreateDismantleDto } from "./dto/create-dismantle.dto";
import { CompleteDismantleDto } from "./dto/complete-dismantle.dto";
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole, DismantleStatus, MaintenanceStatus } from "@prisma/client";

@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private handoversService: HandoversService,
    private installationsService: InstallationsService,
    private dismantlesService: DismantlesService,
    private maintenancesService: MaintenancesService,
  ) {}

  // --- HANDOVERS ---
  @Post("handovers")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  createHandover(@Body() dto: CreateHandoverDto) {
    return this.handoversService.create(dto);
  }

  @Get("handovers")
  findAllHandovers(@Query("skip") skip?: number, @Query("take") take?: number) {
    return this.handoversService.findAll({ skip, take });
  }

  @Get("handovers/:id")
  findOneHandover(@Param("id") id: string) {
    return this.handoversService.findOne(id);
  }

  // --- INSTALLATIONS ---
  @Post("installations")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.TEKNISI)
  createInstallation(@Body() dto: CreateInstallationDto) {
    return this.installationsService.create(dto);
  }

  @Get("installations")
  findAllInstallations(
    @Query("skip") skip?: number,
    @Query("take") take?: number,
    @Query("customerId") customerId?: string,
  ) {
    return this.installationsService.findAll({ skip, take, customerId });
  }

  @Get("installations/:id")
  findOneInstallation(@Param("id") id: string) {
    return this.installationsService.findOne(id);
  }

  // --- DISMANTLES ---
  @Post("dismantles")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.TEKNISI)
  createDismantle(@Body() dto: CreateDismantleDto) {
    return this.dismantlesService.create(dto);
  }

  @Get("dismantles")
  findAllDismantles(
    @Query("skip") skip?: number,
    @Query("take") take?: number,
    @Query("status") status?: DismantleStatus,
  ) {
    return this.dismantlesService.findAll({ skip, take, status });
  }

  @Get("dismantles/:id")
  findOneDismantle(@Param("id") id: string) {
    return this.dismantlesService.findOne(id);
  }

  @Patch("dismantles/:id/complete")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  completeDismantle(
    @Param("id") id: string,
    @Body() dto: CompleteDismantleDto,
    @CurrentUser("name") userName: string,
  ) {
    return this.dismantlesService.complete(id, dto, userName);
  }

  // --- MAINTENANCES ---
  @Post("maintenances")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.TEKNISI)
  createMaintenance(@Body() dto: CreateMaintenanceDto) {
    return this.maintenancesService.create(dto);
  }

  @Get("maintenances")
  findAllMaintenances(
    @Query("skip") skip?: number,
    @Query("take") take?: number,
    @Query("status") status?: MaintenanceStatus,
    @Query("assetId") assetId?: string,
  ) {
    return this.maintenancesService.findAll({ skip, take, status, assetId });
  }

  @Get("maintenances/:id")
  findOneMaintenance(@Param("id") id: string) {
    return this.maintenancesService.findOne(id);
  }

  @Patch("maintenances/:id/complete")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.TEKNISI)
  @HttpCode(HttpStatus.OK)
  completeMaintenance(
    @Param("id") id: string,
    @Body("actionTaken") actionTaken: string,
    @Body("laborCost") laborCost?: number,
    @Body("partsCost") partsCost?: number,
  ) {
    return this.maintenancesService.complete(
      id,
      actionTaken,
      laborCost,
      partsCost,
    );
  }
}
