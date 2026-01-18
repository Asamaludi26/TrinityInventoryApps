import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateTypeDto } from "./dto/create-type.dto";
import { CreateModelDto } from "./dto/create-model.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // --- Categories ---
  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.assetCategory.create({
      data: dto,
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
      orderBy: { name: "asc" },
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
    return this.prisma.assetCategory.update({
      where: { id },
      data: dto,
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
    return this.prisma.assetType.create({
      data: dto,
      include: { category: true },
    });
  }

  async findAllTypes(categoryId?: number) {
    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.assetType.findMany({
      where,
      include: { category: true, models: { where: { deletedAt: null } } },
      orderBy: { name: "asc" },
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
    return this.prisma.assetType.update({
      where: { id },
      data: dto,
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
    return this.prisma.assetModel.create({
      data: dto,
      include: { type: { include: { category: true } } },
    });
  }

  async findAllModels(typeId?: number) {
    const where: any = { deletedAt: null };
    if (typeId) where.typeId = typeId;

    return this.prisma.assetModel.findMany({
      where,
      include: { type: { include: { category: true } } },
      orderBy: { name: "asc" },
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
    return this.prisma.assetModel.update({
      where: { id },
      data: dto,
    });
  }

  async removeModel(id: number) {
    await this.findOneModel(id);
    return this.prisma.assetModel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
