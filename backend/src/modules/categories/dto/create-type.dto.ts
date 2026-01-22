import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ItemClassification, TrackingMethod } from '@prisma/client';

export class CreateTypeDto {
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty({ message: 'Nama tipe wajib diisi' })
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(ItemClassification)
  classification?: ItemClassification;

  @IsOptional()
  @IsEnum(TrackingMethod)
  trackingMethod?: TrackingMethod;

  @IsOptional()
  @IsString()
  unitOfMeasure?: string;
}
