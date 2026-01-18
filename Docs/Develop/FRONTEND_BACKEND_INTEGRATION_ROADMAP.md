# 🗺️ Frontend-Backend Integration Roadmap

**Tanggal**: 18 Januari 2026  
**Status**: 🚧 In Progress  
**Versi**: 1.0.0

---

## 📋 Executive Summary

Dokumen ini adalah roadmap eksekusi untuk integrasi frontend React dengan backend NestJS yang telah selesai dikembangkan. Backend sudah 95% siap dengan 12 modules, 80+ API routes, dan 38 unit tests yang lulus.

### Current State

| Komponen            | Status     | Detail                               |
| ------------------- | ---------- | ------------------------------------ |
| Backend NestJS      | ✅ Ready   | 12 modules, 80+ routes, Swagger docs |
| Database PostgreSQL | ✅ Ready   | Schema + indexes + seed data         |
| Frontend React      | ⚠️ Partial | Mock mode, perlu integrasi API       |
| API Layer           | ⚠️ Basic   | fetchClient ada, perlu modularisasi  |
| State Management    | ⚠️ Zustand | Data fetching manual                 |
| Routing             | ❌ Missing | State-based, bukan URL-based         |
| Form Validation     | ❌ Missing | Manual validation                    |

---

## 🎯 Phase 1: API Service Layer (PRIORITAS TINGGI)

**Tujuan**: Membuat struktur API service yang modular dan type-safe

### 1.1 Struktur Folder

```
frontend/src/services/
├── api/
│   ├── index.ts           # Re-export semua API services
│   ├── client.ts          # Axios/Fetch wrapper dengan interceptors
│   ├── types.ts           # API response types
│   ├── auth.api.ts        # Authentication endpoints
│   ├── assets.api.ts      # Asset CRUD + stock operations
│   ├── requests.api.ts    # Request hub operations
│   ├── loans.api.ts       # Loan request workflow
│   ├── transactions.api.ts # Handover, Installation, Return, Dismantle
│   ├── stock.api.ts       # Stock movements & management
│   ├── maintenance.api.ts # Repair & maintenance
│   └── master-data.api.ts # Users, Divisions, Customers, Categories
└── api.ts                 # Legacy file (akan di-refactor)
```

### 1.2 Implementasi

| File                | Endpoint Backend                                             | Status |
| ------------------- | ------------------------------------------------------------ | ------ |
| auth.api.ts         | POST /auth/login, /auth/register, /auth/forgot-password      | 🔲     |
| assets.api.ts       | GET/POST/PATCH/DELETE /assets, /assets/bulk, /assets/consume | 🔲     |
| requests.api.ts     | GET/POST/PATCH /requests                                     | 🔲     |
| loans.api.ts        | GET/POST/PATCH /loan-requests, /loan-requests/:id/approve    | 🔲     |
| transactions.api.ts | /handovers, /installations, /returns, /dismantles            | 🔲     |
| stock.api.ts        | /stock/movements, /stock/ledger                              | 🔲     |
| maintenance.api.ts  | /maintenance                                                 | 🔲     |
| master-data.api.ts  | /users, /divisions, /customers, /categories                  | 🔲     |

### 1.3 API Client Features

- ✅ Auto token injection (Bearer)
- ✅ Global error handling (401, 403, 500)
- ✅ Response type safety
- ✅ Request/Response interceptors
- ✅ Retry mechanism untuk network errors

---

## 🎯 Phase 2: TanStack Query Setup

**Tujuan**: Data fetching & caching yang efisien

### 2.1 Dependencies

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

### 2.2 Struktur

```
frontend/src/
├── providers/
│   └── QueryProvider.tsx     # QueryClient setup
├── hooks/
│   └── queries/
│       ├── index.ts
│       ├── useAssets.ts      # useAssets, useAsset, useCreateAsset, etc.
│       ├── useLoans.ts       # useLoanRequests, useApproveLoan, etc.
│       ├── useRequests.ts    # useRequests, useCreateRequest, etc.
│       ├── useUsers.ts       # useUsers, useCreateUser, etc.
│       ├── useTransactions.ts
│       └── useMasterData.ts  # useDivisions, useCategories, useCustomers
```

### 2.3 Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 menit
      gcTime: 10 * 60 * 1000, // 10 menit (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

---

## 🎯 Phase 3: React Router Migration

**Tujuan**: URL-based routing untuk UX yang lebih baik

### 3.1 Dependencies

```bash
pnpm add react-router-dom
pnpm add -D @types/react-router-dom
```

### 3.2 Route Structure

| Path                   | Component              | Protected  |
| ---------------------- | ---------------------- | ---------- |
| `/login`               | LoginPage              | ❌         |
| `/`                    | Redirect to /dashboard | ✅         |
| `/dashboard`           | DashboardPage          | ✅         |
| `/requests`            | RequestHubPage         | ✅         |
| `/requests/:id`        | RequestDetailPage      | ✅         |
| `/loans`               | LoanRequestPage        | ✅         |
| `/loans/:id`           | LoanDetailPage         | ✅         |
| `/assets`              | RegistrationPage       | ✅         |
| `/assets/:id`          | AssetDetailPage        | ✅         |
| `/handover`            | HandoverPage           | ✅         |
| `/stock`               | StockOverviewPage      | ✅         |
| `/repair`              | RepairManagementPage   | ✅         |
| `/customers`           | CustomerManagementPage | ✅         |
| `/settings/users`      | AccountsPage           | ✅ (Admin) |
| `/settings/categories` | CategoryManagementPage | ✅ (Admin) |
| `/settings/account`    | ManageAccountPage      | ✅         |

### 3.3 Migration Strategy

1. Install React Router
2. Buat `RouterProvider` dengan semua routes
3. Buat `ProtectedRoute` component untuk auth check
4. Update `App.tsx` untuk gunakan router
5. Migrasi `setActivePage()` calls ke `navigate()`
6. Deprecate `useUIStore.activePage`

---

## 🎯 Phase 4: Form Validation dengan Zod

**Tujuan**: Type-safe validation yang sync dengan backend DTOs

### 4.1 Dependencies

```bash
pnpm add zod @hookform/resolvers react-hook-form
```

### 4.2 Validation Schemas

```
frontend/src/validation/
├── schemas/
│   ├── index.ts
│   ├── auth.schema.ts      # loginSchema, registerSchema
│   ├── asset.schema.ts     # assetSchema, bulkAssetSchema
│   ├── request.schema.ts   # requestSchema
│   ├── loan.schema.ts      # loanRequestSchema, approvalSchema
│   ├── user.schema.ts      # userSchema, passwordChangeSchema
│   └── customer.schema.ts  # customerSchema
└── index.ts
```

### 4.3 Schema-DTO Alignment

| Frontend Schema   | Backend DTO          | Fields                                            |
| ----------------- | -------------------- | ------------------------------------------------- |
| assetSchema       | CreateAssetDto       | name, categoryId, type, brand, serialNumber, etc. |
| loginSchema       | LoginDto             | email, password                                   |
| userSchema        | CreateUserDto        | name, email, role, divisionId                     |
| loanRequestSchema | CreateLoanRequestDto | requester, division, purpose, items               |

---

## 🎯 Phase 5: Zustand Store Refactoring

**Tujuan**: Stores fokus pada UI state, bukan data fetching

### 5.1 Current Stores

| Store                | Current Use              | After Refactor                         |
| -------------------- | ------------------------ | -------------------------------------- |
| useAuthStore         | Auth + User data         | Auth only (user from query)            |
| useAssetStore        | Asset data + filtering   | Filtering + selection only             |
| useRequestStore      | Request data + state     | UI state only                          |
| useUIStore           | Page navigation + modals | Modals only (routing via React Router) |
| useNotificationStore | Toasts + notifications   | Keep as-is                             |
| useFilterStore       | Global filters           | Keep as-is                             |
| useLoanStore         | Loan data + state        | UI state only                          |

### 5.2 Data Flow After Refactor

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Router   │────▶│  TanStack Query  │────▶│   API Services  │
│  (Navigation)   │     │  (Data Fetching) │     │   (HTTP Client) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Zustand Stores │     │    Components    │
│  (UI State)     │────▶│    (Render)      │
└─────────────────┘     └──────────────────┘
```

---

## 📅 Timeline Eksekusi

| Phase | Task                   | Duration | Status      |
| ----- | ---------------------- | -------- | ----------- |
| 1     | API Service Layer      | 2-3 jam  | ✅ Complete |
| 2     | TanStack Query         | 2-3 jam  | ✅ Complete |
| 3     | React Router           | 3-4 jam  | ✅ Complete |
| 4     | Zod Validation         | 2 jam    | ✅ Complete |
| 5     | Store Refactoring      | 2 jam    | ✅ Complete |
| 6     | Testing & Verification | 1 jam    | ✅ Complete |

**Total Eksekusi**: 18 Januari 2026

---

## 🔧 Environment Configuration

### Frontend `.env`

```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3001/api
```

### Backend `.env`

```env
DATABASE_URL=postgresql://trinity_admin:Tr1n1ty_Db@2026_SecureP4ss!@localhost:5432/trinity_assetflow?schema=public
JWT_SECRET=trinity-jwt-secret-key-2026
JWT_EXPIRES_IN=24h
PORT=3001
```

---

## ✅ Success Criteria

- [ ] Frontend bisa login dengan real backend
- [ ] CRUD Assets berfungsi dengan real API
- [ ] Loan Request workflow end-to-end
- [ ] URL routing berfungsi (bookmarkable, refresh-safe)
- [ ] Form validation menampilkan error yang meaningful
- [ ] No console errors
- [ ] TypeScript: 0 errors
- [ ] Semua existing features tetap berfungsi

---

## 📝 Notes

- Backend sudah berjalan di `http://localhost:3001/api`
- Swagger docs tersedia di `http://localhost:3001/api/docs`
- Database PostgreSQL di port 5432
- Mock mode masih bisa diaktifkan dengan `VITE_USE_MOCK=true`

---

_Last Updated: 18 Januari 2026_
