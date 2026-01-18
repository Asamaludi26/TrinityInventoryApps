import { IsOptional, IsObject } from "class-validator";

export class CompleteDismantleDto {
  @IsOptional()
  @IsObject()
  assetConditions?: Record<string, string>; // { assetId: 'GOOD' | 'DAMAGED' }
}
