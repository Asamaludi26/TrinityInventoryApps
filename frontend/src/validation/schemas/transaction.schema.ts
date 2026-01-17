/**
 * Transaction Validation Schemas
 *
 * Zod schemas for handovers, installations, maintenances, and dismantles.
 */

import { z } from "zod";
import { assetConditionSchema } from "./asset.schema";

// --- HANDOVER ITEM ---

export const handoverItemSchema = z.object({
  id: z.number(),
  assetId: z.string().optional(),
  itemName: z
    .string({ required_error: "Nama item wajib diisi" })
    .min(1, "Nama item wajib diisi"),
  itemTypeBrand: z.string().default(""),
  conditionNotes: z.string().default(""),
  quantity: z.number().min(1, "Jumlah minimal 1").default(1),
  checked: z.boolean().default(false),
  unit: z.string().optional(),
  isLocked: z.boolean().optional(),
});

export type HandoverItemInput = z.infer<typeof handoverItemSchema>;

// --- CREATE HANDOVER ---

export const createHandoverSchema = z.object({
  handoverDate: z
    .string({ required_error: "Tanggal serah terima wajib diisi" })
    .min(1, "Tanggal serah terima wajib diisi"),
  menyerahkan: z
    .string({ required_error: "Nama penyerah wajib diisi" })
    .min(1, "Nama penyerah wajib diisi"),
  penerima: z
    .string({ required_error: "Nama penerima wajib diisi" })
    .min(1, "Nama penerima wajib diisi"),
  mengetahui: z
    .string({ required_error: "Nama yang mengetahui wajib diisi" })
    .min(1, "Nama yang mengetahui wajib diisi"),
  woRoIntNumber: z.string().optional(),
  items: z.array(handoverItemSchema).min(1, "Minimal 1 item wajib ditambahkan"),
});

export type CreateHandoverInput = z.infer<typeof createHandoverSchema>;

// --- INSTALLATION ASSET ---

export const installationAssetSchema = z.object({
  assetId: z.string({ required_error: "ID aset wajib dipilih" }),
  assetName: z.string(),
  serialNumber: z.string().optional(),
});

// --- INSTALLATION MATERIAL ---

export const installationMaterialSchema = z.object({
  materialAssetId: z.string().optional(),
  itemName: z
    .string({ required_error: "Nama material wajib diisi" })
    .min(1, "Nama material wajib diisi"),
  brand: z.string().default(""),
  quantity: z
    .number({ required_error: "Jumlah wajib diisi" })
    .min(0.01, "Jumlah minimal 0.01"),
  unit: z.string().default("pcs"),
});

export type InstallationMaterialInput = z.infer<
  typeof installationMaterialSchema
>;

// --- CREATE INSTALLATION ---

export const createInstallationSchema = z.object({
  installationDate: z
    .string({ required_error: "Tanggal instalasi wajib diisi" })
    .min(1, "Tanggal instalasi wajib diisi"),
  technician: z
    .string({ required_error: "Nama teknisi wajib diisi" })
    .min(1, "Nama teknisi wajib diisi"),
  customerId: z
    .string({ required_error: "Customer wajib dipilih" })
    .min(1, "Customer wajib dipilih"),
  customerName: z.string(),
  requestNumber: z.string().optional(),
  assetsInstalled: z
    .array(installationAssetSchema)
    .min(1, "Minimal 1 aset wajib dipilih"),
  materialsUsed: z.array(installationMaterialSchema).optional(),
  notes: z.string().default(""),
  acknowledger: z.string().nullable().optional(),
});

export type CreateInstallationInput = z.infer<typeof createInstallationSchema>;

// --- MAINTENANCE REPLACEMENT ---

export const maintenanceReplacementSchema = z.object({
  oldAssetId: z.string({ required_error: "ID aset lama wajib diisi" }),
  newAssetId: z.string({ required_error: "ID aset baru wajib diisi" }),
  retrievedAssetCondition: assetConditionSchema,
});

// --- MAINTENANCE MATERIAL ---

export const maintenanceMaterialSchema = z.object({
  materialAssetId: z.string().optional(),
  itemName: z
    .string({ required_error: "Nama material wajib diisi" })
    .min(1, "Nama material wajib diisi"),
  brand: z.string().default(""),
  quantity: z
    .number({ required_error: "Jumlah wajib diisi" })
    .min(0.01, "Jumlah minimal 0.01"),
  unit: z.string().default("pcs"),
});

// --- CREATE MAINTENANCE ---

export const createMaintenanceSchema = z.object({
  maintenanceDate: z
    .string({ required_error: "Tanggal maintenance wajib diisi" })
    .min(1, "Tanggal maintenance wajib diisi"),
  technician: z
    .string({ required_error: "Nama teknisi wajib diisi" })
    .min(1, "Nama teknisi wajib diisi"),
  customerId: z
    .string({ required_error: "Customer wajib dipilih" })
    .min(1, "Customer wajib dipilih"),
  customerName: z.string(),
  requestNumber: z.string().optional(),
  problemDescription: z
    .string({ required_error: "Deskripsi masalah wajib diisi" })
    .min(10, "Deskripsi masalah minimal 10 karakter"),
  actionsTaken: z
    .string({ required_error: "Tindakan yang dilakukan wajib diisi" })
    .min(10, "Tindakan yang dilakukan minimal 10 karakter"),
  workTypes: z
    .array(z.string())
    .min(1, "Minimal 1 jenis pekerjaan wajib dipilih"),
  priority: z.enum(["Tinggi", "Sedang", "Rendah"]).optional(),
  materialsUsed: z.array(maintenanceMaterialSchema).optional(),
  replacements: z.array(maintenanceReplacementSchema).optional(),
  notes: z.string().optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;

// --- CREATE DISMANTLE ---

export const createDismantleSchema = z.object({
  assetId: z
    .string({ required_error: "ID aset wajib dipilih" })
    .min(1, "ID aset wajib dipilih"),
  assetName: z.string(),
  dismantleDate: z
    .string({ required_error: "Tanggal dismantle wajib diisi" })
    .min(1, "Tanggal dismantle wajib diisi"),
  technician: z
    .string({ required_error: "Nama teknisi wajib diisi" })
    .min(1, "Nama teknisi wajib diisi"),
  customerId: z
    .string({ required_error: "Customer wajib dipilih" })
    .min(1, "Customer wajib dipilih"),
  customerName: z.string(),
  customerAddress: z.string(),
  requestNumber: z.string().optional(),
  retrievedCondition: assetConditionSchema,
  notes: z.string().nullable().default(null),
  acknowledger: z.string().nullable().optional(),
});

export type CreateDismantleInput = z.infer<typeof createDismantleSchema>;
