import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, CreateBulkAssetsDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ConsumeStockDto } from './dto/consume-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, AssetStatus } from '@prisma/client';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  createBulk(@Body() dto: CreateBulkAssetsDto) {
    return this.assetsService.createBulk(dto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: AssetStatus,
    @Query('name') name?: string,
    @Query('brand') brand?: string,
    @Query('location') location?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.assetsService.findAll({
      skip,
      take,
      status,
      name,
      brand,
      location,
      customerId,
      search,
    });
  }

  @Get('stock-summary')
  getStockSummary() {
    return this.assetsService.getStockSummary();
  }

  @Get('stock-movements')
  getStockMovements(
    @Query('assetName') assetName?: string,
    @Query('brand') brand?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.assetsService.getStockMovements({
      assetName,
      brand,
      type,
      startDate,
      endDate,
    });
  }

  @Get('check-availability')
  checkAvailability(
    @Query('name') name: string,
    @Query('brand') brand: string,
    @Query('quantity') quantity: number,
  ) {
    return this.assetsService.checkAvailability(name, brand, quantity);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.TEKNISI)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AssetStatus,
    @CurrentUser('name') userName: string,
  ) {
    return this.assetsService.updateStatus(id, status, userName);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Post('consume')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK, UserRole.TEKNISI)
  consumeStock(@Body() dto: ConsumeStockDto) {
    return this.assetsService.consumeStock(dto);
  }
}
