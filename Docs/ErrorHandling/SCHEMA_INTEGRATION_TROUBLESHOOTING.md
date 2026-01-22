# Prisma Schema Integration Troubleshooting Guide

## Overview

**Tanggal Analisis**: 2025-01-19  
**Status**: Sebagian Diperbaiki (Progress: 247 → 150 errors)  
**Penyebab Utama**: Ketidaksesuaian antara Prisma schema dan kode TypeScript backend

Dokumen ini berisi analisis mendalam dan panduan troubleshooting untuk mengintegrasikan perubahan Prisma schema dengan kode backend NestJS.

---

## Daftar Isi

1. [Ringkasan Perubahan Schema](#1-ringkasan-perubahan-schema)
2. [Perbaikan yang Sudah Dilakukan](#2-perbaikan-yang-sudah-dilakukan)
3. [Issue yang Masih Pending](#3-issue-yang-masih-pending)
4. [Panduan Perbaikan Detail](#4-panduan-perbaikan-detail)
5. [Referensi Enum Mapping](#5-referensi-enum-mapping)
6. [Best Practices](#6-best-practices)

---

## 1. Ringkasan Perubahan Schema

### 1.1 Perubahan Enum

| Enum Lama             | Enum Baru            | Catatan                                                                |
| --------------------- | -------------------- | ---------------------------------------------------------------------- |
| `RequestStatus`       | `ItemStatus`         | Digunakan oleh Request, Handover, Installation, Maintenance, Dismantle |
| `LoanStatus`          | `LoanRequestStatus`  | Digunakan oleh LoanRequest                                             |
| `AssetClassification` | `ItemClassification` | Klasifikasi item (ASSET/MATERIAL)                                      |
| `BulkType`            | `BulkTrackingMode`   | Mode tracking bulk (COUNT/MEASUREMENT)                                 |
| `DismantleStatus`     | **DIHAPUS**          | Gunakan `ItemStatus`                                                   |
| `InstallationStatus`  | **DIHAPUS**          | Gunakan `ItemStatus`                                                   |
| `MaintenanceStatus`   | **DIHAPUS**          | Gunakan `ItemStatus`                                                   |
| `HandoverStatus`      | **DIHAPUS**          | Gunakan `ItemStatus`                                                   |
| `NotificationType`    | **DIHAPUS**          | Gunakan string biasa untuk `type`                                      |
| `PartyType`           | **DIHAPUS**          | Gunakan string untuk party type                                        |
| `MaintenanceType`     | **DIHAPUS**          | Maintenance tidak memiliki type field                                  |

### 1.2 Perubahan UserRole

```typescript
// Schema UserRole values:
UserRole {
  SUPER_ADMIN
  ADMIN_LOGISTIK
  ADMIN_PURCHASE
  LEADER
  STAFF          // PENTING: Tidak ada TEKNISI - gunakan STAFF
}
```

### 1.3 Perubahan AssetStatus

```typescript
// Schema AssetStatus values:
AssetStatus {
  IN_STORAGE
  IN_USE
  IN_CUSTODY
  UNDER_REPAIR
  OUT_FOR_REPAIR
  DAMAGED
  DECOMMISSIONED
  AWAITING_RETURN
  CONSUMED
  // TIDAK ADA: ON_LOAN, DISPOSED, OUT_FOR_SERVICE
}
```

### 1.4 Perubahan AssetCondition

```typescript
// Schema AssetCondition values:
AssetCondition {
  BRAND_NEW
  GOOD
  USED_OKAY
  MINOR_DAMAGE
  MAJOR_DAMAGE
  FOR_PARTS
  // TIDAK ADA: BROKEN - gunakan MAJOR_DAMAGE
}
```

### 1.5 Perubahan MovementType

```typescript
// Schema MovementType values:
MovementType {
  IN_PURCHASE
  IN_RETURN
  OUT_INSTALLATION
  OUT_HANDOVER
  OUT_BROKEN
  OUT_ADJUSTMENT
  OUT_USAGE_CUSTODY
  // TIDAK ADA: RECEIVED, CONSUMED
}
```

### 1.6 Perubahan Model Fields

| Model         | Field Lama         | Field Baru             | Catatan                           |
| ------------- | ------------------ | ---------------------- | --------------------------------- |
| User          | `deletedAt`        | `isActive`             | Boolean flag, bukan soft delete   |
| Asset         | `deletedAt`        | -                      | Tidak ada soft delete             |
| Asset         | `model` (relation) | `type`, `category`     | Tidak ada model relation langsung |
| Asset         | `customerId`       | -                      | Tidak ada field customerId        |
| ActivityLog   | `performedBy`      | `userName`             | String nama user                  |
| ActivityLog   | `createdAt`        | `timestamp`            | Timestamp field                   |
| ActivityLog   | `changes`          | `details`              | Details sebagai string/text       |
| StockMovement | `movementType`     | `type`                 | Tipe movement                     |
| StockMovement | `assetId`          | `relatedAssetId`       | Relasi asset opsional             |
| StockMovement | `performedBy`      | `actorId`, `actorName` | Actor info                        |
| StockMovement | `createdAt`        | `date`                 | Tanggal movement                  |
| AssetReturn   | status `PENDING`   | `PENDING_APPROVAL`     | Status value berbeda              |
| LoanRequest   | `returnedAssets`   | `returnedAssetIds`     | Json field                        |
| Notification  | `title`            | -                      | Tidak ada field title             |
| Notification  | `createdAt`        | `timestamp`            | Timestamp field                   |
| Notification  | `readAt`           | -                      | Tidak ada readAt                  |
| Notification  | `referenceType`    | -                      | Tidak ada referenceType           |

---

## 2. Perbaikan yang Sudah Dilakukan

### 2.1 File yang Sudah Diperbaiki

1. **`src/common/enums/index.ts`**
   - Re-export Prisma enums dengan backward compatibility aliases
   - Menambahkan alias `LoanStatus = LoanRequestStatus`
   - Menambahkan alias `RequestStatus = ItemStatus`

2. **`src/common/utils/enum-mapper.ts`**
   - Update semua label mapping untuk enum values yang benar

3. **`src/common/types/query.types.ts`**
   - Hapus referensi `deletedAt`, `customerId`
   - Ganti `performedBy` → `userName`, `createdAt` → `timestamp`

4. **`src/modules/activity-logs/activity-logs.service.ts`**
   - Update `LogActivityOptions` interface
   - Ganti semua field references ke schema baru

5. **`src/modules/activity-logs/activity-logs.controller.ts`**
   - Ganti parameter `performedBy` → `userName`

6. **`src/modules/assets/assets.service.ts` (Partial)**
   - Ganti `model` references ke `type`/`category`
   - Update beberapa StockMovement creates

7. **`src/modules/assets/assets.controller.ts`**
   - Hapus parameter `customerId`
   - Ganti `TEKNISI` → `STAFF`

8. **`src/modules/auth/auth.service.ts`**
   - Ganti `deletedAt` → `isActive`

9. **`src/modules/auth/strategies/jwt.strategy.ts`**
   - Ganti `deletedAt` → `isActive`

10. **`src/modules/categories/categories.service.ts`**
    - Hapus semua `deletedAt` filters
    - Ganti `assetModel` → `standardItem`
    - Ganti `models` → `standardItems`

11. **`src/modules/dashboard/dashboard.service.ts`**
    - Update enum imports

12. **`src/modules/loans/loans.service.ts`**
    - Ganti `LoanStatus` → `LoanRequestStatus`

13. **`src/modules/loans/returns.service.ts` (Partial)**
    - Update status enum references

14. **`src/modules/notifications/notifications.service.ts`**
    - Hapus `NotificationType` import
    - Update semua create methods
    - Ganti `createdAt` → `timestamp`
    - Hapus `readAt`, `title`, `referenceType`

15. **`src/modules/reports/reports.controller.ts`**
    - Ganti `RequestStatus` → `ItemStatus`
    - Hapus parameter `modelId`

16. **`src/modules/requests/requests.controller.ts`**
    - Ganti `RequestStatus` → `ItemStatus`

17. **`src/modules/requests/requests.service.ts`**
    - Ganti import `RequestStatus` → `ItemStatus`

18. **`src/modules/transactions/transactions.controller.ts`**
    - Ganti `DismantleStatus`, `MaintenanceStatus` → `ItemStatus`
    - Ganti semua `TEKNISI` → `STAFF`

19. **`src/modules/users/divisions.service.ts`**
    - Hapus `deletedAt` filters
    - Ganti soft delete → hard delete

20. **`src/modules/users/users.service.ts`**
    - Ganti `deletedAt` → `isActive: false`

21. **`src/modules/customers/customers.controller.ts`**
    - Ganti `TEKNISI` → `STAFF`

22. **DTOs Fixed:**
    - `create-type.dto.ts`: `AssetClassification` → `ItemClassification`
    - `create-model.dto.ts`: `BulkType` → `BulkTrackingMode`
    - `create-handover.dto.ts`: Hapus `PartyType` import
    - `create-maintenance.dto.ts`: Hapus `MaintenanceType`, update fields

---

## 3. Issue yang Masih Pending

### 3.1 High Priority - Block Build (150 errors remaining)

#### A. Assets Module

**File**: `src/modules/assets/assets.service.ts`

| Line     | Issue                                  | Solusi                                                                       |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 299, 478 | `Decimal` arithmetic dengan `number`   | Convert ke Number: `totalAvailable += asset.currentBalance?.toNumber() ?? 0` |
| 344, 345 | `Math.min` dengan `Decimal`            | `Math.min(asset.currentBalance?.toNumber() ?? 0, remaining)`                 |
| 357      | `assetId` tidak ada di StockMovement   | Gunakan `relatedAssetId`                                                     |
| 358      | `MovementType.CONSUMED` tidak ada      | Gunakan `MovementType.OUT_USAGE_CUSTODY`                                     |
| 425      | `createdAt` tidak ada di StockMovement | Gunakan `date`                                                               |
| 430, 442 | `assetId` tidak ada di StockMovement   | Gunakan `relatedAssetId`                                                     |
| 453      | `deletedAt` tidak ada di Asset         | Hapus filter ini                                                             |

#### B. Categories Module

**File**: `src/modules/categories/categories.service.ts`

| Line         | Issue                               | Solusi                                                              |
| ------------ | ----------------------------------- | ------------------------------------------------------------------- |
| 66, 105, 236 | `associatedDivisions` type mismatch | Gunakan Prisma nested write: `{ connect: ids.map(id => ({ id })) }` |

#### C. Customers Module

**File**: `src/modules/customers/customers.service.ts`

| Line | Issue                             | Solusi                                |
| ---- | --------------------------------- | ------------------------------------- |
| 123  | `deletedAt` tidak ada di Customer | Gunakan hard delete atau status field |
| 131  | `customerId` tidak ada di Asset   | Filter dengan relasi atau hapus       |
| 132  | `model` include tidak valid       | Ganti ke `type`, `category`           |

#### D. Dashboard Module

**File**: `src/modules/dashboard/dashboard.service.ts`

| Line | Issue                          | Solusi                                        |
| ---- | ------------------------------ | --------------------------------------------- |
| 78   | `deletedAt` tidak ada di Asset | Hapus filter ini                              |
| 168  | Return type mismatch `onLoan`  | Ganti ke `inCustody` atau sesuaikan interface |

#### E. Loans Module (Returns)

**File**: `src/modules/loans/returns.service.ts`

| Line     | Issue                                        | Solusi                                     |
| -------- | -------------------------------------------- | ------------------------------------------ |
| 175, 310 | `returnedAssets` tidak ada                   | Ganti ke `returnedAssetIds`                |
| 176, 311 | `LoanStatus` undefined                       | Ganti ke `LoanRequestStatus`               |
| 191, 229 | `PENDING` tidak ada di AssetReturnStatus     | Gunakan `PENDING_APPROVAL`                 |
| 210, 323 | `changes` tidak ada di ActivityLog           | Gunakan `details` (stringify JSON)         |
| 285      | `verifiedBy` type mismatch                   | Gunakan `verifiedById` (number)            |
| 287      | `items` update type mismatch                 | Gunakan proper Prisma nested update syntax |
| 299, 303 | `returnedAssets`, `assignedAssets` tidak ada | Gunakan `returnedAssetIds`                 |

#### F. Reports Module

**File**: `src/modules/reports/reports.service.ts`

| Line    | Issue                                   | Solusi                              |
| ------- | --------------------------------------- | ----------------------------------- |
| 178     | `division` tidak ada di Request         | Gunakan `divisionName`              |
| 215-238 | Multiple LoanRequest field issues       | Lihat schema untuk field yang benar |
| 265     | `customerId` tidak ada di Asset         | Hapus atau ubah query               |
| 289-290 | `serviceType`, `serviceSpeed` tidak ada | Gunakan `servicePackage`            |
| 314     | `asset` include salah                   | Gunakan `assets`                    |
| 324-349 | Multiple Maintenance field issues       | Lihat schema untuk field yang benar |

#### G. Requests Module

**File**: `src/modules/requests/requests.service.ts`

| Line               | Issue                                | Solusi                                    |
| ------------------ | ------------------------------------ | ----------------------------------------- |
| 40                 | Possible null docNumber              | Add null check                            |
| 115                | `orderType` required                 | Provide default value                     |
| 120                | Missing `keterangan` field           | Add `keterangan` to item data             |
| 145, 312, 410, 495 | `changes` tidak ada                  | Gunakan `details`                         |
| 267                | `status` tidak ada di RequestItem    | Update tidak perlu status                 |
| 276                | RequestItem tidak punya `status`     | Sesuaikan query                           |
| 360                | Asset create missing required fields | Add `condition`, `category`, `recordedBy` |
| 434, 477           | `rejectedBy` salah                   | Gunakan `rejectedById`, `rejectedByName`  |

#### H. Transactions Module

**File**: `src/modules/transactions/dismantles.service.ts`

| Line | Issue                           | Solusi                                   |
| ---- | ------------------------------- | ---------------------------------------- |
| 5    | `DismantleStatus` tidak ada     | Gunakan `ItemStatus`                     |
| 41   | `technician` sebagai string     | Gunakan `technicianId`, `technicianName` |
| 89   | `receivedBy` tidak ada          | Field tidak ada di schema, hapus         |
| 95   | `assetsRetrieved` tidak ada     | Dismantle hanya untuk 1 asset            |
| 106  | `customerId` tidak ada di Asset | Hapus                                    |

**File**: `src/modules/transactions/handovers.service.ts`

| Line | Issue                       | Solusi                                            |
| ---- | --------------------------- | ------------------------------------------------- |
| 4    | `HandoverStatus` tidak ada  | Gunakan `ItemStatus`                              |
| 40   | `deletedAt` tidak ada       | Hapus filter                                      |
| 72   | HandoverItem missing fields | Add `itemName`, `itemTypeBrand`, `conditionNotes` |
| 94   | `changes` tidak ada         | Gunakan `details`                                 |

**File**: `src/modules/transactions/installations.service.ts`

| Line | Issue                           | Solusi                                              |
| ---- | ------------------------------- | --------------------------------------------------- |
| 4    | `InstallationStatus` tidak ada  | Gunakan `ItemStatus`                                |
| 42   | `technician` sebagai string     | Gunakan `technicianId`, `technicianName`            |
| 44   | `assetsInstalled` type mismatch | Gunakan proper Prisma relation connect              |
| 45   | `materialsUsed` type mismatch   | Gunakan proper nested create dengan required fields |
| 46   | `notes` required                | Provide default empty string                        |
| 56   | `customerId` tidak ada          | Hapus update ini                                    |

**File**: `src/modules/transactions/maintenances.service.ts`

| Line       | Issue                         | Solusi                                        |
| ---------- | ----------------------------- | --------------------------------------------- |
| 4          | `MaintenanceStatus` tidak ada | Gunakan `ItemStatus`                          |
| 42         | `problemDescription` required | Provide default value                         |
| 43         | `technician` sebagai string   | Gunakan `technicianId`, `technicianName`      |
| 44         | `materialsUsed` type mismatch | Gunakan proper nested create                  |
| 47, 77, 89 | `asset` include salah         | Gunakan `assets` (many relation)              |
| 108        | `actionTaken` salah           | Gunakan `actionsTaken`                        |
| 117        | `assetId` tidak ada           | Maintenance adalah many-to-many dengan assets |

---

## 4. Panduan Perbaikan Detail

### 4.1 Pattern: Mengganti deletedAt dengan isActive/Hard Delete

**Sebelum:**

```typescript
async findAll() {
  return this.prisma.user.findMany({
    where: { deletedAt: null }
  });
}

async remove(id: number) {
  return this.prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}
```

**Sesudah:**

```typescript
async findAll() {
  return this.prisma.user.findMany({
    where: { isActive: true }  // Untuk User yang punya isActive
  });
  // ATAU untuk model tanpa isActive:
  return this.prisma.customer.findMany();  // No filter
}

async remove(id: number) {
  // Untuk User dengan isActive:
  return this.prisma.user.update({
    where: { id },
    data: { isActive: false }
  });

  // Untuk model lain - hard delete:
  return this.prisma.customer.delete({
    where: { id }
  });
}
```

### 4.2 Pattern: Menggunakan ActivityLog Baru

**Sebelum:**

```typescript
await this.prisma.activityLog.create({
  data: {
    entityType: "asset",
    entityId: assetId,
    action: "CREATE",
    performedBy: userName,
    changes: { status: "IN_STORAGE" },
  },
});
```

**Sesudah:**

```typescript
await this.prisma.activityLog.create({
  data: {
    entityType: "asset",
    entityId: assetId,
    action: "CREATE",
    userId: userId,
    userName: userName,
    details: JSON.stringify({ status: "IN_STORAGE" }),
    timestamp: new Date(),
  },
});
```

### 4.3 Pattern: StockMovement Baru

**Sebelum:**

```typescript
await this.prisma.stockMovement.create({
  data: {
    assetId: asset.id,
    movementType: MovementType.RECEIVED,
    quantity: 10,
    performedBy: userName,
    notes: "Received from purchase",
  },
});
```

**Sesudah:**

```typescript
await this.prisma.stockMovement.create({
  data: {
    assetName: asset.name,
    brand: asset.brand,
    type: MovementType.IN_PURCHASE,
    quantity: 10,
    balanceAfter: currentBalance + 10,
    actorId: userId,
    actorName: userName,
    date: new Date(),
    relatedAssetId: asset.id,
    notes: "Received from purchase",
  },
});
```

### 4.4 Pattern: Decimal Arithmetic

**Sebelum:**

```typescript
totalAvailable += asset.currentBalance; // Error!
const consume = Math.min(asset.currentBalance, remaining); // Error!
```

**Sesudah:**

```typescript
totalAvailable += asset.currentBalance?.toNumber() ?? 0;
const consume = Math.min(asset.currentBalance?.toNumber() ?? 0, remaining);
```

### 4.5 Pattern: Notification Tanpa Title

**Sebelum:**

```typescript
await this.prisma.notification.create({
  data: {
    recipientId,
    type: NotificationType.REQUEST_CREATED,
    title: "Permintaan Baru",
    message: "Ada permintaan baru",
    referenceType: "request",
    referenceId,
  },
});
```

**Sesudah:**

```typescript
await this.prisma.notification.create({
  data: {
    recipientId,
    type: "REQUEST_CREATED", // String, bukan enum
    message: "Permintaan Baru: Ada permintaan baru", // Gabung title ke message
    actorName: "System",
    referenceId,
  },
});
```

---

## 5. Referensi Enum Mapping

### 5.1 Import Pattern

```typescript
// File: src/common/enums/index.ts
export {
  // Re-export dari Prisma
  UserRole,
  AssetStatus,
  AssetCondition,
  ItemStatus,
  LoanRequestStatus,
  AssetReturnStatus,
  ItemClassification,
  TrackingMethod,
  BulkTrackingMode,
  MovementType,
  OrderType,
  AllocationTarget,
  ItemApprovalStatus,
  CustomerStatus,
  AttachmentType,
  ReturnItemStatus,
  LocationContext,
} from "@prisma/client";

// Backward compatibility aliases
export { ItemStatus as RequestStatus } from "@prisma/client";
export { LoanRequestStatus as LoanStatus } from "@prisma/client";
```

### 5.2 Enum Label Mapping

```typescript
// File: src/common/utils/enum-mapper.ts

export const ItemStatusLabels: Record<ItemStatus, string> = {
  PENDING: "Menunggu",
  LOGISTIC_APPROVED: "Disetujui Logistik",
  AWAITING_CEO_APPROVAL: "Menunggu CEO",
  APPROVED: "Disetujui",
  PURCHASING: "Proses Pembelian",
  IN_DELIVERY: "Dalam Pengiriman",
  ARRIVED: "Tiba",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
  AWAITING_HANDOVER: "Siap Serah Terima",
  IN_PROGRESS: "Dalam Proses",
};

export const LoanRequestStatusLabels: Record<LoanRequestStatus, string> = {
  PENDING: "Menunggu Persetujuan",
  APPROVED: "Disetujui",
  ON_LOAN: "Dipinjam",
  RETURNED: "Dikembalikan",
  REJECTED: "Ditolak",
  OVERDUE: "Terlambat",
  AWAITING_RETURN: "Menunggu Pengembalian",
};
```

---

## 6. Best Practices

### 6.1 Sebelum Melakukan Perubahan Schema

1. **Generate Prisma client dulu**: `pnpm prisma:generate`
2. **Build untuk check errors**: `pnpm run build 2>&1 | tee build-errors.log`
3. **Dokumentasikan perubahan** di CHANGELOG

### 6.2 Urutan Perbaikan yang Direkomendasikan

1. **Enums & DTOs** - Perbaiki imports dan type definitions
2. **Common utils** - Update enum mappers dan helper functions
3. **Service files** - Fix business logic per module
4. **Controllers** - Update parameter types

### 6.3 Testing After Fixes

```bash
# Build check
pnpm run build

# Unit tests
pnpm test

# E2E tests (jika ada)
pnpm test:e2e
```

### 6.4 Rollback Strategy

Jika ada masalah, gunakan git untuk revert:

```bash
git diff --stat HEAD~1  # Lihat perubahan
git checkout HEAD~1 -- path/to/file  # Revert specific file
```

---

## Changelog

| Tanggal    | Perubahan                        | Status                     |
| ---------- | -------------------------------- | -------------------------- |
| 2025-01-19 | Initial analysis dan partial fix | Progress: 247 → 150 errors |

---

## Kontak

Untuk pertanyaan lebih lanjut, hubungi tim development atau lihat dokumentasi Prisma di:

- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
