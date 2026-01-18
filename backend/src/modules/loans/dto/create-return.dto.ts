import { IsString, IsNotEmpty, IsDateString, IsArray } from "class-validator";

export class CreateReturnDto {
  @IsNotEmpty()
  @IsString()
  loanRequestId: string;

  @IsNotEmpty()
  @IsDateString()
  returnDate: string;

  @IsArray()
  items: Array<{
    assetId: string;
    condition: string;
    notes?: string;
  }>;
}
