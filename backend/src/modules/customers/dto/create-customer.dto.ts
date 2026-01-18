import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
} from "class-validator";
import { CustomerStatus } from "@prisma/client";

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty({ message: "Nama customer wajib diisi" })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: "Format email tidak valid" })
  email?: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  serviceSpeed?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
