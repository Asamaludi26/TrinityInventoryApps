import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDivisionDto {
  @IsNotEmpty({ message: 'Nama divisi wajib diisi' })
  @IsString()
  name: string;
}
