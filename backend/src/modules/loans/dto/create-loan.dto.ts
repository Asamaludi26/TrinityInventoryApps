import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
} from "class-validator";

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
  items: Array<{
    id: number;
    itemName: string;
    brand: string;
    quantity: number;
  }>;
}
