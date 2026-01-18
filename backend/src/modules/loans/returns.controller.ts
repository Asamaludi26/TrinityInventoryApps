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
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProcessReturnDto } from './dto/process-return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  create(@Body() dto: CreateReturnDto, @CurrentUser('name') returnedBy: string) {
    return this.returnsService.create(dto, returnedBy);
  }

  @Get()
  findAll(@Query('loanRequestId') loanRequestId?: string) {
    return this.returnsService.findAll(loanRequestId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  update(@Param('id') id: string, @Body() data: any, @CurrentUser('name') userName: string) {
    return this.returnsService.update(id, data, userName);
  }

  @Post(':id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  @HttpCode(HttpStatus.OK)
  process(
    @Param('id') id: string,
    @Body() dto: ProcessReturnDto,
    @CurrentUser('name') userName: string,
  ) {
    return this.returnsService.processReturn(id, dto, userName);
  }

  @Post(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  @HttpCode(HttpStatus.OK)
  verify(
    @Param('id') id: string,
    @Body() dto: { acceptedAssetIds?: string[]; verifiedBy?: string; notes?: string },
    @CurrentUser('name') userName: string,
  ) {
    return this.returnsService.verifyReturn(id, dto, userName);
  }
}
