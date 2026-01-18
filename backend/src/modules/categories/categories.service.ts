import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateTypeDto } from './dto/create-type.dto';
import { CreateModelDto } from './dto/create-model.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Strip unknown fields from category DTO to prevent Prisma validation errors.
   * Frontend may send nested objects (types) or extra fields that Prisma doesn't accept.
   */
  private sanitizeCategoryData(dto: Partial<CreateCategoryDto>): Partial<CreateCategoryDto> {
    const { name, isCustomerInstallable, associatedDivisions } = dto as any;
    const sanitized: Partial<CreateCategoryDto> = {};

    if (name !== undefined) sanitized.name = name;
    if (isCustomerInstallable !== undefined)
      sanitized.isCustomerInstallable = isCustomerInstallable;
    if (associatedDivisions !== undefined) sanitized.associatedDivisions = associatedDivisions;

    return sanitized;
  }

  /**
   * Strip unknown fields from type DTO
   */
  private sanitizeTypeData(dto: Partial<CreateTypeDto>): Partial<CreateTypeDto> {
    const { categoryId, name, classification, trackingMethod, unitOfMeasure } = dto as any;
    const sanitized: Partial<CreateTypeDto> = {};

    if (categoryId !== undefined) sanitized.categoryId = categoryId;
    if (name !== undefined) sanitized.name = name;
    if (classification !== undefined) sanitized.classification = classification;
    if (trackingMethod !== undefined) sanitized.trackingMethod = trackingMethod;
    if (unitOfMeasure !== undefined) sanitized.unitOfMeasure = unitOfMeasure;

    return sanitized;
  }

  /**
   * Strip unknown fields from model DTO
   */
  private sanitizeModelData(dto: Partial<CreateModelDto>): Partial<CreateModelDto> {
    const { typeId, name, brand, bulkType, unitOfMeasure, baseUnitOfMeasure, quantityPerUnit } =
      dto as any;
    const sanitized: Partial<CreateModelDto> = {};

    if (typeId !== undefined) sanitized.typeId = typeId;
    if (name !== undefined) sanitized.name = name;
    if (brand !== undefined) sanitized.brand = brand;
    if (bulkType !== undefined) sanitized.bulkType = bulkType;
    if (unitOfMeasure !== undefined) sanitized.unitOfMeasure = unitOfMeasure;
    if (baseUnitOfMeasure !== undefined) sanitized.baseUnitOfMeasure = baseUnitOfMeasure;
    if (quantityPerUnit !== undefined) sanitized.quantityPerUnit = quantityPerUnit;

    return sanitized;
  }

  // --- Categories ---
  async createCategory(dto: CreateCategoryDto) {
    const sanitized = this.sanitizeCategoryData(dto);
    return this.prisma.assetCategory.create({
      data: sanitized as CreateCategoryDto,
    });
  }

  async findAllCategories() {
    return this.prisma.assetCategory.findMany({
      where: { deletedAt: null },
      include: {
        types: {
          where: { deletedAt: null },
          include: {
            models: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneCategory(id: number) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
      include: {
        types: {
          where: { deletedAt: null },
          include: { models: { where: { deletedAt: null } } },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} tidak ditemukan`);
    }

    return category;
  }

  async updateCategory(id: number, dto: Partial<CreateCategoryDto>) {
    await this.findOneCategory(id);
    const sanitized = this.sanitizeCategoryData(dto);
    return this.prisma.assetCategory.update({
      where: { id },
      data: sanitized,
    });
  }

  async removeCategory(id: number) {
    await this.findOneCategory(id);
    return this.prisma.assetCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- Types ---
  async createType(dto: CreateTypeDto) {
    const sanitized = this.sanitizeTypeData(dto);
    return this.prisma.assetType.create({
      data: sanitized as CreateTypeDto,
      include: { category: true },
    });
  }

  async findAllTypes(categoryId?: number) {
    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.assetType.findMany({
      where,
      include: { category: true, models: { where: { deletedAt: null } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOneType(id: number) {
    const type = await this.prisma.assetType.findUnique({
      where: { id },
      include: { category: true, models: { where: { deletedAt: null } } },
    });

    if (!type) {
      throw new NotFoundException(`Type ${id} tidak ditemukan`);
    }

    return type;
  }

  async updateType(id: number, dto: Partial<CreateTypeDto>) {
    await this.findOneType(id);
    const sanitized = this.sanitizeTypeData(dto);
    return this.prisma.assetType.update({
      where: { id },
      data: sanitized,
    });
  }

  async removeType(id: number) {
    await this.findOneType(id);
    return this.prisma.assetType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- Models ---
  async createModel(dto: CreateModelDto) {
    const sanitized = this.sanitizeModelData(dto);
    return this.prisma.assetModel.create({
      data: sanitized as CreateModelDto,
      include: { type: { include: { category: true } } },
    });
  }

  async findAllModels(typeId?: number) {
    const where: any = { deletedAt: null };
    if (typeId) where.typeId = typeId;

    return this.prisma.assetModel.findMany({
      where,
      include: { type: { include: { category: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOneModel(id: number) {
    const model = await this.prisma.assetModel.findUnique({
      where: { id },
      include: { type: { include: { category: true } } },
    });

    if (!model) {
      throw new NotFoundException(`Model ${id} tidak ditemukan`);
    }

    return model;
  }

  async updateModel(id: number, dto: Partial<CreateModelDto>) {
    await this.findOneModel(id);
    const sanitized = this.sanitizeModelData(dto);
    return this.prisma.assetModel.update({
      where: { id },
      data: sanitized,
    });
  }

  async removeModel(id: number) {
    await this.findOneModel(id);
    return this.prisma.assetModel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- Bulk Operations ---
  /**
   * Update multiple categories in a single transaction.
   * Used for reordering or bulk updates from frontend.
   */
  async updateBulk(categories: Array<{ id: number; [key: string]: any }>) {
    // Validate that all items have ID
    const validCategories = categories.filter((cat) => cat.id && typeof cat.id === 'number');

    if (validCategories.length === 0) {
      return [];
    }

    // Use transaction for atomicity and better performance
    return this.prisma.$transaction(
      validCategories.map((category) => {
        const { id, ...dataToUpdate } = category;
        // Sanitize data to only include valid fields
        const sanitized = this.sanitizeCategoryData(dataToUpdate);

        return this.prisma.assetCategory.update({
          where: { id },
          data: sanitized,
        });
      }),
    );
  }
}
