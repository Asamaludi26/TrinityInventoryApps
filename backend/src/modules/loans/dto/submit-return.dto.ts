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

  @IsOptional()
  @IsString()
  assetName?: string;

  @IsOptional()
  @IsEnum(AssetCondition)
  condition?: AssetCondition;

  @IsOptional()
  @IsEnum(AssetCondition)
  returnedCondition?: AssetCondition;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmitReturnDto {
  @IsOptional()
  @IsString()
  loanRequestId?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
