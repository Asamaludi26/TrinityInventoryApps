import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
} from "class-validator";

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
  technician: string;

  @IsArray()
  assetsRetrieved: Array<{
    assetId: string;
    name: string;
    condition: string;
  }>;

  @IsOptional()
  @IsString()
  notes?: string;
}
