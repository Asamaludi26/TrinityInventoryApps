/**
 * Request Validation Schemas
 *
 * Zod schemas for purchase requests and loan requests.
 */

import { z } from "zod";
import { assetConditionSchema } from "./asset.schema";

// --- ORDER TYPE ---

export const orderTypeSchema = z.enum([
  "Regular Stock",
  "Urgent",
  "Project Based",
]);

// --- ALLOCATION TARGET ---

export const allocationTargetSchema = z.enum(["Usage", "Inventory"]);

// --- ORDER DETAILS ---

export const orderDetailsSchema = z.object({
  type: orderTypeSchema,
  justification: z.string().optional(),
  project: z.string().optional(),
  allocationTarget: allocationTargetSchema.optional(),
});

// --- PURCHASE DETAILS ---

export const purchaseDetailsSchema = z.object({
  purchasePrice: z
    .number({ required_error: "Harga pembelian wajib diisi" })
    .min(0, "Harga tidak boleh negatif"),
  vendor: z
    .string({ required_error: "Nama vendor wajib diisi" })
    .min(1, "Nama vendor wajib diisi"),
  poNumber: z
    .string({ required_error: "Nomor PO wajib diisi" })
    .min(1, "Nomor PO wajib diisi"),
  invoiceNumber: z
    .string({ required_error: "Nomor invoice wajib diisi" })
    .min(1, "Nomor invoice wajib diisi"),
  purchaseDate: z
    .string({ required_error: "Tanggal pembelian wajib diisi" })
    .min(1, "Tanggal pembelian wajib diisi"),
  warrantyEndDate: z.string().nullable().optional(),
  filledBy: z.string(),
  fillDate: z.string(),
});

export type PurchaseDetailsInput = z.infer<typeof purchaseDetailsSchema>;

// --- REQUEST ITEM ---

export const requestItemSchema = z.object({
  id: z.number(),
  itemName: z
    .string({ required_error: "Nama item wajib diisi" })
    .min(1, "Nama item wajib diisi"),
  itemTypeBrand: z
    .string({ required_error: "Tipe/Merek wajib diisi" })
    .min(1, "Tipe/Merek wajib diisi"),
  quantity: z
    .number({ required_error: "Jumlah wajib diisi" })
    .min(1, "Jumlah minimal 1"),
  keterangan: z.string().default(""),
  tempCategoryId: z.string().optional(),
  tempTypeId: z.string().optional(),
  availableStock: z.number().optional(),
  unit: z.string().optional(),
  categoryId: z.string().optional(),
  typeId: z.string().optional(),
});

export type RequestItemInput = z.infer<typeof requestItemSchema>;

// --- CREATE REQUEST ---

export const createRequestSchema = z.object({
  requester: z.string({ required_error: "Pemohon wajib diisi" }),
  division: z.string({ required_error: "Divisi wajib diisi" }),
  order: orderDetailsSchema,
  items: z.array(requestItemSchema).min(1, "Minimal 1 item wajib ditambahkan"),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

// --- APPROVE REQUEST ---

export const approveRequestSchema = z.object({
  itemStatuses: z.record(
    z.string(), // item id as string key
    z.object({
      status: z.enum([
        "approved",
        "rejected",
        "partial",
        "stock_allocated",
        "procurement_needed",
      ]),
      reason: z.string().optional(),
      approvedQuantity: z.number().optional(),
    }),
  ),
  notes: z.string().optional(),
});

export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;

// --- REJECT REQUEST ---

export const rejectRequestSchema = z.object({
  reason: z
    .string({ required_error: "Alasan penolakan wajib diisi" })
    .min(10, "Alasan penolakan minimal 10 karakter"),
});

export type RejectRequestInput = z.infer<typeof rejectRequestSchema>;

// --- LOAN REQUEST ---

export const loanItemSchema = z.object({
  id: z.number(),
  itemName: z
    .string({ required_error: "Nama item wajib diisi" })
    .min(1, "Nama item wajib diisi"),
  brand: z.string().default(""),
  quantity: z
    .number({ required_error: "Jumlah wajib diisi" })
    .min(1, "Jumlah minimal 1"),
  keterangan: z.string().default(""),
  returnDate: z.string().nullable(),
  unit: z.string().optional(),
});

export type LoanItemInput = z.infer<typeof loanItemSchema>;

export const createLoanRequestSchema = z.object({
  requester: z.string({ required_error: "Peminjam wajib diisi" }),
  division: z.string({ required_error: "Divisi wajib diisi" }),
  items: z.array(loanItemSchema).min(1, "Minimal 1 item wajib ditambahkan"),
  notes: z.string().optional(),
});

export type CreateLoanRequestInput = z.infer<typeof createLoanRequestSchema>;

// --- SUBMIT RETURN ---

export const returnItemSchema = z.object({
  assetId: z.string({ required_error: "ID aset wajib diisi" }),
  assetName: z.string(),
  returnedCondition: assetConditionSchema,
  notes: z.string().optional(),
});

export const submitReturnSchema = z.object({
  loanRequestId: z.string({ required_error: "ID peminjaman wajib diisi" }),
  returnedBy: z.string({ required_error: "Nama pengembalian wajib diisi" }),
  items: z.array(returnItemSchema).min(1, "Minimal 1 item wajib dikembalikan"),
});

export type SubmitReturnInput = z.infer<typeof submitReturnSchema>;

// --- VERIFY RETURN ---

export const verifyReturnItemSchema = z.object({
  assetId: z.string(),
  status: z.enum(["ACCEPTED", "REJECTED"]),
  verificationNotes: z.string().optional(),
});

export const verifyReturnSchema = z.object({
  items: z
    .array(verifyReturnItemSchema)
    .min(1, "Minimal 1 item wajib diverifikasi"),
});

export type VerifyReturnInput = z.infer<typeof verifyReturnSchema>;
