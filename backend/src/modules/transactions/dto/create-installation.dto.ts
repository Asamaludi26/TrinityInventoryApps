import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InstalledAssetDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;
}

export class MaterialUsedDto {
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateInstallationDto {
  @IsNotEmpty()
  @IsDateString()
  installDate: string;

  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  technician: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstalledAssetDto)
  assetsInstalled: InstalledAssetDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialUsedDto)
  materialsUsed?: MaterialUsedDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
