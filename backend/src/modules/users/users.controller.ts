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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    // JIKA KOSONG: Paksa jadi 0. JIKA ADA: Ubah String ke Int
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,

    // JIKA KOSONG: Paksa jadi 10. JIKA ADA: Ubah String ke Int
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,

    // Optional params biarkan apa adanya
    @Query('role') role?: UserRole,
    @Query('divisionId', new ParseIntPipe({ optional: true })) divisionId?: number,
    @Query('search') search?: string,
  ) {
    // Console log ini akan muncul di terminal backend saat Anda refresh frontend
    // console.log('✅ GET /users Request:', { skip, take, role, divisionId, search });

    return this.usersService.findAll({ skip, take, role, divisionId, search });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Patch(':id/reset-password')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body('password') password: string) {
    return this.usersService.resetPassword(id, password);
  }

  @Patch(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body('permissions') permissions: string[],
  ) {
    return this.usersService.updatePermissions(id, permissions);
  }
}
