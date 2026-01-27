// backend/src/modules/users/dto/verify-password.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPasswordDto {
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  password: string;
}
