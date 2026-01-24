import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateTypeDto } from './dto/create-type.dto';
import { CreateModelDto } from './dto/create-model.dto';
// PERBAIKAN: Import Prisma untuk akses tipe WhereInput dan UpdateInput
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Strip unknown fields from category DTO to prevent Prisma validation errors.
   * Frontend may send nested objects (types) or extra fields that Prisma doesn't accept.
   */
  private sanitizeCategoryData(dto: Partial<CreateCategoryDto>): Partial<CreateCategoryDto> {
    // PERBAIKAN: Menghapus 'as any'. Kita ambil prop dari dto secara langsung.
    // Jika properti opsional, tipe akan string | undefined, yang ditangani oleh if check.
    const { name, isCustomerInstallable, associatedDivisions } = dto;
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
    // PERBAIKAN: Menghapus 'as any'
    const { categoryId, name, classification, trackingMethod, unitOfMeasure } = dto;
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
    // PERBAIKAN: Menghapus 'as any'
    const { typeId, name, brand, bulkType, unitOfMeasure, baseUnitOfMeasure, quantityPerUnit } =
      dto;
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
    const { associatedDivisions, ...rest } = dto;

    return this.prisma.assetCategory.create({
      data: {
        ...rest,
        // Handle relation to Division - use connect with array of ids
        ...(associatedDivisions && associatedDivisions.length > 0
          ? {
              associatedDivisions: {
                connect: associatedDivisions.map(id => ({ id })),
              },
            }
          : {}),
      },
      include: {
        associatedDivisions: true,
      },
    });
  }

  async findAllCategories() {
    return this.prisma.assetCategory.findMany({
      include: {
        types: {
          include: {
            standardItems: true,
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
          include: { standardItems: true },
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
    const { associatedDivisions, ...rest } = dto;

    return this.prisma.assetCategory.update({
      where: { id },
      data: {
        ...rest,
        // Handle relation - set replaces existing connections
        ...(associatedDivisions !== undefined
          ? {
              associatedDivisions: {
                set: associatedDivisions.map(divId => ({ id: divId })),
              },
            }
          : {}),
      },
      include: {
        associatedDivisions: true,
      },
    });
  }

  async removeCategory(id: number) {
    await this.findOneCategory(id);
    return this.prisma.assetCategory.delete({
      where: { id },
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
    // PERBAIKAN BARIS 146: Menggunakan Prisma.AssetTypeWhereInput
    const where: Prisma.AssetTypeWhereInput = {};
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.assetType.findMany({
      where,
      include: { category: true, standardItems: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOneType(id: number) {
    const type = await this.prisma.assetType.findUnique({
      where: { id },
      include: { category: true, standardItems: true },
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
    return this.prisma.assetType.delete({
      where: { id },
    });
  }

  // --- StandardItems (Models) ---
  async createModel(dto: CreateModelDto) {
    const sanitized = this.sanitizeModelData(dto);
    return this.prisma.standardItem.create({
      data: sanitized as CreateModelDto,
      include: { type: { include: { category: true } } },
    });
  }

  async findAllModels(typeId?: number) {
    // PERBAIKAN BARIS 195: Menggunakan Prisma.StandardItemWhereInput
    const where: Prisma.StandardItemWhereInput = {};
    if (typeId) where.typeId = typeId;

    return this.prisma.standardItem.findMany({
      where,
      include: { type: { include: { category: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOneModel(id: number) {
    const model = await this.prisma.standardItem.findUnique({
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
    return this.prisma.standardItem.update({
      where: { id },
      data: sanitized,
    });
  }

  async removeModel(id: number) {
    await this.findOneModel(id);
    return this.prisma.standardItem.delete({
      where: { id },
    });
  }

  // --- Bulk Operations ---
  /**
   * Update multiple categories in a single transaction.
   * Used for reordering or bulk updates from frontend.
   */
  async updateBulk(
    // PERBAIKAN BARIS 239: Menggunakan 'unknown' alih-alih 'any'
    categories: Array<{ id: number } & Record<string, unknown>>,
  ) {
    // Validate that all items have ID
    const validCategories = categories.filter(cat => cat.id && typeof cat.id === 'number');

    if (validCategories.length === 0) {
      return [];
    }

    // Use transaction for atomicity and better performance
    return this.prisma.$transaction(
      validCategories.map(category => {
        const { id, associatedDivisions, ...rest } = category;

        // Type assertion yang aman karena kita tahu struktur rest akan masuk ke Prisma
        const updateData = rest as Prisma.AssetCategoryUpdateInput;

        return this.prisma.assetCategory.update({
          where: { id },
          data: {
            ...updateData,
            // Handle relation - set replaces existing connections
            ...(associatedDivisions !== undefined && Array.isArray(associatedDivisions)
              ? {
                  associatedDivisions: {
                    set: associatedDivisions.map((divId: number) => ({
                      id: divId,
                    })),
                  },
                }
              : {}),
          },
        });
      }),
    );
  }
}
