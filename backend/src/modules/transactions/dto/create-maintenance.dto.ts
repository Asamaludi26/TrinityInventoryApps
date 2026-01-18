import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { MaintenanceType } from '@prisma/client';

export class CreateMaintenanceDto {
  @IsNotEmpty()
  @IsDateString()
  maintenanceDate: string;

  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @IsOptional()
  @IsString()
  problemDescription?: string;

  @IsNotEmpty()
  @IsString()
  technician: string;

  @IsOptional()
  @IsArray()
  materialsUsed?: Array<{
    itemName: string;
    quantity: number;
    unit?: string;
  }>;

  @IsOptional()
  @IsString()
  notes?: string;
}
