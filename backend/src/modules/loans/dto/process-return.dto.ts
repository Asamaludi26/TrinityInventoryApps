import { IsArray, IsOptional } from "class-validator";

export class ProcessReturnDto {
  @IsArray()
  acceptedAssetIds: string[];

  @IsOptional()
  @IsArray()
  rejectedAssetIds?: string[];
}
