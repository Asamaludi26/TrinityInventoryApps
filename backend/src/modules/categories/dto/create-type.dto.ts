import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from "class-validator";
import { AssetClassification, TrackingMethod } from "@prisma/client";

export class CreateTypeDto {
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty({ message: "Nama tipe wajib diisi" })
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(AssetClassification)
  classification?: AssetClassification;

  @IsOptional()
  @IsEnum(TrackingMethod)
  trackingMethod?: TrackingMethod;

  @IsOptional()
  @IsString()
  unitOfMeasure?: string;
}
