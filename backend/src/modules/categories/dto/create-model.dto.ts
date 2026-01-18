import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from "class-validator";
import { BulkType } from "@prisma/client";

export class CreateModelDto {
  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @IsNotEmpty({ message: "Nama model wajib diisi" })
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Brand wajib diisi" })
  @IsString()
  brand: string;

  @IsOptional()
  @IsEnum(BulkType)
  bulkType?: BulkType;

  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @IsOptional()
  @IsString()
  baseUnitOfMeasure?: string;

  @IsOptional()
  @IsNumber()
  quantityPerUnit?: number;
}
