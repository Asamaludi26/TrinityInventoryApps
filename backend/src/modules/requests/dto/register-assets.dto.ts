import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

class AssetRegistrationDto {
  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsNumber()
  requestItemId?: number;

  @IsOptional()
  @IsInt()
  categoryId?: number;
}

export class RegisterAssetsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetRegistrationDto)
  assets: AssetRegistrationDto[];
}
