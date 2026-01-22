import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { SubmitReturnDto } from './dto/submit-return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, LoanRequestStatus } from '@prisma/client';
import { User } from '@prisma/client';

@Controller('loan-requests')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() dto: CreateLoanDto, @CurrentUser('id') userId: number) {
    return this.loansService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: LoanRequestStatus,
    @Query('requesterId') requesterId?: number,
  ) {
    return this.loansService.findAll({ skip, take, status, requesterId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @Body() dto: ApproveLoanDto, @CurrentUser() user: User) {
    return this.loansService.approve(id, dto, user.id, user.name);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: User) {
    return this.loansService.reject(id, reason, user.id, user.name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.loansService.delete(id, user.id, user.name);
  }

  @Post(':id/return')
  @HttpCode(HttpStatus.OK)
  submitReturn(@Param('id') id: string, @Body() dto: SubmitReturnDto, @CurrentUser() user: User) {
    return this.loansService.submitReturn(id, dto, user.id, user.name);
  }
}
