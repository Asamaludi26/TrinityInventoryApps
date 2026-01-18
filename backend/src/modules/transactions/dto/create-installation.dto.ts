import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
} from "class-validator";

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
  assetsInstalled: Array<{
    assetId: string;
    name: string;
    serialNumber?: string;
  }>;

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
