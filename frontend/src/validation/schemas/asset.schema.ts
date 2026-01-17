/**
 * Asset Validation Schemas
 *
 * Zod schemas for asset registration and management.
 */

import { z } from "zod";

// --- ASSET STATUS ---

export const assetStatusSchema = z.enum([
  "Di Gudang",
  "Digunakan",
  "Dipegang (Custody)",
  "Dalam Perbaikan",
  "Keluar (Service)",
  "Rusak",
  "Diberhentikan",
  "Menunggu Pengembalian",
  "Habis Terpakai",
]);

// --- ASSET CONDITION ---

export const assetConditionSchema = z.enum([
  "Baru",
  "Baik",
  "Bekas Layak Pakai",
  "Rusak Ringan",
  "Rusak Berat",
  "Kanibal",
]);

// --- ATTACHMENT ---

export const attachmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string().url(),
  type: z.enum(["image", "pdf", "other"]),
});

// --- ACTIVITY LOG ENTRY ---

export const activityLogEntrySchema = z.object({
  id: z.union([z.string(), z.number()]),
  timestamp: z.string(),
  user: z.string(),
  action: z.string(),
  details: z.string(),
  referenceId: z.string().optional(),
});

// --- CREATE ASSET ---

export const createAssetSchema = z.object({
  name: z
    .string({ required_error: "Nama aset wajib diisi" })
    .min(2, "Nama aset minimal 2 karakter")
    .max(200, "Nama aset maksimal 200 karakter"),
  category: z
    .string({ required_error: "Kategori wajib dipilih" })
    .min(1, "Kategori wajib dipilih"),
  type: z
    .string({ required_error: "Tipe wajib dipilih" })
    .min(1, "Tipe wajib dipilih"),
  brand: z
    .string({ required_error: "Merek/Jenis wajib diisi" })
    .min(1, "Merek/Jenis wajib diisi"),
  serialNumber: z
    .string()
    .max(100, "Serial number maksimal 100 karakter")
    .nullable()
    .optional(),
  macAddress: z
    .string()
    .regex(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      "Format MAC Address tidak valid",
    )
    .nullable()
    .optional()
    .or(z.literal("")),
  purchasePrice: z
    .number()
    .min(0, "Harga tidak boleh negatif")
    .nullable()
    .optional(),
  vendor: z
    .string()
    .max(200, "Nama vendor maksimal 200 karakter")
    .nullable()
    .optional(),
  poNumber: z
    .string()
    .max(50, "Nomor PO maksimal 50 karakter")
    .nullable()
    .optional(),
  invoiceNumber: z
    .string()
    .max(50, "Nomor invoice maksimal 50 karakter")
    .nullable()
    .optional(),
  purchaseDate: z.string().nullable().optional(),
  warrantyEndDate: z.string().nullable().optional(),
  condition: assetConditionSchema,
  location: z
    .string()
    .max(200, "Lokasi maksimal 200 karakter")
    .nullable()
    .optional(),
  locationDetail: z
    .string()
    .max(500, "Detail lokasi maksimal 500 karakter")
    .nullable()
    .optional(),
  currentUser: z
    .string()
    .max(100, "Nama pengguna maksimal 100 karakter")
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(1000, "Catatan maksimal 1000 karakter")
    .nullable()
    .optional(),
  woRoIntNumber: z
    .string()
    .max(50, "Nomor WO/RO/INT maksimal 50 karakter")
    .nullable()
    .optional(),
  initialBalance: z
    .number()
    .min(0, "Saldo awal tidak boleh negatif")
    .optional(),
  quantity: z.number().min(1, "Jumlah minimal 1").optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

// --- UPDATE ASSET ---

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: assetStatusSchema.optional(),
  currentBalance: z.number().min(0, "Saldo tidak boleh negatif").optional(),
});

export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

// --- BATCH UPDATE ---

export const batchUpdateAssetsSchema = z.object({
  assetIds: z.array(z.string()).min(1, "Pilih minimal 1 aset"),
  updates: updateAssetSchema,
});

export type BatchUpdateAssetsInput = z.infer<typeof batchUpdateAssetsSchema>;

// --- CONSUME MATERIAL ---

export const consumeMaterialSchema = z.object({
  assetId: z.string({ required_error: "ID aset wajib diisi" }),
  quantity: z
    .number({ required_error: "Jumlah wajib diisi" })
    .min(0.01, "Jumlah minimal 0.01"),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export type ConsumeMaterialInput = z.infer<typeof consumeMaterialSchema>;

// --- ASSET CATEGORY ---

export const standardItemSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nama item wajib diisi"),
  brand: z.string().min(1, "Merek wajib diisi"),
  bulkType: z.enum(["count", "measurement"]).optional(),
  unitOfMeasure: z.string().optional(),
  baseUnitOfMeasure: z.string().optional(),
  quantityPerUnit: z.number().optional(),
});

export const assetTypeSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nama tipe wajib diisi"),
  classification: z.enum(["asset", "material"]).optional(),
  trackingMethod: z.enum(["individual", "bulk"]).optional(),
  unitOfMeasure: z.string().optional(),
  standardItems: z.array(standardItemSchema).optional(),
});

export const assetCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nama kategori wajib diisi"),
  types: z.array(assetTypeSchema),
  associatedDivisions: z.array(z.number()),
  isCustomerInstallable: z.boolean().optional(),
});

export type AssetCategoryInput = z.infer<typeof assetCategorySchema>;
