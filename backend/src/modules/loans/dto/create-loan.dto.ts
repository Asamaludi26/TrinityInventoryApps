import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoanItemDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNumber()
  quantity: number;
}

export class CreateLoanDto {
  @IsNotEmpty()
  @IsDateString()
  requestDate: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsDateString()
  expectedReturn?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanItemDto)
  items: LoanItemDto[];
}
