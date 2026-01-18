import { IsOptional, IsEnum, IsNumber, IsString, IsObject } from 'class-validator';

export class ItemAdjustmentDto {
  @IsNumber()
  approvedQuantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveRequestDto {
  @IsEnum(['logistic', 'purchase'])
  approvalType: 'logistic' | 'purchase';

  @IsOptional()
  @IsObject()
  itemAdjustments?: Record<number, ItemAdjustmentDto>;
}
