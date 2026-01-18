import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isCustomerInstallable?: boolean;

  @IsOptional()
  @IsArray()
  associatedDivisions?: number[];
}
