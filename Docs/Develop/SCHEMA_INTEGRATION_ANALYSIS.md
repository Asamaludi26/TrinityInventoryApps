# Schema Integration Analysis Report

## Executive Summary

Dokumen ini menganalisis sinkronisasi antara:

1. **Backend Prisma Schema** (`backend/prisma/schema.prisma`)
2. **Frontend TypeScript Types** (`frontend/src/types/index.ts`)
3. **Documentation** (`Docs/01_CONCEPT_AND_ARCHITECTURE/DATABASE_SCHEMA.md`)

**Status: ✅ Mostly Synchronized** dengan beberapa perbedaan minor yang perlu diperhatikan.

---

## 1. Entity Comparison Matrix

### 1.1 Core Entities

| Entity        | Prisma Schema | Frontend Types | Documentation | Status         |
| ------------- | ------------- | -------------- | ------------- | -------------- |
| User          | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| Division      | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| Asset         | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| AssetCategory | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| AssetType     | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| AssetModel    | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| Customer      | ✅ Complete   | ✅ Complete    | ⚠️ Minimal    | ⚠️ Update Docs |
| Request       | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| RequestItem   | ✅ Complete   | ✅ Complete    | ✅ Complete   | ✅ Sync        |
| LoanRequest   | ✅ Complete   | ✅ Complete    | ⚠️ Minimal    | ⚠️ Update Docs |
| AssetReturn   | ✅ Complete   | ✅ Complete    | ❌ Missing    | ❌ Add to Docs |
| Handover      | ✅ Complete   | ✅ Complete    | ⚠️ Minimal    | ⚠️ Update Docs |
| HandoverItem  | ✅ Complete   | ✅ Complete    | ❌ Missing    | ❌ Add to Docs |
| Installation  | ✅ Complete   | ✅ Complete    | ⚠️ Minimal    | ⚠️ Update Docs |
| Dismantle     | ✅ Complete   | ✅ Complete    | ❌ Missing    | ❌ Add to Docs |
| Maintenance   | ✅ Complete   | ✅ Complete    | ❌ Missing    | ❌ Add to Docs |
| StockMovement | ✅ Complete   | ✅ Complete    | ❌ Missing    | ❌ Add to Docs |
| ActivityLog   | ✅ Complete   | ✅ Complete    | ❌ Missing    | ❌ Add to Docs |
| Notification  | ✅ Complete   | ✅ Complete    | ❌ Missing    | ❌ Add to Docs |

---

## 2. Enum Comparison

### 2.1 User Roles

| Prisma Schema    | Frontend Types     | Notes                 |
| ---------------- | ------------------ | --------------------- |
| `SUPER_ADMIN`    | `'Super Admin'`    | ⚠️ Format berbeda     |
| `ADMIN_LOGISTIK` | `'Admin Logistik'` | ⚠️ Format berbeda     |
| `ADMIN_PURCHASE` | `'Admin Purchase'` | ⚠️ Format berbeda     |
| `STAFF`          | `'Staff'`          | ⚠️ Format berbeda     |
| `TEKNISI`        | ❌ Missing         | ❌ Add to Frontend    |
| ❌ Missing       | `'Leader'`         | ⚠️ Frontend-only role |

**Recommendation**: Sinkronisasi enum antara backend dan frontend. Gunakan mapping di API layer.

### 2.2 Asset Status

| Prisma Schema  | Frontend Types            | Match                  |
| -------------- | ------------------------- | ---------------------- |
| `IN_STORAGE`   | `'Di Gudang'`             | ✅ (with label)        |
| `IN_USE`       | `'Digunakan'`             | ✅                     |
| `ON_LOAN`      | ❌                        | ⚠️ Missing in frontend |
| `UNDER_REPAIR` | `'Dalam Perbaikan'`       | ✅                     |
| `DAMAGED`      | `'Rusak'`                 | ✅                     |
| `DISPOSED`     | `'Diberhentikan'`         | ✅                     |
| ❌             | `'Dipegang (Custody)'`    | ⚠️ Frontend-only       |
| ❌             | `'Keluar (Service)'`      | ⚠️ Frontend-only       |
| ❌             | `'Menunggu Pengembalian'` | ⚠️ Frontend-only       |
| ❌             | `'Habis Terpakai'`        | ⚠️ Frontend-only       |

**Recommendation**: Add missing statuses ke Prisma schema untuk mendukung semua use case frontend.

### 2.3 Request/Loan Status

| Prisma                   | Frontend                 | Notes         |
| ------------------------ | ------------------------ | ------------- |
| `RequestStatus` enum     | `ItemStatus` enum        | ✅ Compatible |
| `LoanStatus` enum        | `LoanRequestStatus` enum | ✅ Compatible |
| `AssetReturnStatus` enum | `AssetReturnStatus` enum | ✅ Match      |

---

## 3. Field-Level Analysis

### 3.1 User Model

```typescript
// Prisma Schema
model User {
  id: Int
  email: String @unique
  password: String
  name: String
  role: UserRole
  divisionId: Int?
  permissions: String[]
  passwordResetRequested: Boolean
  passwordResetRequestDate: DateTime?
}

// Frontend Type
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  divisionId: number | null;
  permissions: Permission[];
  passwordResetRequested?: boolean;
  passwordResetRequestDate?: string;
}
```

**Status: ✅ Synchronized** - Semua field match dengan type conversion yang sesuai.

### 3.2 Asset Model

```typescript
// Prisma - Key Fields
model Asset {
  id: String @id              // Custom ID: "AST-2025-001"
  status: AssetStatus
  condition: AssetCondition
  initialBalance: Float?      // For measurement items
  currentBalance: Float?
  quantity: Int?              // For count items
  customerId: String?
}

// Frontend - Key Fields
interface Asset {
  id: string;
  status: AssetStatus | string;
  condition: AssetCondition;
  initialBalance?: number;
  currentBalance?: number;
  quantity?: number;
  currentUser?: string | null;  // ⚠️ Different field name
}
```

**Differences Found**:

1. `customerId` (Prisma) vs `currentUser` (Frontend) - Perlu mapping
2. Frontend memiliki field tambahan: `activityLog`, `attachments`

### 3.3 Handover Model

```typescript
// Prisma
model Handover {
  giverName: String
  giverType: PartyType
  receiverName: String
  receiverType: PartyType
}

// Frontend
interface Handover {
  menyerahkan: string;    // ⚠️ Different field name
  penerima: string;       // ⚠️ Different field name
  mengetahui: string;     // ⚠️ Missing in Prisma
}
```

**Action Required**:

- Add `mengetahui` field ke Prisma schema atau handle di API layer
- Create field mapping di DTO transformations

---

## 4. Missing in Documentation

Berikut model yang perlu ditambahkan ke DATABASE_SCHEMA.md:

1. **AssetReturn** - Complete model dengan items dan approval flow
2. **HandoverItem** - Detail item untuk serah terima
3. **Dismantle** - Pengambilan aset dari customer
4. **Maintenance** - Pemeliharaan dan perbaikan
5. **StockMovement** - Audit trail pergerakan stok
6. **ActivityLog** - General audit logging
7. **Notification** - System notifications

---

## 5. Recommendations

### 5.1 High Priority

1. **Add missing enum values to Prisma schema**:

   ```prisma
   enum AssetStatus {
     IN_STORAGE
     IN_USE
     ON_LOAN
     IN_CUSTODY        // Add
     UNDER_REPAIR
     OUT_FOR_SERVICE   // Add
     DAMAGED
     DISPOSED
     AWAITING_RETURN   // Add
     CONSUMED          // Add
   }
   ```

2. **Add missing role to Prisma**:
   ```prisma
   enum UserRole {
     SUPER_ADMIN
     ADMIN_LOGISTIK
     ADMIN_PURCHASE
     LEADER            // Add
     STAFF
     TEKNISI
   }
   ```

### 5.2 Medium Priority

1. **Create enum mapping utility** untuk transformasi backend ↔ frontend
2. **Update documentation** dengan model yang missing
3. **Add `mengetahui` field** ke Handover model jika diperlukan

### 5.3 Low Priority

1. **Standardize naming convention** - gunakan English di backend, Indonesian label di frontend
2. **Add JSON schema validation** untuk Json fields di Prisma
3. **Create API documentation** dengan Swagger/OpenAPI yang sync dengan schema

---

## 6. Action Items

| #   | Action                         | Priority | Assigned |
| --- | ------------------------------ | -------- | -------- |
| 1   | Update Prisma AssetStatus enum | High     | Backend  |
| 2   | Update Prisma UserRole enum    | High     | Backend  |
| 3   | Update DATABASE_SCHEMA.md      | Medium   | Docs     |
| 4   | Create enum mapping utilities  | Medium   | Backend  |
| 5   | Add field validations          | Low      | Backend  |
| 6   | Sync API documentation         | Low      | Backend  |

---

_Analysis Date: January 2026_
_Schema Version: 1.0.0_
