import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PASSWORD_MIN_LENGTH } from '../../../common/constants';

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @MaxLength(255, { message: 'Email terlalu panjang' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(PASSWORD_MIN_LENGTH, { message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter` })
  @MaxLength(128, { message: 'Password terlalu panjang' })
  password: string;
}
