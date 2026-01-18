import { IsArray, IsOptional, IsString } from 'class-validator';

export class ProcessReturnDto {
  @IsArray()
  @IsString({ each: true })
  acceptedAssetIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rejectedAssetIds?: string[];
}
