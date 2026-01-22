import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RegisterAssetsDto } from './dto/register-assets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, ItemStatus } from '@prisma/client';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto, @CurrentUser('id') userId: number) {
    return this.requestsService.create(createRequestDto, userId);
  }

  @Get()
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: ItemStatus,
    @Query('requesterId') requesterId?: number,
    @Query('division') division?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.requestsService.findAll({
      skip,
      take,
      status,
      requesterId,
      division,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.ADMIN_PURCHASE)
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(id, updateRequestDto);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.ADMIN_PURCHASE)
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
    @CurrentUser('name') approverName: string,
  ) {
    return this.requestsService.approveRequest(id, dto, approverName);
  }

  @Post(':id/register-assets')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  @HttpCode(HttpStatus.OK)
  registerAssets(
    @Param('id') id: string,
    @Body() dto: RegisterAssetsDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('name') userName: string,
  ) {
    return this.requestsService.registerAssets(id, dto, userId, userName);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.ADMIN_PURCHASE)
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('name') userName: string,
  ) {
    return this.requestsService.reject(id, reason, userId, userName);
  }

  @Patch(':id/arrived')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.ADMIN_PURCHASE)
  markArrived(@Param('id') id: string) {
    return this.requestsService.markArrived(id);
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  complete(@Param('id') id: string) {
    return this.requestsService.complete(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('name') userName: string,
  ) {
    return this.requestsService.cancel(id, reason, userId, userName);
  }
}
