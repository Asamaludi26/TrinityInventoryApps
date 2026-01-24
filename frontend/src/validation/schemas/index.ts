/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for all forms in the application.
 * Using Zod for type-safe validation with Indonesian error messages.
 *
 * @module validation/schemas
 * @version 1.0.0
 */

import { z } from "zod";

// ============================================================================
// Common Schema Builders
// ============================================================================

/**
 * Required string with custom message
 */
export const requiredString = (fieldName: string) => z.string().min(1, `${fieldName} wajib diisi`);

/**
 * Optional string that transforms empty string to undefined
 */
export const optionalString = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

/**
 * Required positive number
 */
export const positiveNumber = (fieldName: string) =>
  z.number().min(0, `${fieldName} tidak boleh negatif`);

/**
 * Required positive integer
 */
export const positiveInteger = (fieldName: string) =>
  z.number().int(`${fieldName} harus bilangan bulat`).min(1, `${fieldName} minimal 1`);

// ============================================================================
// Auth Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").min(6, "Password minimal 6 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const passwordResetSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka"
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ============================================================================
// User Schemas
// ============================================================================

export const userFormSchema = z.object({
  name: requiredString("Nama").max(100, "Nama maksimal 100 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  role: z.enum(["Super Admin", "Admin Logistik", "Admin Purchase", "Leader", "Staff"], {
    errorMap: () => ({ message: "Role wajib dipilih" }),
  }),
  divisionId: z.number().nullable(),
  password: z.string().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const divisionFormSchema = z.object({
  name: requiredString("Nama Divisi").max(100, "Nama maksimal 100 karakter"),
  description: optionalString,
});

export type DivisionFormData = z.infer<typeof divisionFormSchema>;

// ============================================================================
// Asset Schemas
// ============================================================================

export const assetConditionEnum = z.enum([
  "BRAND_NEW",
  "GOOD",
  "USED_OKAY",
  "MINOR_DAMAGE",
  "MAJOR_DAMAGE",
  "FOR_PARTS",
]);

export const assetStatusEnum = z.enum([
  "IN_STORAGE",
  "IN_USE",
  "IN_CUSTODY",
  "UNDER_REPAIR",
  "OUT_FOR_REPAIR",
  "DAMAGED",
  "DECOMMISSIONED",
  "AWAITING_RETURN",
  "CONSUMED",
]);

export const assetFormSchema = z.object({
  name: requiredString("Nama aset").max(100, "Nama maksimal 100 karakter"),
  categoryId: z.number().min(1, "Kategori wajib dipilih"),
  typeId: z.number().optional(),
  modelId: z.number().optional(),
  serialNumber: optionalString,
  purchasePrice: z.number().min(0, "Harga tidak boleh negatif").optional(),
  purchaseDate: optionalString,
  condition: assetConditionEnum,
  quantity: positiveInteger("Kuantitas"),
  unit: z.string().default("unit"),
  storageLocation: optionalString,
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type AssetFormData = z.infer<typeof assetFormSchema>;

// ============================================================================
// Customer Schemas
// ============================================================================

export const customerFormSchema = z.object({
  name: requiredString("Nama pelanggan").max(150, "Nama maksimal 150 karakter"),
  companyName: optionalString,
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^(\+62|62|0)?8[1-9][0-9]{6,10}$/, "Format nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  address: optionalString,
  city: optionalString,
  postalCode: optionalString,
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

export const requestPriorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const requestFormSchema = z.object({
  title: requiredString("Judul request").max(150, "Judul maksimal 150 karakter"),
  description: requiredString("Deskripsi"),
  priority: requestPriorityEnum.default("NORMAL"),
  categoryId: z.number().min(1, "Kategori wajib dipilih"),
  quantity: positiveInteger("Kuantitas"),
  expectedDate: optionalString,
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

export type RequestFormData = z.infer<typeof requestFormSchema>;

export const loanRequestFormSchema = z.object({
  purpose: requiredString("Tujuan peminjaman"),
  assetIds: z.array(z.string()).min(1, "Pilih minimal 1 aset"),
  borrowDate: requiredString("Tanggal pinjam"),
  expectedReturnDate: requiredString("Tanggal pengembalian"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type LoanRequestFormData = z.infer<typeof loanRequestFormSchema>;

// ============================================================================
// Transaction Schemas
// ============================================================================

export const handoverFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "Pilih minimal 1 aset"),
  recipientId: z.number().min(1, "Penerima wajib dipilih"),
  handoverDate: requiredString("Tanggal serah terima"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type HandoverFormData = z.infer<typeof handoverFormSchema>;

export const installationFormSchema = z.object({
  customerId: z.string().min(1, "Pelanggan wajib dipilih"),
  assetIds: z.array(z.string()).min(1, "Pilih minimal 1 aset"),
  installationDate: requiredString("Tanggal instalasi"),
  technicianId: z.number().min(1, "Teknisi wajib dipilih"),
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

export type InstallationFormData = z.infer<typeof installationFormSchema>;

export const maintenanceFormSchema = z.object({
  customerId: z.string().min(1, "Pelanggan wajib dipilih"),
  assetIds: z.array(z.string()).min(1, "Pilih minimal 1 aset"),
  maintenanceType: z.enum(["PREVENTIVE", "CORRECTIVE", "EMERGENCY"]),
  scheduledDate: requiredString("Tanggal terjadwal"),
  description: requiredString("Deskripsi"),
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>;

// ============================================================================
// Category Schemas
// ============================================================================

export const categoryFormSchema = z.object({
  name: requiredString("Nama kategori").max(100, "Nama maksimal 100 karakter"),
  description: optionalString,
  parentId: z.number().optional(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// ============================================================================
// File Upload Schema
// ============================================================================

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type),
      "Format file tidak didukung"
    ),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;
