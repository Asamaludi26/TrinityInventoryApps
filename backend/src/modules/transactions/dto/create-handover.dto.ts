import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartyType } from '@prisma/client';

class HandoverItemDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsOptional()
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateHandoverDto {
  @IsNotEmpty()
  @IsDateString()
  handoverDate: string;

  @IsNotEmpty()
  @IsString()
  giverName: string;

  @IsOptional()
  @IsEnum(PartyType)
  giverType?: PartyType;

  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @IsOptional()
  @IsEnum(PartyType)
  receiverType?: PartyType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HandoverItemDto)
  items: HandoverItemDto[];
}
