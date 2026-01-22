import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemStatus } from '@prisma/client';

class HandoverItemDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNotEmpty()
  @IsString()
  itemTypeBrand: string;

  @IsNotEmpty()
  @IsString()
  conditionNotes: string;

  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateHandoverDto {
  @IsNotEmpty()
  @IsDateString()
  handoverDate: string;

  // Menyerahkan (Giver)
  @IsNotEmpty()
  @IsInt()
  menyerahkanId: number;

  @IsNotEmpty()
  @IsString()
  menyerahkanName: string;

  // Penerima (Receiver)
  @IsNotEmpty()
  @IsInt()
  penerimaId: number;

  @IsNotEmpty()
  @IsString()
  penerimaName: string;

  // Mengetahui (Acknowledger)
  @IsNotEmpty()
  @IsInt()
  mengetahuiId: number;

  @IsNotEmpty()
  @IsString()
  mengetahuiName: string;

  @IsOptional()
  @IsString()
  woRoIntNumber?: string;

  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HandoverItemDto)
  items: HandoverItemDto[];
}
