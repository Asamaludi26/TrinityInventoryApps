import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateTypeDto } from './dto/create-type.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // --- Categories ---
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get()
  findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  /**
   * PERBAIKAN BARIS 44:
   * Mengganti '[key: string]: any' menjadi '[key: string]: unknown'.
   * Ini cocok dengan signature yang sudah kita perbaiki di Service.
   */
  updateBulkCategories(@Body() categories: Array<{ id: number; [key: string]: unknown }>) {
    return this.categoriesService.updateBulk(categories);
  }

  @Get(':id')
  findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOneCategory(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCategoryDto>) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.removeCategory(id);
  }

  // --- Types ---
  @Post('types')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  createType(@Body() dto: CreateTypeDto) {
    return this.categoriesService.createType(dto);
  }

  @Get('types')
  findAllTypes(@Query('categoryId') categoryId?: number) {
    return this.categoriesService.findAllTypes(categoryId);
  }

  @Get('types/:id')
  findOneType(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOneType(id);
  }

  @Patch('types/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  updateType(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateTypeDto>) {
    return this.categoriesService.updateType(id, dto);
  }

  @Delete('types/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeType(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.removeType(id);
  }

  // --- Models ---
  @Post('models')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  createModel(@Body() dto: CreateModelDto) {
    return this.categoriesService.createModel(dto);
  }

  @Get('models')
  findAllModels(@Query('typeId') typeId?: number) {
    return this.categoriesService.findAllModels(typeId);
  }

  @Get('models/:id')
  findOneModel(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOneModel(id);
  }

  @Patch('models/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  updateModel(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateModelDto>) {
    return this.categoriesService.updateModel(id, dto);
  }

  @Delete('models/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeModel(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.removeModel(id);
  }
}
