import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * Common filter options for date ranges
 */
export class DateRangeFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * Common filter options for status-based entities
 */
export class StatusFilterDto {
  @IsOptional()
  @IsString()
  status?: string;
}
