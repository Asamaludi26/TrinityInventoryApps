import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderType, AllocationTarget } from "@prisma/client";

class RequestItemDto {
  @IsNotEmpty({ message: "Nama item wajib diisi" })
  @IsString()
  itemName: string;

  @IsNotEmpty({ message: "Tipe/brand wajib diisi" })
  @IsString()
  itemTypeBrand: string;

  @IsNotEmpty({ message: "Jumlah wajib diisi" })
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateRequestDto {
  @IsNotEmpty({ message: "Divisi wajib diisi" })
  @IsString()
  division: string;

  @IsNotEmpty({ message: "Tanggal request wajib diisi" })
  @IsDateString()
  requestDate: string;

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsEnum(AllocationTarget)
  allocationTarget?: AllocationTarget;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  items: RequestItemDto[];
}
