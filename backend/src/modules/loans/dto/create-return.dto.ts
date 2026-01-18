import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCondition } from '@prisma/client';

export class ReturnItemDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsEnum(AssetCondition)
  condition: AssetCondition;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReturnDto {
  @IsNotEmpty()
  @IsString()
  loanRequestId: string;

  @IsNotEmpty()
  @IsDateString()
  returnDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}
