/**
 * User Validation Schemas
 *
 * Zod schemas for user management operations.
 */

import { z } from "zod";

// --- USER ROLES ---

export const userRoles = [
  "Super Admin",
  "Admin Logistik",
  "Admin Purchase",
  "Leader",
  "Staff",
] as const;

export const userRoleSchema = z.enum(userRoles);

// --- PERMISSIONS ---

export const permissionSchema = z.enum([
  "dashboard:view",
  "reports:view",
  "data:export",
  "system:audit-log",
  "requests:view:own",
  "requests:view:all",
  "requests:create",
  "requests:create:urgent",
  "requests:approve:logistic",
  "requests:approve:purchase",
  "requests:approve:final",
  "requests:cancel:own",
  "requests:delete",
  "loan-requests:view:own",
  "loan-requests:view:all",
  "loan-requests:create",
  "loan-requests:approve",
  "loan-requests:return",
  "assets:view",
  "assets:view:division",
  "assets:view-price",
  "assets:create",
  "assets:edit",
  "assets:delete",
  "assets:handover",
  "handovers:view",
  "assets:dismantle",
  "dismantles:view",
  "assets:install",
  "installations:view",
  "maintenances:create",
  "maintenances:view",
  "assets:repair:report",
  "assets:repair:manage",
  "stock:view",
  "stock:manage",
  "customers:view",
  "customers:create",
  "customers:edit",
  "customers:delete",
  "users:view",
  "users:create",
  "users:edit",
  "users:delete",
  "users:reset-password",
  "users:manage-permissions",
  "divisions:manage",
  "categories:manage",
  "account:manage",
]);

// --- CREATE USER ---

export const createUserSchema = z.object({
  name: z
    .string({ required_error: "Nama wajib diisi" })
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Format email tidak valid"),
  role: userRoleSchema,
  divisionId: z.number({ required_error: "Divisi wajib dipilih" }).nullable(),
  permissions: z.array(permissionSchema).default([]),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, huruf kecil, dan angka",
    )
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// --- UPDATE USER ---

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .optional(),
  email: z.string().email("Format email tidak valid").optional(),
  role: userRoleSchema.optional(),
  divisionId: z.number().nullable().optional(),
  permissions: z.array(permissionSchema).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// --- DIVISION ---

export const divisionSchema = z.object({
  name: z
    .string({ required_error: "Nama divisi wajib diisi" })
    .min(2, "Nama divisi minimal 2 karakter")
    .max(50, "Nama divisi maksimal 50 karakter"),
});

export type DivisionInput = z.infer<typeof divisionSchema>;
