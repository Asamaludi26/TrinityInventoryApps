import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  /**
   * Password bersifat opsional saat membuat user baru.
   * Jika tidak diisi, sistem akan menggunakan password standar (Trinity@2026)
   * dan user wajib menggantinya saat login pertama kali.
   */
  @IsOptional()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(128, { message: 'Password maksimal 128 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
  })
  password?: string;

  @IsNotEmpty({ message: 'Nama wajib diisi' })
  name: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role tidak valid' })
  role?: UserRole;

  @IsOptional()
  @IsInt({ message: 'Division ID harus berupa angka' })
  divisionId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
