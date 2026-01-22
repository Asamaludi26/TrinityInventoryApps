import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
  IsInt,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MaintenanceMaterialDto {
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  materialAssetId?: string;
}

export class CreateMaintenanceDto {
  @IsNotEmpty()
  @IsDateString()
  maintenanceDate: string;

  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsInt()
  technicianId: number;

  @IsNotEmpty()
  @IsString()
  technicianName: string;

  @IsOptional()
  @IsString()
  problemDescription?: string;

  @IsOptional()
  @IsString()
  actionsTaken?: string;

  @IsOptional()
  @IsArray()
  workTypes?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenanceMaterialDto)
  materialsUsed?: MaintenanceMaterialDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  requestNumber?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
