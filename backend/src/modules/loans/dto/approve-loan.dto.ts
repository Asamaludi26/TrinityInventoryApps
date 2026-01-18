import { IsObject } from 'class-validator';

export class ApproveLoanDto {
  @IsObject()
  assignedAssetIds: Record<string, string[]>; // { itemId: [assetId1, assetId2] }
}
