# 🏗️ Trinity Asset Management - API Reference

> **Versi:** 2.0  
> **Terakhir Diperbarui:** 22 Januari 2026  
> **Base URL:** `http://localhost:3001/api/v1`

## 📋 Overview

Dokumentasi lengkap REST API untuk Trinity Asset Management System menggunakan **NestJS** dengan arsitektur modular. API ini production-ready dengan fitur authentication, authorization (RBAC), rate limiting, dan comprehensive error handling.

---

## 🔐 Authentication

### Headers

Semua endpoint (kecuali login) memerlukan JWT authentication:

```
Authorization: Bearer <access_token>
```

### Token Flow

```
┌─────────────┐    POST /auth/login    ┌─────────────┐
│   Client    │ ──────────────────────> │   Server    │
│             │ <────────────────────── │             │
│             │   { accessToken,        │             │
│             │     refreshToken,       │             │
│             │     user }              │             │
└─────────────┘                         └─────────────┘
```

---

## 📦 API Modules

| Module                                    | Base Path         | Description                    |
| ----------------------------------------- | ----------------- | ------------------------------ |
| [Auth](#1-auth-module)                    | `/auth`           | Authentication & session       |
| [Users](#2-users-module)                  | `/users`          | User management                |
| [Divisions](#3-divisions-module)          | `/divisions`      | Division/department management |
| [Assets](#4-assets-module)                | `/assets`         | Asset inventory CRUD           |
| [Categories](#5-categories-module)        | `/categories`     | Asset categories hierarchy     |
| [Requests](#6-requests-module)            | `/requests`       | Purchase requests workflow     |
| [Loans](#7-loans-module)                  | `/loans`          | Asset loan management          |
| [Transactions](#8-transactions-module)    | `/transactions/*` | Handovers, Installations, etc. |
| [Customers](#9-customers-module)          | `/customers`      | Customer management            |
| [Dashboard](#10-dashboard-module)         | `/dashboard`      | Analytics & metrics            |
| [Notifications](#11-notifications-module) | `/notifications`  | System notifications           |
| [Reports](#12-reports-module)             | `/reports`        | Reporting & exports            |

---

## 1. Auth Module

**Base Path:** `/auth`

### Endpoints

| Method | Path                           | Description            | Auth | Rate Limit |
| ------ | ------------------------------ | ---------------------- | ---- | ---------- |
| `POST` | `/auth/login`                  | User login             | ❌   | 5/min      |
| `POST` | `/auth/register`               | Register new user      | ❌   | 3/min      |
| `GET`  | `/auth/me`                     | Get current user       | ✅   | -          |
| `POST` | `/auth/verify`                 | Verify JWT token       | ✅   | -          |
| `POST` | `/auth/request-password-reset` | Request password reset | ❌   | 3/min      |

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@trinitimedia.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Admin Logistik",
    "email": "admin@trinitimedia.com",
    "role": "ADMIN_LOGISTIK",
    "divisionId": 1,
    "permissions": ["dashboard:view", "assets:view", "assets:create", ...]
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": 1,
  "name": "Admin Logistik",
  "email": "admin@trinitimedia.com",
  "role": "ADMIN_LOGISTIK",
  "division": {
    "id": 1,
    "name": "Logistik"
  },
  "permissions": ["dashboard:view", "assets:view", ...]
}
```

---

## 2. Users Module

**Base Path:** `/users`

### Endpoints

| Method   | Path                        | Description                | Roles Required              |
| -------- | --------------------------- | -------------------------- | --------------------------- |
| `POST`   | `/users`                    | Create user                | SUPER_ADMIN, ADMIN_LOGISTIK |
| `GET`    | `/users`                    | List all users (paginated) | All authenticated           |
| `GET`    | `/users/:id`                | Get user by ID             | All authenticated           |
| `PATCH`  | `/users/:id`                | Update user                | SUPER_ADMIN, ADMIN_LOGISTIK |
| `DELETE` | `/users/:id`                | Soft delete user           | SUPER_ADMIN                 |
| `PATCH`  | `/users/:id/reset-password` | Reset password             | SUPER_ADMIN, ADMIN_LOGISTIK |
| `PATCH`  | `/users/:id/permissions`    | Update permissions         | SUPER_ADMIN                 |

### Create User

```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@trinitimedia.com",
  "password": "SecurePass123!",
  "role": "STAFF",
  "divisionId": 2,
  "permissions": ["dashboard:view", "assets:view"]
}
```

### List Users (Paginated)

```http
GET /users?skip=0&take=20&role=STAFF&divisionId=1&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `skip` | number | Offset for pagination |
| `take` | number | Limit per page (default: 20) |
| `role` | string | Filter by UserRole |
| `divisionId` | number | Filter by division |
| `search` | string | Search by name/email |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@trinitimedia.com",
      "role": "STAFF",
      "division": { "id": 2, "name": "IT" },
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 50,
  "skip": 0,
  "take": 20
}
```

---

## 3. Divisions Module

**Base Path:** `/divisions`

### Endpoints

| Method   | Path             | Description        | Roles Required    |
| -------- | ---------------- | ------------------ | ----------------- |
| `POST`   | `/divisions`     | Create division    | SUPER_ADMIN       |
| `GET`    | `/divisions`     | List all divisions | All authenticated |
| `GET`    | `/divisions/:id` | Get division by ID | All authenticated |
| `PATCH`  | `/divisions/:id` | Update division    | SUPER_ADMIN       |
| `DELETE` | `/divisions/:id` | Delete division    | SUPER_ADMIN       |

### Create Division

```http
POST /divisions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "IT Department"
}
```

---

## 4. Assets Module

**Base Path:** `/assets`

### Endpoints

| Method   | Path                         | Description                | Roles Required                       |
| -------- | ---------------------------- | -------------------------- | ------------------------------------ |
| `POST`   | `/assets`                    | Create single asset        | SUPER_ADMIN, ADMIN_LOGISTIK          |
| `POST`   | `/assets/bulk`               | Bulk create assets         | SUPER_ADMIN, ADMIN_LOGISTIK          |
| `GET`    | `/assets`                    | List assets (paginated)    | All authenticated                    |
| `GET`    | `/assets/stock-summary`      | Get stock summary          | All authenticated                    |
| `GET`    | `/assets/stock-movements`    | Get stock movement history | All authenticated                    |
| `GET`    | `/assets/check-availability` | Check stock availability   | All authenticated                    |
| `GET`    | `/assets/:id`                | Get asset by ID            | All authenticated                    |
| `PATCH`  | `/assets/:id`                | Update asset               | SUPER_ADMIN, ADMIN_LOGISTIK          |
| `PATCH`  | `/assets/:id/status`         | Update asset status        | SUPER_ADMIN, ADMIN_LOGISTIK, TEKNISI |
| `DELETE` | `/assets/:id`                | Soft delete asset          | SUPER_ADMIN                          |
| `POST`   | `/assets/consume`            | Consume stock              | SUPER_ADMIN, ADMIN_LOGISTIK, TEKNISI |

### Create Asset

```http
POST /assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mikrotik CCR1036-12G-4S",
  "categoryId": 1,
  "typeId": 2,
  "brand": "Mikrotik",
  "serialNumber": "SN-12345-67890",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "purchasePrice": 15000000,
  "vendor": "PT Supplier Network",
  "poNumber": "PO-2026-0001",
  "invoiceNumber": "INV-2026-0001",
  "purchaseDate": "2026-01-15",
  "warrantyEndDate": "2028-01-15",
  "status": "IN_STORAGE",
  "condition": "BRAND_NEW",
  "notes": "Router utama untuk customer baru"
}
```

**Response:**

```json
{
  "id": "clu1a2b3c4d5e6f7g8h9",
  "name": "Mikrotik CCR1036-12G-4S",
  "categoryId": 1,
  "brand": "Mikrotik",
  "serialNumber": "SN-12345-67890",
  "status": "IN_STORAGE",
  "condition": "BRAND_NEW",
  "registrationDate": "2026-01-22T08:30:00Z",
  "createdAt": "2026-01-22T08:30:00Z"
}
```

### List Assets (Paginated)

```http
GET /assets?skip=0&take=50&status=IN_STORAGE&categoryId=1&search=mikrotik
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `skip` | number | Offset for pagination |
| `take` | number | Limit per page |
| `status` | string | Filter by AssetStatus |
| `categoryId` | number | Filter by category |
| `typeId` | number | Filter by type |
| `brand` | string | Filter by brand |
| `customerId` | string | Filter by customer |
| `search` | string | Full text search |

### Get Stock Summary

```http
GET /assets/stock-summary
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "name": "Mikrotik CCR1036-12G-4S",
      "brand": "Mikrotik",
      "categoryId": 1,
      "categoryName": "Network Equipment",
      "totalStock": 25,
      "inStorage": 10,
      "inUse": 12,
      "inRepair": 3
    }
  ]
}
```

### Consume Stock (for Installation/Maintenance)

```http
POST /assets/consume
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "clu1a2b3c4d5e6f7g8h9",
  "quantity": 1,
  "referenceType": "INSTALLATION",
  "referenceId": "INST-2026-01-0001",
  "notes": "Instalasi di customer ABC"
}
```

---

## 5. Categories Module

**Base Path:** `/categories`

### Category Endpoints

| Method   | Path               | Description                    | Roles Required              |
| -------- | ------------------ | ------------------------------ | --------------------------- |
| `POST`   | `/categories`      | Create category                | SUPER_ADMIN, ADMIN_LOGISTIK |
| `GET`    | `/categories`      | List all categories with types | All authenticated           |
| `GET`    | `/categories/:id`  | Get category by ID             | All authenticated           |
| `PATCH`  | `/categories/:id`  | Update category                | SUPER_ADMIN, ADMIN_LOGISTIK |
| `DELETE` | `/categories/:id`  | Soft delete category           | SUPER_ADMIN                 |
| `PUT`    | `/categories/bulk` | Bulk update categories         | SUPER_ADMIN, ADMIN_LOGISTIK |

### Type Endpoints

| Method   | Path                            | Description    |
| -------- | ------------------------------- | -------------- |
| `POST`   | `/categories/:categoryId/types` | Create type    |
| `GET`    | `/categories/:categoryId/types` | List types     |
| `GET`    | `/types/:id`                    | Get type by ID |
| `PATCH`  | `/types/:id`                    | Update type    |
| `DELETE` | `/types/:id`                    | Delete type    |

### Standard Item (Model) Endpoints

| Method   | Path                    | Description     |
| -------- | ----------------------- | --------------- |
| `POST`   | `/types/:typeId/models` | Create model    |
| `GET`    | `/types/:typeId/models` | List models     |
| `GET`    | `/models/:id`           | Get model by ID |
| `PATCH`  | `/models/:id`           | Update model    |
| `DELETE` | `/models/:id`           | Delete model    |

### Get Categories with Hierarchy

```http
GET /categories
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Network Equipment",
      "isCustomerInstallable": true,
      "types": [
        {
          "id": 1,
          "name": "Router",
          "classification": "ASSET",
          "trackingMethod": "INDIVIDUAL",
          "standardItems": [
            {
              "id": 1,
              "name": "CCR1036-12G-4S",
              "brand": "Mikrotik"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 6. Requests Module

**Base Path:** `/requests`

### Endpoints

| Method  | Path                     | Description                  | Roles Required                              |
| ------- | ------------------------ | ---------------------------- | ------------------------------------------- |
| `POST`  | `/requests`              | Create request               | All authenticated                           |
| `GET`   | `/requests`              | List requests (paginated)    | All authenticated                           |
| `GET`   | `/requests/:id`          | Get request by ID            | All authenticated                           |
| `PATCH` | `/requests/:id`          | Update request               | SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE |
| `POST`  | `/requests/:id/approve`  | Approve request              | SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE |
| `POST`  | `/requests/:id/reject`   | Reject request               | SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE |
| `POST`  | `/requests/:id/register` | Register assets from request | SUPER_ADMIN, ADMIN_LOGISTIK                 |
| `PATCH` | `/requests/:id/arrived`  | Mark items arrived           | SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE |
| `PATCH` | `/requests/:id/complete` | Complete request             | SUPER_ADMIN, ADMIN_LOGISTIK                 |
| `POST`  | `/requests/:id/cancel`   | Cancel request               | All authenticated                           |

### Create Request

```http
POST /requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderType": "REGULAR_STOCK",
  "allocationTarget": "INVENTORY",
  "justification": "Pengadaan router untuk proyek baru",
  "items": [
    {
      "itemName": "Mikrotik CCR1036-12G-4S",
      "itemTypeBrand": "Router - Mikrotik",
      "quantity": 5,
      "unit": "unit",
      "keterangan": "Untuk 5 customer baru Q1 2026"
    }
  ]
}
```

**Response:**

```json
{
  "id": "clu1a2b3c4d5e6f7g8h9",
  "docNumber": "RO-20260122-0001",
  "requesterId": 1,
  "requesterName": "John Doe",
  "divisionId": 2,
  "divisionName": "IT",
  "requestDate": "2026-01-22T10:00:00Z",
  "orderType": "REGULAR_STOCK",
  "status": "PENDING",
  "items": [...]
}
```

### Approve Request

```http
POST /requests/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approvalType": "logistic",
  "items": [
    {
      "id": 1,
      "approvalStatus": "APPROVED",
      "approvedQuantity": 5
    }
  ],
  "notes": "Disetujui untuk pengadaan Q1"
}
```

---

## 7. Loans Module

**Base Path:** `/loans`

### Loan Request Endpoints

| Method   | Path                 | Description         | Roles Required              |
| -------- | -------------------- | ------------------- | --------------------------- |
| `POST`   | `/loans`             | Create loan request | All authenticated           |
| `GET`    | `/loans`             | List loan requests  | All authenticated           |
| `GET`    | `/loans/:id`         | Get loan by ID      | All authenticated           |
| `POST`   | `/loans/:id/approve` | Approve loan        | SUPER_ADMIN, ADMIN_LOGISTIK |
| `POST`   | `/loans/:id/reject`  | Reject loan         | SUPER_ADMIN, ADMIN_LOGISTIK |
| `DELETE` | `/loans/:id`         | Delete loan request | All authenticated           |
| `POST`   | `/loans/:id/return`  | Submit return       | All authenticated           |

### Return Endpoints

| Method  | Path                   | Description            | Roles Required              |
| ------- | ---------------------- | ---------------------- | --------------------------- |
| `POST`  | `/returns`             | Create return document | All authenticated           |
| `GET`   | `/returns`             | List returns           | All authenticated           |
| `GET`   | `/returns/:id`         | Get return by ID       | All authenticated           |
| `PATCH` | `/returns/:id`         | Update return          | SUPER_ADMIN, ADMIN_LOGISTIK |
| `POST`  | `/returns/:id/process` | Process return batch   | SUPER_ADMIN, ADMIN_LOGISTIK |
| `POST`  | `/returns/:id/verify`  | Verify return          | SUPER_ADMIN, ADMIN_LOGISTIK |

### Create Loan Request

```http
POST /loans
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Pinjaman laptop untuk event",
  "items": [
    {
      "itemName": "Laptop Dell Latitude 5520",
      "brand": "Dell",
      "quantity": 2,
      "unit": "unit",
      "keterangan": "Untuk presentasi client",
      "returnDate": "2026-02-15"
    }
  ]
}
```

---

## 8. Transactions Module

**Base Path:** `/transactions`

### Handovers

| Method | Path                          | Description     |
| ------ | ----------------------------- | --------------- |
| `POST` | `/transactions/handovers`     | Create handover |
| `GET`  | `/transactions/handovers`     | List handovers  |
| `GET`  | `/transactions/handovers/:id` | Get handover    |

### Installations

| Method | Path                              | Description         |
| ------ | --------------------------------- | ------------------- |
| `POST` | `/transactions/installations`     | Create installation |
| `GET`  | `/transactions/installations`     | List installations  |
| `GET`  | `/transactions/installations/:id` | Get installation    |

### Dismantles

| Method  | Path                                    | Description        |
| ------- | --------------------------------------- | ------------------ |
| `POST`  | `/transactions/dismantles`              | Create dismantle   |
| `GET`   | `/transactions/dismantles`              | List dismantles    |
| `GET`   | `/transactions/dismantles/:id`          | Get dismantle      |
| `PATCH` | `/transactions/dismantles/:id/complete` | Complete dismantle |

### Maintenances

| Method  | Path                                      | Description          |
| ------- | ----------------------------------------- | -------------------- |
| `POST`  | `/transactions/maintenances`              | Create maintenance   |
| `GET`   | `/transactions/maintenances`              | List maintenances    |
| `GET`   | `/transactions/maintenances/:id`          | Get maintenance      |
| `PATCH` | `/transactions/maintenances/:id/complete` | Complete maintenance |

### Create Installation

```http
POST /transactions/installations
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "CUST-0001",
  "installationDate": "2026-01-22",
  "technicianId": 5,
  "woNumber": "WO-2026-0001",
  "notes": "Instalasi perangkat baru",
  "assets": [
    {
      "assetId": "clu1a2b3c4d5e6f7g8h9",
      "notes": "Router utama"
    }
  ],
  "consumedMaterials": [
    {
      "assetId": "clu2b3c4d5e6f7g8h9i0",
      "quantity": 50,
      "unit": "meter"
    }
  ]
}
```

---

## 9. Customers Module

**Base Path:** `/customers`

### Endpoints

| Method   | Path                    | Description           | Roles Required                       |
| -------- | ----------------------- | --------------------- | ------------------------------------ |
| `POST`   | `/customers`            | Create customer       | SUPER_ADMIN, ADMIN_LOGISTIK, TEKNISI |
| `GET`    | `/customers`            | List customers        | All authenticated                    |
| `GET`    | `/customers/:id`        | Get customer          | All authenticated                    |
| `GET`    | `/customers/:id/assets` | Get customer's assets | All authenticated                    |
| `PATCH`  | `/customers/:id`        | Update customer       | SUPER_ADMIN, ADMIN_LOGISTIK          |
| `DELETE` | `/customers/:id`        | Soft delete customer  | SUPER_ADMIN                          |

### Create Customer

```http
POST /customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "PT ABC Corporation",
  "customerIdNumber": "CID-2026-001",
  "address": "Jl. Sudirman No. 123, Jakarta",
  "city": "Jakarta",
  "phone": "021-1234567",
  "email": "contact@abc-corp.com",
  "contactPerson": "John Smith"
}
```

---

## 10. Dashboard Module

**Base Path:** `/dashboard`

### Endpoints

| Method | Path                          | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| `GET`  | `/dashboard/summary`          | Comprehensive dashboard metrics |
| `GET`  | `/dashboard/stock-by-model`   | Stock by model summary          |
| `GET`  | `/dashboard/trends`           | Monthly trends (6 months)       |
| `GET`  | `/dashboard/low-stock-alerts` | Items below threshold           |
| `GET`  | `/dashboard/upcoming-returns` | Loans due soon                  |

### Get Dashboard Summary

```http
GET /dashboard/summary
Authorization: Bearer <token>
```

**Response:**

```json
{
  "assets": {
    "total": 500,
    "byStatus": {
      "IN_STORAGE": 150,
      "IN_USE": 280,
      "UNDER_REPAIR": 30,
      "DAMAGED": 40
    },
    "totalValue": 2500000000
  },
  "requests": {
    "pending": 12,
    "approved": 45,
    "completed": 200
  },
  "loans": {
    "active": 8,
    "overdue": 2
  },
  "customers": {
    "total": 150,
    "active": 120
  },
  "recentActivities": [...]
}
```

### Get Low Stock Alerts

```http
GET /dashboard/low-stock-alerts?threshold=5
Authorization: Bearer <token>
```

---

## 11. Notifications Module

**Base Path:** `/notifications`

### Endpoints

| Method   | Path                           | Description                          |
| -------- | ------------------------------ | ------------------------------------ |
| `GET`    | `/notifications`               | Get user's notifications (paginated) |
| `GET`    | `/notifications/unread-count`  | Get unread count                     |
| `PATCH`  | `/notifications/:id/read`      | Mark as read                         |
| `POST`   | `/notifications/mark-all-read` | Mark all as read                     |
| `DELETE` | `/notifications/:id`           | Delete notification                  |

### Get Notifications

```http
GET /notifications?page=1&limit=20&unread=true
Authorization: Bearer <token>
```

---

## 12. Reports Module

**Base Path:** `/reports`  
**Roles Required:** SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE

### Endpoints

| Method | Path                        | Description                |
| ------ | --------------------------- | -------------------------- |
| `GET`  | `/reports/assets/inventory` | Asset inventory report     |
| `GET`  | `/reports/assets/movements` | Asset movement report      |
| `GET`  | `/reports/requests/summary` | Request summary report     |
| `GET`  | `/reports/loans/status`     | Loan status report         |
| `GET`  | `/reports/customers`        | Customer report            |
| `GET`  | `/reports/maintenances`     | Maintenance history report |

### Asset Inventory Report

```http
GET /reports/assets/inventory?categoryId=1&status=IN_STORAGE&startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

---

## 📝 Document ID Formats

| Entity       | Format              | Example                |
| ------------ | ------------------- | ---------------------- |
| Asset        | Auto-generated CUID | `clu1a2b3c4d5e6f7g8h9` |
| Request      | `RO-YYYYMMDD-XXXX`  | `RO-20260122-0001`     |
| Loan         | `RL-YYYY-MM-XXXX`   | `RL-2026-01-0001`      |
| Return       | `RTN-YYYY-MM-XXXX`  | `RTN-2026-01-0001`     |
| Handover     | `HO-YYYY-MM-XXXX`   | `HO-2026-01-0001`      |
| Installation | `INST-YYYY-MM-XXXX` | `INST-2026-01-0001`    |
| Dismantle    | `DSM-YYYY-MM-XXXX`  | `DSM-2026-01-0001`     |
| Maintenance  | `MNT-YYYY-MM-XXXX`  | `MNT-2026-01-0001`     |
| Customer     | `CUST-XXXX`         | `CUST-0001`            |

---

## 🔄 Common Response Formats

### Success Response (Single Item)

```json
{
  "id": "...",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2026-01-22T10:00:00Z"
}
```

### Success Response (Paginated List)

```json
{
  "data": [...],
  "total": 100,
  "skip": 0,
  "take": 20
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequest",
  "details": [
    {
      "field": "email",
      "message": "Email tidak valid"
    }
  ]
}
```

---

## 👤 User Roles

| Role           | Value            | Description                |
| -------------- | ---------------- | -------------------------- |
| Super Admin    | `SUPER_ADMIN`    | Full system access         |
| Admin Logistik | `ADMIN_LOGISTIK` | Asset/inventory management |
| Admin Purchase | `ADMIN_PURCHASE` | Procurement management     |
| Leader         | `LEADER`         | Division leader (approval) |
| Staff          | `STAFF`          | Basic user access          |
| Teknisi        | `TEKNISI`        | Field technician           |

---

## 🚦 Rate Limiting

| Endpoint                            | Limit                    |
| ----------------------------------- | ------------------------ |
| `POST /auth/login`                  | 5 requests per minute    |
| `POST /auth/register`               | 3 requests per minute    |
| `POST /auth/request-password-reset` | 3 requests per minute    |
| General API                         | 1000 requests per minute |

---

## 📚 Status Enums

### AssetStatus

| Value             | Label (ID)            |
| ----------------- | --------------------- |
| `IN_STORAGE`      | Di Gudang             |
| `IN_USE`          | Digunakan             |
| `IN_CUSTODY`      | Dipegang (Custody)    |
| `UNDER_REPAIR`    | Dalam Perbaikan       |
| `OUT_FOR_REPAIR`  | Keluar (Service)      |
| `DAMAGED`         | Rusak                 |
| `DECOMMISSIONED`  | Diberhentikan         |
| `AWAITING_RETURN` | Menunggu Pengembalian |
| `CONSUMED`        | Habis Terpakai        |

### AssetCondition

| Value          | Label (ID)        |
| -------------- | ----------------- |
| `BRAND_NEW`    | Baru              |
| `GOOD`         | Baik              |
| `USED_OKAY`    | Bekas Layak Pakai |
| `MINOR_DAMAGE` | Rusak Ringan      |
| `MAJOR_DAMAGE` | Rusak Berat       |
| `FOR_PARTS`    | Kanibal           |

### ItemStatus (Request Status)

| Value                   | Label (ID)         |
| ----------------------- | ------------------ |
| `PENDING`               | Menunggu           |
| `LOGISTIC_APPROVED`     | Disetujui Logistik |
| `AWAITING_CEO_APPROVAL` | Menunggu CEO       |
| `APPROVED`              | Disetujui          |
| `PURCHASING`            | Proses Pembelian   |
| `IN_DELIVERY`           | Dalam Pengiriman   |
| `ARRIVED`               | Tiba               |
| `COMPLETED`             | Selesai            |
| `REJECTED`              | Ditolak            |
| `CANCELLED`             | Dibatalkan         |

### OrderType

| Value           | Label (ID)    |
| --------------- | ------------- |
| `REGULAR_STOCK` | Regular Stock |
| `URGENT`        | Urgent        |
| `PROJECT_BASED` | Project Based |

### LoanRequestStatus

| Value             | Label (ID)            |
| ----------------- | --------------------- |
| `PENDING`         | Menunggu Persetujuan  |
| `APPROVED`        | Disetujui             |
| `ON_LOAN`         | Dipinjam              |
| `RETURNED`        | Dikembalikan          |
| `REJECTED`        | Ditolak               |
| `OVERDUE`         | Terlambat             |
| `AWAITING_RETURN` | Menunggu Pengembalian |

---

**Versi Dokumen:** 2.0  
**Terakhir Diperbarui:** 22 Januari 2026  
**Maintainer:** Development Team
