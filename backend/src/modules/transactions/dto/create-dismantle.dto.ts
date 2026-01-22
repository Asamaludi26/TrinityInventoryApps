import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { AssetCondition } from '@prisma/client';

export class CreateDismantleDto {
  @IsNotEmpty()
  @IsDateString()
  dismantleDate: string;

  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  customerAddress: string;

  @IsNotEmpty()
  @IsInt()
  technicianId: number;

  @IsNotEmpty()
  @IsString()
  technicianName: string;

  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsString()
  assetName: string;

  @IsNotEmpty()
  @IsEnum(AssetCondition)
  retrievedCondition: AssetCondition;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  requestNumber?: string;
}
