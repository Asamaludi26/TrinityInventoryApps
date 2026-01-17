/**
 * Customer Validation Schemas
 *
 * Zod schemas for customer management.
 */

import { z } from "zod";

// --- CUSTOMER STATUS ---

export const customerStatusSchema = z.enum(["Active", "Inactive", "Suspended"]);

// --- INSTALLED MATERIAL ---

export const installedMaterialSchema = z.object({
  itemName: z.string(),
  brand: z.string(),
  quantity: z.number(),
  unit: z.string(),
  installationDate: z.string(),
  materialAssetId: z.string().optional(),
});

// --- CREATE CUSTOMER ---

export const createCustomerSchema = z.object({
  name: z
    .string({ required_error: "Nama customer wajib diisi" })
    .min(2, "Nama customer minimal 2 karakter")
    .max(200, "Nama customer maksimal 200 karakter"),
  address: z
    .string({ required_error: "Alamat wajib diisi" })
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  phone: z
    .string({ required_error: "Nomor telepon wajib diisi" })
    .min(8, "Nomor telepon minimal 8 karakter")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(/^[0-9+\-\s()]+$/, "Format nomor telepon tidak valid"),
  email: z
    .string()
    .email("Format email tidak valid")
    .or(z.literal(""))
    .optional(),
  servicePackage: z
    .string({ required_error: "Paket layanan wajib dipilih" })
    .min(1, "Paket layanan wajib dipilih"),
  installationDate: z
    .string({ required_error: "Tanggal instalasi wajib diisi" })
    .min(1, "Tanggal instalasi wajib diisi"),
  status: customerStatusSchema.default("Active"),
  notes: z
    .string()
    .max(1000, "Catatan maksimal 1000 karakter")
    .nullable()
    .optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

// --- UPDATE CUSTOMER ---

export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

// --- CUSTOMER FILTER ---

export const customerFilterSchema = z.object({
  status: customerStatusSchema.optional(),
  search: z.string().optional(),
  servicePackage: z.string().optional(),
});

export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
