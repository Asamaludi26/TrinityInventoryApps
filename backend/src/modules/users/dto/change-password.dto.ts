// backend/src/users/dto/change-password.dto.ts
import { IsNotEmpty, IsString, MinLength, Matches, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Kata sandi saat ini wajib diisi' })
  @IsString({ message: 'Kata sandi saat ini harus berupa teks' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @IsString({ message: 'Kata sandi baru harus berupa teks' })
  @MinLength(8, { message: 'Kata sandi baru minimal 8 karakter' })
  @MaxLength(128, { message: 'Kata sandi baru maksimal 128 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/, {
    message: 'Kata sandi baru harus mengandung huruf besar, huruf kecil, angka, dan simbol',
  })
  @Matches(/^\S+$/, { message: 'Kata sandi baru tidak boleh mengandung spasi' })
  newPassword: string;
}
