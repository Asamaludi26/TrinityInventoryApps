import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ConsumeItemDto {
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

class ConsumeContextDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  technician?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class ConsumeStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumeItemDto)
  items: ConsumeItemDto[];

  @ValidateNested()
  @Type(() => ConsumeContextDto)
  context: ConsumeContextDto;
}
