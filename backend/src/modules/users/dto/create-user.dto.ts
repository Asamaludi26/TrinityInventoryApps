import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsString,
} from "class-validator";
import { UserRole } from "@prisma/client";

export class CreateUserDto {
  @IsEmail({}, { message: "Format email tidak valid" })
  @IsNotEmpty({ message: "Email wajib diisi" })
  email: string;

  @IsNotEmpty({ message: "Password wajib diisi" })
  @MinLength(6, { message: "Password minimal 6 karakter" })
  password: string;

  @IsNotEmpty({ message: "Nama wajib diisi" })
  name: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Role tidak valid" })
  role?: UserRole;

  @IsOptional()
  @IsInt({ message: "Division ID harus berupa angka" })
  divisionId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
