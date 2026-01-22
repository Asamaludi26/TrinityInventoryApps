# 🗄️ Trinity Asset Management - Database Schema

> **Versi:** 2.0  
> **Terakhir Diperbarui:** 22 Januari 2026  
> **ORM:** Prisma Client  
> **Database:** PostgreSQL 17

## 📋 Overview

Dokumentasi lengkap Database Schema untuk Trinity Asset Management System. Schema ini mencakup **27+ tabel** dengan relasi yang sudah dioptimasi untuk performance dan data integrity.

---

## 🚀 Quick Start

### Setup Database

```bash
# Dari folder backend
cd backend

# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Open Prisma Studio (GUI)
npx prisma studio
```

### Environment Variables

```bash
# .env
DATABASE_URL="postgresql://trinity_admin:password@localhost:5432/trinity_inventory?schema=public"
```

---

## 📊 Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MASTER DATA                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Division ←──→ User ←──→ UserPreference                                │
│                 │                                                        │
│  AssetCategory ←──→ AssetType ←──→ StandardItem                        │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CORE OPERATIONS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Asset ←──→ StockMovement ←──→ StockThreshold                          │
│    │                                                                     │
│    ├──→ Request ←──→ RequestItem ←──→ RequestActivity                  │
│    ├──→ LoanRequest ←──→ LoanItem ←──→ LoanAssetAssignment             │
│    ├──→ AssetReturn ←──→ AssetReturnItem                               │
│    └──→ Handover ←──→ HandoverItem                                     │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FIELD OPERATIONS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Customer ←──→ Installation ←──→ InstallationMaterial                  │
│      │                                                                   │
│      ├──→ Maintenance ←──→ MaintenanceMaterial/Replacement             │
│      └──→ Dismantle                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM SUPPORT                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Notification │ ActivityLog │ Attachment │ WhatsAppLog │ SystemConfig  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Model Details

### 1. User & Division (Master Data)

#### Division

| Field       | Type         | Description                  |
| ----------- | ------------ | ---------------------------- |
| `id`        | Int          | Primary key (auto-increment) |
| `name`      | String (100) | Unique division name         |
| `createdAt` | DateTime     | Created timestamp            |
| `updatedAt` | DateTime     | Updated timestamp            |

#### User

| Field                    | Type         | Description                                                         |
| ------------------------ | ------------ | ------------------------------------------------------------------- |
| `id`                     | Int          | Primary key (auto-increment)                                        |
| `name`                   | String (255) | Full name                                                           |
| `email`                  | String (255) | Unique email address                                                |
| `password`               | String (255) | Bcrypt hashed password                                              |
| `role`                   | UserRole     | SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE, LEADER, STAFF, TEKNISI |
| `divisionId`             | Int?         | Foreign key to Division                                             |
| `permissions`            | String[]     | Array of permission strings                                         |
| `passwordResetToken`     | String?      | Reset token                                                         |
| `passwordResetExpires`   | DateTime?    | Token expiry                                                        |
| `passwordResetRequested` | Boolean      | Flag for reset request                                              |
| `lastLoginAt`            | DateTime?    | Last login timestamp                                                |
| `refreshToken`           | Text?        | JWT refresh token                                                   |
| `isActive`               | Boolean      | Active status                                                       |
| `createdAt`              | DateTime     | Created timestamp                                                   |
| `updatedAt`              | DateTime     | Updated timestamp                                                   |

**Indexes:** `[email]`, `[role, divisionId]`

#### UserRole Enum

```prisma
enum UserRole {
  SUPER_ADMIN    @map("Super Admin")
  ADMIN_LOGISTIK @map("Admin Logistik")
  ADMIN_PURCHASE @map("Admin Purchase")
  LEADER         @map("Leader")
  STAFF          @map("Staff")
  TEKNISI        @map("Teknisi")
}
```

#### UserPreference

| Field                   | Type    | Description                         |
| ----------------------- | ------- | ----------------------------------- |
| `id`                    | Int     | Primary key                         |
| `userId`                | Int     | Unique, FK to User                  |
| `emailNotifications`    | Boolean | Enable email notifications          |
| `pushNotifications`     | Boolean | Enable push notifications           |
| `whatsappNotifications` | Boolean | Enable WA notifications             |
| `defaultDashboardView`  | String? | Default dashboard view              |
| `itemsPerPage`          | Int     | Pagination preference (default: 20) |
| `theme`                 | String  | UI theme: light/dark/auto           |

---

### 2. Asset Category Hierarchy

#### AssetCategory

| Field                   | Type         | Description                  |
| ----------------------- | ------------ | ---------------------------- |
| `id`                    | Int          | Primary key                  |
| `name`                  | String (255) | Unique category name         |
| `isCustomerInstallable` | Boolean      | Can be installed at customer |
| `createdAt`             | DateTime     | Created timestamp            |
| `updatedAt`             | DateTime     | Updated timestamp            |

#### AssetType

| Field            | Type                | Description             |
| ---------------- | ------------------- | ----------------------- |
| `id`             | Int                 | Primary key             |
| `categoryId`     | Int                 | FK to AssetCategory     |
| `name`           | String (255)        | Type name               |
| `classification` | ItemClassification? | ASSET or MATERIAL       |
| `trackingMethod` | TrackingMethod?     | INDIVIDUAL or BULK      |
| `unitOfMeasure`  | String?             | Unit (meter, pcs, etc.) |

**Unique:** `[categoryId, name]`

#### StandardItem (Model/SKU)

| Field               | Type              | Description          |
| ------------------- | ----------------- | -------------------- |
| `id`                | Int               | Primary key          |
| `typeId`            | Int               | FK to AssetType      |
| `name`              | String (255)      | Model name           |
| `brand`             | String (255)      | Brand name           |
| `bulkType`          | BulkTrackingMode? | COUNT or MEASUREMENT |
| `unitOfMeasure`     | String?           | Unit for this model  |
| `baseUnitOfMeasure` | String?           | Base unit            |
| `quantityPerUnit`   | Int?              | Conversion factor    |

**Unique:** `[typeId, name, brand]`

#### Enums

```prisma
enum ItemClassification {
  ASSET     // Tracked individually with serial
  MATERIAL  // Tracked in bulk (consumables)
}

enum TrackingMethod {
  INDIVIDUAL  // Each unit has unique ID
  BULK        // Tracked by quantity
}

enum BulkTrackingMode {
  COUNT        // Discrete units (pcs)
  MEASUREMENT  // Continuous (meters, kg)
}
```

---

### 3. Core Asset Model

#### Asset

| Field              | Type           | Description                     |
| ------------------ | -------------- | ------------------------------- |
| `id`               | String (CUID)  | Primary key                     |
| `name`             | String (255)   | Asset name                      |
| `categoryId`       | Int            | FK to AssetCategory             |
| `typeId`           | Int?           | FK to AssetType                 |
| `brand`            | String (255)   | Brand name                      |
| `serialNumber`     | String?        | Serial number                   |
| `macAddress`       | String?        | MAC address (network equipment) |
| `purchasePrice`    | Decimal (15,2) | Purchase price in IDR           |
| `vendor`           | String?        | Vendor/supplier                 |
| `poNumber`         | String?        | Purchase order number           |
| `invoiceNumber`    | String?        | Invoice number                  |
| `purchaseDate`     | Date?          | Purchase date                   |
| `warrantyEndDate`  | Date?          | Warranty expiry                 |
| `status`           | AssetStatus    | Current status                  |
| `condition`        | AssetCondition | Physical condition              |
| `location`         | String?        | Storage location                |
| `locationDetail`   | Text?          | Detailed location info          |
| `currentUserId`    | Int?           | Current holder                  |
| `currentUserName`  | String?        | Current holder name             |
| `initialBalance`   | Decimal?       | Initial quantity (bulk)         |
| `currentBalance`   | Decimal?       | Current quantity (bulk)         |
| `quantity`         | Int?           | Quantity (default: 1)           |
| `woRoIntNumber`    | String?        | Work order reference            |
| `isDismantled`     | Boolean        | Dismantled flag                 |
| `dismantleId`      | String?        | Reference to dismantle          |
| `dismantleInfo`    | JSON?          | Dismantle metadata              |
| `notes`            | Text?          | Notes                           |
| `registrationDate` | DateTime       | Registration date               |
| `recordedById`     | Int            | FK to User (creator)            |
| `lastModifiedById` | Int?           | FK to User (modifier)           |

**Indexes:** `[status, categoryId]`, `[serialNumber]`, `[macAddress]`, `[currentUserId]`, `[brand, name]`

#### AssetStatus Enum

```prisma
enum AssetStatus {
  IN_STORAGE      @map("Di Gudang")
  IN_USE          @map("Digunakan")
  IN_CUSTODY      @map("Dipegang (Custody)")
  UNDER_REPAIR    @map("Dalam Perbaikan")
  OUT_FOR_REPAIR  @map("Keluar (Service)")
  DAMAGED         @map("Rusak")
  DECOMMISSIONED  @map("Diberhentikan")
  AWAITING_RETURN @map("Menunggu Pengembalian")
  CONSUMED        @map("Habis Terpakai")
}
```

#### AssetCondition Enum

```prisma
enum AssetCondition {
  BRAND_NEW    @map("Baru")
  GOOD         @map("Baik")
  USED_OKAY    @map("Bekas Layak Pakai")
  MINOR_DAMAGE @map("Rusak Ringan")
  MAJOR_DAMAGE @map("Rusak Berat")
  FOR_PARTS    @map("Kanibal")
}
```

---

### 4. Stock Management

#### StockThreshold

| Field            | Type         | Description             |
| ---------------- | ------------ | ----------------------- |
| `id`             | Int          | Primary key             |
| `itemName`       | String (255) | Item name               |
| `brand`          | String (255) | Brand name              |
| `categoryId`     | Int?         | FK to AssetCategory     |
| `thresholdValue` | Int          | Minimum stock level     |
| `alertEnabled`   | Boolean      | Enable low stock alerts |
| `createdById`    | Int          | FK to User              |

**Unique:** `[itemName, brand]`

#### StockMovement

| Field             | Type             | Description                |
| ----------------- | ---------------- | -------------------------- |
| `id`              | BigInt           | Primary key                |
| `assetName`       | String (255)     | Asset/item name            |
| `brand`           | String (255)     | Brand                      |
| `date`            | DateTime         | Movement date              |
| `type`            | MovementType     | Movement type              |
| `quantity`        | Decimal (10,2)   | Quantity moved             |
| `balanceAfter`    | Decimal (10,2)   | Balance after movement     |
| `referenceId`     | String?          | Reference document ID      |
| `actorId`         | Int              | User who made the movement |
| `actorName`       | String (255)     | User name                  |
| `notes`           | Text?            | Notes                      |
| `locationContext` | LocationContext? | WAREHOUSE or CUSTODY       |
| `relatedAssetId`  | String?          | FK to Asset                |

#### MovementType Enum

```prisma
enum MovementType {
  IN_PURCHASE        // Stock in from purchase
  IN_RETURN          // Stock in from return
  OUT_INSTALLATION   // Stock out for installation
  OUT_HANDOVER       // Stock out for handover
  OUT_BROKEN         // Stock out (damaged)
  OUT_ADJUSTMENT     // Manual adjustment
  OUT_USAGE_CUSTODY  // Stock out (custody usage)
}
```

---

### 5. Request Management

#### Request

| Field                  | Type              | Description                               |
| ---------------------- | ----------------- | ----------------------------------------- |
| `id`                   | String (CUID)     | Primary key                               |
| `docNumber`            | String (50)       | Unique document number (RO-YYYYMMDD-XXXX) |
| `requesterId`          | Int               | FK to User                                |
| `requesterName`        | String (255)      | Requester name                            |
| `divisionId`           | Int               | Division ID                               |
| `divisionName`         | String (255)      | Division name                             |
| `requestDate`          | DateTime          | Request date                              |
| `orderType`            | OrderType         | REGULAR_STOCK, URGENT, PROJECT_BASED      |
| `allocationTarget`     | AllocationTarget? | USAGE or INVENTORY                        |
| `justification`        | Text?             | Request justification                     |
| `projectName`          | String?           | Project name (if project-based)           |
| `status`               | ItemStatus        | Request status                            |
| `totalValue`           | Decimal?          | Total estimated value                     |
| `logisticApproverId`   | Int?              | Logistic approver                         |
| `logisticApprovalDate` | DateTime?         | Logistic approval date                    |
| `finalApproverId`      | Int?              | Final approver                            |
| `finalApprovalDate`    | DateTime?         | Final approval date                       |
| `rejectedById`         | Int?              | Rejector                                  |
| `rejectionDate`        | DateTime?         | Rejection date                            |
| `rejectionReason`      | Text?             | Rejection reason                          |
| `actualShipmentDate`   | DateTime?         | Shipment date                             |
| `arrivalDate`          | DateTime?         | Arrival date                              |
| `completionDate`       | DateTime?         | Completion date                           |
| `isPrioritizedByCEO`   | Boolean           | CEO priority flag                         |
| `isRegistered`         | Boolean           | Assets registered flag                    |

**Indexes:** `[status, requestDate]`, `[requesterId, divisionId]`, `[docNumber]`

#### RequestItem

| Field                | Type                | Description               |
| -------------------- | ------------------- | ------------------------- |
| `id`                 | Int                 | Primary key               |
| `requestId`          | String              | FK to Request             |
| `itemName`           | String (255)        | Item name                 |
| `itemTypeBrand`      | String (255)        | Type and brand            |
| `quantity`           | Int                 | Requested quantity        |
| `unit`               | String?             | Unit                      |
| `keterangan`         | Text                | Description               |
| `availableStock`     | Int?                | Current available stock   |
| `approvalStatus`     | ItemApprovalStatus? | Approval status           |
| `approvedQuantity`   | Int?                | Approved quantity         |
| `rejectionReason`    | Text?               | Per-item rejection reason |
| `purchasePrice`      | Decimal?            | Purchase price            |
| `vendor`             | String?             | Vendor                    |
| `poNumber`           | String?             | PO number                 |
| `registeredQuantity` | Int                 | Assets registered count   |

#### ItemStatus Enum

```prisma
enum ItemStatus {
  PENDING               @map("Menunggu")
  LOGISTIC_APPROVED     @map("Disetujui Logistik")
  AWAITING_CEO_APPROVAL @map("Menunggu CEO")
  APPROVED              @map("Disetujui")
  PURCHASING            @map("Proses Pembelian")
  IN_DELIVERY           @map("Dalam Pengiriman")
  ARRIVED               @map("Tiba")
  COMPLETED             @map("Selesai")
  REJECTED              @map("Ditolak")
  CANCELLED             @map("Dibatalkan")
  AWAITING_HANDOVER     @map("Siap Serah Terima")
  IN_PROGRESS           @map("Dalam Proses")
}
```

---

### 6. Loan Management

#### LoanRequest

| Field              | Type              | Description        |
| ------------------ | ----------------- | ------------------ |
| `id`               | String (CUID)     | Primary key        |
| `requesterId`      | Int               | FK to User         |
| `requesterName`    | String (255)      | Requester name     |
| `divisionId`       | Int               | Division ID        |
| `divisionName`     | String (255)      | Division name      |
| `requestDate`      | DateTime          | Request date       |
| `status`           | LoanRequestStatus | Loan status        |
| `notes`            | Text?             | Notes              |
| `approverId`       | Int?              | Approver           |
| `approvalDate`     | DateTime?         | Approval date      |
| `rejectionReason`  | Text?             | Rejection reason   |
| `actualReturnDate` | DateTime?         | Actual return date |
| `handoverId`       | String?           | Handover reference |
| `returnedAssetIds` | JSON?             | Returned asset IDs |

#### LoanRequestStatus Enum

```prisma
enum LoanRequestStatus {
  PENDING         @map("Menunggu Persetujuan")
  APPROVED        @map("Disetujui")
  ON_LOAN         @map("Dipinjam")
  RETURNED        @map("Dikembalikan")
  REJECTED        @map("Ditolak")
  OVERDUE         @map("Terlambat")
  AWAITING_RETURN @map("Menunggu Pengembalian")
}
```

#### LoanItem

| Field              | Type                | Description          |
| ------------------ | ------------------- | -------------------- |
| `id`               | Int                 | Primary key          |
| `loanRequestId`    | String              | FK to LoanRequest    |
| `itemName`         | String (255)        | Item name            |
| `brand`            | String (255)        | Brand                |
| `quantity`         | Int                 | Quantity             |
| `unit`             | String?             | Unit                 |
| `keterangan`       | Text                | Description          |
| `returnDate`       | Date?               | Expected return date |
| `approvalStatus`   | ItemApprovalStatus? | Approval status      |
| `approvedQuantity` | Int?                | Approved quantity    |

#### LoanAssetAssignment

| Field           | Type      | Description       |
| --------------- | --------- | ----------------- |
| `id`            | Int       | Primary key       |
| `loanRequestId` | String    | FK to LoanRequest |
| `loanItemId`    | Int       | FK to LoanItem    |
| `assetId`       | String    | FK to Asset       |
| `assignedAt`    | DateTime  | Assignment date   |
| `returnedAt`    | DateTime? | Return date       |

---

### 7. Asset Return

#### AssetReturn

| Field              | Type              | Description               |
| ------------------ | ----------------- | ------------------------- |
| `id`               | String (CUID)     | Primary key               |
| `docNumber`        | String (50)       | Unique (RTN-YYYY-MM-XXXX) |
| `returnDate`       | DateTime          | Return date               |
| `loanRequestId`    | String            | FK to LoanRequest         |
| `returnedById`     | Int               | Returner user ID          |
| `returnedByName`   | String (255)      | Returner name             |
| `status`           | AssetReturnStatus | Return status             |
| `verifiedById`     | Int?              | Verifier                  |
| `verificationDate` | DateTime?         | Verification date         |

#### AssetReturnItem

| Field               | Type             | Description                 |
| ------------------- | ---------------- | --------------------------- |
| `id`                | Int              | Primary key                 |
| `returnId`          | String           | FK to AssetReturn           |
| `assetId`           | String           | FK to Asset                 |
| `returnedCondition` | AssetCondition   | Condition at return         |
| `notes`             | Text?            | Notes                       |
| `status`            | ReturnItemStatus | PENDING, ACCEPTED, REJECTED |
| `verificationNotes` | Text?            | Verification notes          |

---

### 8. Handover

#### Handover

| Field             | Type          | Description               |
| ----------------- | ------------- | ------------------------- |
| `id`              | String (CUID) | Primary key               |
| `docNumber`       | String (50)   | Unique (HO-YYYY-MM-XXXX)  |
| `handoverDate`    | DateTime      | Handover date             |
| `menyerahkanId`   | Int           | FK to User (giver)        |
| `menyerahkanName` | String (255)  | Giver name                |
| `penerimaId`      | Int           | FK to User (receiver)     |
| `penerimaName`    | String (255)  | Receiver name             |
| `mengetahuiId`    | Int           | FK to User (acknowledger) |
| `mengetahuiName`  | String (255)  | Acknowledger name         |
| `woRoIntNumber`   | String?       | Work order reference      |
| `status`          | ItemStatus    | Handover status           |

#### HandoverItem

| Field            | Type         | Description            |
| ---------------- | ------------ | ---------------------- |
| `id`             | Int          | Primary key            |
| `handoverId`     | String       | FK to Handover         |
| `assetId`        | String?      | FK to Asset (optional) |
| `itemName`       | String (255) | Item name              |
| `itemTypeBrand`  | String (255) | Type/brand             |
| `conditionNotes` | Text         | Condition notes        |
| `quantity`       | Int          | Quantity               |
| `unit`           | String?      | Unit                   |
| `checked`        | Boolean      | Checked by receiver    |
| `isLocked`       | Boolean      | Edit locked            |

---

### 9. Customer & Field Operations

#### Customer

| Field              | Type           | Description                 |
| ------------------ | -------------- | --------------------------- |
| `id`               | String (CUID)  | Primary key                 |
| `name`             | String (255)   | Customer name               |
| `address`          | Text           | Address                     |
| `phone`            | String (50)    | Phone number                |
| `email`            | String (255)   | Email                       |
| `status`           | CustomerStatus | ACTIVE, INACTIVE, SUSPENDED |
| `installationDate` | Date           | Installation date           |
| `servicePackage`   | String (255)   | Service package             |
| `notes`            | Text?          | Notes                       |

#### Installation

| Field              | Type          | Description                |
| ------------------ | ------------- | -------------------------- |
| `id`               | String (CUID) | Primary key                |
| `docNumber`        | String (50)   | Unique (INST-YYYY-MM-XXXX) |
| `requestNumber`    | String?       | Reference request          |
| `installationDate` | DateTime      | Installation date          |
| `technicianId`     | Int           | FK to User (technician)    |
| `technicianName`   | String (255)  | Technician name            |
| `customerId`       | String        | FK to Customer             |
| `customerName`     | String (255)  | Customer name              |
| `notes`            | Text          | Installation notes         |
| `status`           | ItemStatus    | Installation status        |

#### Maintenance

| Field                | Type          | Description               |
| -------------------- | ------------- | ------------------------- |
| `id`                 | String (CUID) | Primary key               |
| `docNumber`          | String (50)   | Unique (MNT-YYYY-MM-XXXX) |
| `maintenanceDate`    | DateTime      | Maintenance date          |
| `technicianId`       | Int           | FK to User                |
| `customerId`         | String        | FK to Customer            |
| `problemDescription` | Text          | Problem description       |
| `actionsTaken`       | Text          | Actions taken             |
| `workTypes`          | String[]      | Work type array           |
| `priority`           | String?       | Priority level            |
| `status`             | ItemStatus    | Maintenance status        |
| `completionDate`     | DateTime?     | Completion date           |

#### Dismantle

| Field                | Type           | Description               |
| -------------------- | -------------- | ------------------------- |
| `id`                 | String (CUID)  | Primary key               |
| `docNumber`          | String (50)    | Unique (DSM-YYYY-MM-XXXX) |
| `assetId`            | String         | Asset being dismantled    |
| `assetName`          | String (255)   | Asset name                |
| `dismantleDate`      | DateTime       | Dismantle date            |
| `technicianId`       | Int            | FK to User                |
| `customerId`         | String         | FK to Customer            |
| `retrievedCondition` | AssetCondition | Condition when retrieved  |
| `notes`              | Text?          | Notes                     |
| `status`             | ItemStatus     | Dismantle status          |

---

### 10. System Support

#### Notification

| Field         | Type         | Description                    |
| ------------- | ------------ | ------------------------------ |
| `id`          | Int          | Primary key                    |
| `message`     | Text         | Notification message           |
| `type`        | String (50)  | Notification type              |
| `recipientId` | Int          | FK to User                     |
| `actorName`   | String (255) | Who triggered the notification |
| `referenceId` | String?      | Reference document ID          |
| `isRead`      | Boolean      | Read status                    |
| `timestamp`   | DateTime     | Notification time              |
| `actionData`  | JSON?        | Action button data             |

**Indexes:** `[recipientId, isRead]`, `[timestamp]`

#### ActivityLog

| Field         | Type         | Description                        |
| ------------- | ------------ | ---------------------------------- |
| `id`          | BigInt       | Primary key                        |
| `timestamp`   | DateTime     | Log timestamp                      |
| `userId`      | Int          | FK to User                         |
| `userName`    | String (255) | User name                          |
| `action`      | String (255) | Action description                 |
| `details`     | Text         | Detailed log                       |
| `entityType`  | String (50)  | Entity type (Asset, Request, etc.) |
| `entityId`    | String       | Entity ID                          |
| `referenceId` | String?      | Reference document ID              |

**Indexes:** `[entityType, entityId]`, `[timestamp]`, `[userId]`

#### Attachment

| Field        | Type           | Description        |
| ------------ | -------------- | ------------------ |
| `id`         | Int            | Primary key        |
| `name`       | String (255)   | File name          |
| `url`        | Text           | File URL           |
| `type`       | AttachmentType | IMAGE, PDF, OTHER  |
| `size`       | Int?           | File size in bytes |
| `mimeType`   | String?        | MIME type          |
| `entityType` | String (50)    | Parent entity type |
| `entityId`   | String         | Parent entity ID   |
| `uploadedAt` | DateTime       | Upload timestamp   |

#### WhatsAppLog

| Field           | Type         | Description           |
| --------------- | ------------ | --------------------- |
| `id`            | BigInt       | Primary key           |
| `targetGroup`   | String (100) | Target group ID       |
| `groupName`     | String (255) | Group name            |
| `message`       | Text         | Message content       |
| `referenceId`   | String?      | Reference document    |
| `referenceType` | String?      | Reference type        |
| `status`        | String (50)  | pending, sent, failed |
| `sentAt`        | DateTime?    | Sent timestamp        |
| `errorMessage`  | Text?        | Error message         |
| `sentById`      | Int          | Sender user ID        |

#### SystemConfig

| Field         | Type         | Description                   |
| ------------- | ------------ | ----------------------------- |
| `id`          | Int          | Primary key                   |
| `key`         | String (100) | Unique config key             |
| `value`       | Text         | Config value                  |
| `dataType`    | String (20)  | string, number, boolean, json |
| `category`    | String (50)  | Config category               |
| `description` | Text?        | Description                   |
| `isPublic`    | Boolean      | Publicly accessible           |

---

## 📊 Model Statistics

| Category    | Models  | Description                                                                  |
| ----------- | ------- | ---------------------------------------------------------------------------- |
| Master Data | 5       | Division, User, UserPreference, AssetCategory, AssetType, StandardItem       |
| Core Asset  | 3       | Asset, StockThreshold, StockMovement                                         |
| Requests    | 3       | Request, RequestItem, RequestActivity                                        |
| Loans       | 4       | LoanRequest, LoanItem, LoanAssetAssignment, AssetReturn                      |
| Handover    | 2       | Handover, HandoverItem                                                       |
| Field Ops   | 6       | Customer, Installation, Maintenance, Dismantle, InstalledMaterial, Materials |
| System      | 5       | Notification, ActivityLog, Attachment, WhatsAppLog, SystemConfig             |
| **Total**   | **27+** | **Production-ready schema**                                                  |

---

## 🔧 Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: destroys data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

---

## 📈 Performance Indexes

Indexes yang sudah dikonfigurasi untuk optimasi query:

| Table             | Index                      | Purpose               |
| ----------------- | -------------------------- | --------------------- |
| `users`           | `[email]`                  | Login lookup          |
| `users`           | `[role, divisionId]`       | Role-based filtering  |
| `assets`          | `[status, categoryId]`     | Dashboard queries     |
| `assets`          | `[serialNumber]`           | Asset lookup          |
| `assets`          | `[macAddress]`             | Network device lookup |
| `requests`        | `[status, requestDate]`    | Request listing       |
| `requests`        | `[docNumber]`              | Document lookup       |
| `stock_movements` | `[assetName, brand, date]` | Stock history         |
| `notifications`   | `[recipientId, isRead]`    | Unread count          |
| `activity_logs`   | `[entityType, entityId]`   | Entity history        |

---

**Versi Dokumen:** 2.0  
**Terakhir Diperbarui:** 22 Januari 2026  
**Maintainer:** Development Team
