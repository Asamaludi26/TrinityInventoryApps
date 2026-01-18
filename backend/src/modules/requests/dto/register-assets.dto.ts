import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

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
}

export class RegisterAssetsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetRegistrationDto)
  assets: AssetRegistrationDto[];
}
