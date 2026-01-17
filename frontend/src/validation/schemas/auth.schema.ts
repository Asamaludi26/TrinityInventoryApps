/**
 * Authentication Validation Schemas
 *
 * Zod schemas for login, password reset, and user session validation.
 */

import { z } from "zod";

// --- LOGIN ---

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// --- PASSWORD CHANGE ---

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Password saat ini wajib diisi" })
      .min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string({ required_error: "Password baru wajib diisi" })
      .min(8, "Password baru minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka",
      ),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi" })
      .min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password saat ini",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// --- PASSWORD RESET REQUEST ---

export const passwordResetRequestSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Format email tidak valid"),
});

export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;

// --- PASSWORD RESET (by Admin) ---

export const adminResetPasswordSchema = z
  .object({
    newPassword: z
      .string({ required_error: "Password baru wajib diisi" })
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka",
      ),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi" })
      .min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;
