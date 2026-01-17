# Frontend-Backend Integration Plan

## Executive Summary

Dokumen ini berisi hasil analisis mendalam dan roadmap untuk mengintegrasikan frontend Trinity Asset Flow dengan backend NestJS. Analisis mencakup current state, gap identification, dan action items terstruktur.

---

## 1. Current State Analysis

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CURRENT FRONTEND                           │
├─────────────────────────────────────────────────────────────────┤
│  React 18.3.1 + TypeScript 5.7.2 + Vite 6.0.11                 │
├─────────────────────────────────────────────────────────────────┤
│  State Management: Zustand 5.0.3 (7 stores)                     │
│  ├─ useAuthStore (Authentication & Session)                    │
│  ├─ useAssetStore (Assets & Stock Management)                  │
│  ├─ useRequestStore (Requests & Loans & Returns)               │
│  ├─ useTransactionStore (Handovers, Installations, etc.)       │
│  ├─ useMasterDataStore (Users, Customers, Divisions)           │
│  ├─ useNotificationStore (System Notifications)                │
│  └─ useUIStore (UI State & Navigation)                         │
├─────────────────────────────────────────────────────────────────┤
│  Routing: Manual State-Based (No React Router)                 │
│  Data Fetching: Direct API calls + Zustand (No TanStack Query) │
│  Forms: Manual validation (No Zod/React Hook Form)             │
│  API Layer: Unified Mock/Real Switch Pattern                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Current API Layer (src/services/api.ts)

**Strengths:**

- ✅ Unified Mock/Real API switch via `VITE_USE_MOCK` env variable
- ✅ Token injection in fetch headers
- ✅ Global error handling with 401/403 handling
- ✅ ApiError class with status codes
- ✅ Mock data persistence in localStorage

**Current Endpoints Defined:**
| Endpoint | Mock | Real API Ready |
|----------|------|----------------|
| `fetchAllData()` | ✅ | ⚠️ Partial |
| `loginUser()` | ✅ | ✅ |
| `requestPasswordReset()` | ✅ | ✅ |
| `approveLoanTransaction()` | ✅ | ✅ |
| `recordStockMovement()` | ✅ | ✅ |
| `updateData()` | ✅ | ❌ Mock only |

### 1.3 Type System (src/types/index.ts)

**Comprehensive Types Defined:**

- 609 lines of type definitions
- All major entities covered (Asset, User, Request, LoanRequest, etc.)
- Enums for statuses (AssetStatus, LoanRequestStatus, ItemStatus)
- Permission system with 40+ permissions

---

## 2. Gap Analysis

### 2.1 Critical Gaps for Backend Integration

| Category             | Gap                      | Impact                                               | Priority |
| -------------------- | ------------------------ | ---------------------------------------------------- | -------- |
| **Routing**          | No URL-based routing     | Deep linking impossible, SEO unfriendly              | HIGH     |
| **Data Fetching**    | No TanStack Query        | No caching, no optimistic updates, manual refetching | HIGH     |
| **Form Validation**  | Manual inline validation | Inconsistent, not typesafe, error-prone              | MEDIUM   |
| **API Services**     | Missing CRUD endpoints   | Only bulk fetch, no granular operations              | HIGH     |
| **Loading States**   | Basic implementation     | No skeleton per-component, no suspense               | LOW      |
| **Error Boundaries** | Exists but minimal       | Need per-feature boundaries                          | MEDIUM   |

### 2.2 API Endpoint Gaps

**Backend API Reference vs Current Implementation:**

| API Endpoint                             | Backend Spec | Frontend Implemented      |
| ---------------------------------------- | ------------ | ------------------------- |
| `GET /api/assets`                        | ✅           | ⚠️ (via fetchAllData)     |
| `POST /api/assets`                       | ✅           | ❌ (uses updateData mock) |
| `PATCH /api/assets/:id`                  | ✅           | ❌                        |
| `POST /api/assets/consume`               | ✅           | ❌                        |
| `GET /api/requests`                      | ✅           | ⚠️ (via fetchAllData)     |
| `POST /api/requests`                     | ✅           | ❌                        |
| `PATCH /api/requests/:id/approve`        | ✅           | ❌                        |
| `POST /api/requests/:id/register-assets` | ✅           | ❌                        |
| `GET /api/loan-requests`                 | ✅           | ⚠️ (via fetchAllData)     |
| `POST /api/loan-requests`                | ✅           | ❌                        |
| `PATCH /api/loan-requests/:id/approve`   | ✅           | ✅                        |
| `POST /api/loan-requests/:id/return`     | ✅           | ❌                        |
| `GET /api/transactions/*`                | ✅           | ⚠️ (via fetchAllData)     |
| `POST /api/transactions/*`               | ✅           | ❌                        |
| `GET /api/customers`                     | ✅           | ⚠️                        |
| `GET /api/users`                         | ✅           | ⚠️                        |
| `GET /api/divisions`                     | ✅           | ⚠️                        |
| `GET /api/categories`                    | ✅           | ⚠️                        |

---

## 3. Integration Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal:** Prepare codebase for backend integration without breaking mock mode

#### 3.1.1 Install Required Dependencies

```bash
pnpm add @tanstack/react-query react-router-dom zod @hookform/resolvers react-hook-form
pnpm add -D @types/react-router-dom
```

#### 3.1.2 Create API Service Layer

Replace mock-centric functions with proper REST client.

**File Structure:**

```
src/services/
├── api/
│   ├── client.ts          # Axios/Fetch wrapper with interceptors
│   ├── assets.api.ts      # Asset CRUD operations
│   ├── requests.api.ts    # Request operations
│   ├── loans.api.ts       # Loan request operations
│   ├── transactions.api.ts # Handover, Installation, etc.
│   ├── auth.api.ts        # Authentication
│   └── master-data.api.ts # Users, Customers, Divisions
└── index.ts               # Re-export all
```

#### 3.1.3 TanStack Query Setup

```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

### Phase 2: React Router Migration (Week 2-3)

**Goal:** Implement URL-based routing

#### 3.2.1 Route Structure

```typescript
// src/routes.tsx
const routes = [
  { path: '/', element: <Navigate to="/dashboard" /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AuthenticatedLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'requests', element: <RequestHubPage /> },
      { path: 'requests/:id', element: <RequestDetailPage /> },
      { path: 'loans', element: <LoanRequestPage /> },
      { path: 'loans/:id', element: <LoanRequestDetailPage /> },
      { path: 'assets', element: <RegistrationPage /> },
      { path: 'assets/:id', element: <AssetDetailPage /> },
      { path: 'handover', element: <HandoverPage /> },
      { path: 'stock', element: <StockOverviewPage /> },
      { path: 'repair', element: <RepairManagementPage /> },
      { path: 'customers', element: <CustomerManagementPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'settings/users', element: <AccountsPage /> },
      { path: 'settings/categories', element: <CategoryManagementPage /> },
      { path: 'settings/account', element: <ManageAccountPage /> },
    ]
  }
];
```

#### 3.2.2 Migration Strategy

1. Introduce React Router alongside existing navigation
2. Map `setActivePage()` calls to `navigate()`
3. Replace `pageInitialState` with URL params/query strings
4. Gradually deprecate `useUIStore.activePage`

### Phase 3: Form Validation with Zod (Week 3-4)

**Goal:** Type-safe validation aligned with backend DTOs

#### 3.3.1 Validation Schemas

```typescript
// src/validation/schemas/asset.schema.ts
import { z } from "zod";

export const assetSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(200),
  category: z.string().min(1, "Kategori wajib dipilih"),
  type: z.string().min(1, "Tipe wajib dipilih"),
  brand: z.string().min(1, "Merek wajib diisi"),
  serialNumber: z.string().optional().nullable(),
  macAddress: z
    .string()
    .regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, "Format MAC tidak valid")
    .optional()
    .nullable(),
  purchasePrice: z.number().min(0).optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  warrantyEndDate: z.string().optional().nullable(),
  condition: z.enum([
    "Baru",
    "Baik",
    "Bekas Layak Pakai",
    "Rusak Ringan",
    "Rusak Berat",
    "Kanibal",
  ]),
});

export type AssetFormData = z.infer<typeof assetSchema>;
```

#### 3.3.2 Integration with React Hook Form

```typescript
// Example in component
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetSchema, AssetFormData } from "@/validation/schemas";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<AssetFormData>({
  resolver: zodResolver(assetSchema),
});
```

### Phase 4: API Service Implementation (Week 4-5)

**Goal:** Complete REST API service layer

#### 3.4.1 API Client with Interceptors

```typescript
// src/services/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiClient {
  private getAuthToken(): string | null {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;
    return JSON.parse(authStorage)?.state?.currentUser?.token || null;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    if (response.status === 204) return null as T;
    return response.json();
  }

  private async handleError(response: Response): Promise<never> {
    const error = await response.json().catch(() => ({}));

    if (response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    throw new ApiError(
      error.message || "Terjadi kesalahan",
      response.status,
      error.code,
      error.details,
    );
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }
  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  patch<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
```

#### 3.4.2 Service Implementation Example

```typescript
// src/services/api/assets.api.ts
import { apiClient } from "./client";
import { Asset } from "@/types";

export const assetsApi = {
  getAll: () => apiClient.get<Asset[]>("/assets"),
  getById: (id: string) => apiClient.get<Asset>(`/assets/${id}`),
  create: (data: Partial<Asset>) => apiClient.post<Asset>("/assets", data),
  update: (id: string, data: Partial<Asset>) =>
    apiClient.patch<Asset>(`/assets/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/assets/${id}`),
  consume: (materials: any[], context: any) =>
    apiClient.post<void>("/assets/consume", { items: materials, context }),
};
```

### Phase 5: TanStack Query Integration (Week 5-6)

**Goal:** Replace Zustand data fetching with React Query

#### 3.5.1 Query Hooks

```typescript
// src/hooks/queries/useAssets.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "@/services/api";

export const useAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: assetsApi.getAll,
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => assetsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      assetsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets", id] });
    },
  });
};
```

#### 3.5.2 Zustand Store Simplification

After React Query migration, Zustand stores become UI-only:

```typescript
// Simplified useAssetStore - no more data fetching
interface AssetUIState {
  selectedAssetId: string | null;
  filterCategory: string | null;
  sortField: string;
  sortDirection: "asc" | "desc";
  // ... UI state only
}
```

---

## 4. File Changes Required

### 4.1 New Files to Create

| File                                   | Purpose                      |
| -------------------------------------- | ---------------------------- |
| `src/providers/QueryProvider.tsx`      | TanStack Query provider      |
| `src/routes.tsx`                       | React Router configuration   |
| `src/services/api/client.ts`           | API client with interceptors |
| `src/services/api/assets.api.ts`       | Asset API service            |
| `src/services/api/requests.api.ts`     | Request API service          |
| `src/services/api/loans.api.ts`        | Loan request API service     |
| `src/services/api/transactions.api.ts` | Transaction API services     |
| `src/services/api/auth.api.ts`         | Auth API service             |
| `src/services/api/master-data.api.ts`  | Master data API service      |
| `src/hooks/queries/*.ts`               | React Query hooks per domain |
| `src/validation/schemas/*.ts`          | Zod schemas per entity       |

### 4.2 Files to Modify

| File                    | Changes                                     |
| ----------------------- | ------------------------------------------- |
| `src/main.tsx`          | Wrap with QueryProvider, BrowserRouter      |
| `src/App.tsx`           | Replace manual navigation with React Router |
| `src/stores/*.ts`       | Remove data fetching logic, keep UI state   |
| `src/features/**/forms` | Migrate to react-hook-form + zod            |

### 4.3 Recommended package.json Additions

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.62.0",
    "@tanstack/react-query-devtools": "^5.62.0",
    "react-router-dom": "^7.1.0",
    "zod": "^3.24.1",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.1"
  }
}
```

---

## 5. Testing Strategy

### 5.1 Dual-Mode Testing

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    "import.meta.env.VITE_USE_MOCK": JSON.stringify(
      process.env.VITE_USE_MOCK || "true",
    ),
  },
});
```

Run modes:

- `VITE_USE_MOCK=true pnpm dev` - Mock mode for UI development
- `VITE_USE_MOCK=false pnpm dev` - Real API for integration testing

### 5.2 API Contract Testing

Use MSW (Mock Service Worker) for consistent API mocking in tests:

```bash
pnpm add -D msw
```

---

## 6. Success Criteria

| Metric               | Current           | Target           |
| -------------------- | ----------------- | ---------------- |
| Mock/Real API Switch | ✅ Manual env var | ✅ Seamless      |
| TypeScript Errors    | 0                 | 0                |
| Build Status         | ✅ Pass           | ✅ Pass          |
| URL-based Routing    | ❌ No             | ✅ Full          |
| Server State Caching | ❌ No             | ✅ React Query   |
| Form Validation      | ⚠️ Manual         | ✅ Zod + RHF     |
| Error Handling       | ⚠️ Basic          | ✅ Comprehensive |
| API Coverage         | ⚠️ Partial        | ✅ Full REST     |

---

## 7. Risk Mitigation

| Risk                         | Impact | Mitigation                                               |
| ---------------------------- | ------ | -------------------------------------------------------- |
| Breaking existing features   | HIGH   | Incremental migration, feature flags                     |
| State management complexity  | MEDIUM | Clear separation: React Query for server, Zustand for UI |
| URL routing conflicts        | MEDIUM | Maintain backward compat during transition               |
| Type mismatches with backend | HIGH   | Shared type definitions, API contract validation         |

---

## 8. Immediate Next Steps

1. **Install dependencies** (TanStack Query, React Router, Zod, RHF)
2. **Create QueryProvider and wrap App**
3. **Implement API client with proper error handling**
4. **Create first domain service** (start with `auth.api.ts`)
5. **Create first query hook** (start with `useCurrentUser`)
6. **Migrate LoginPage to new patterns** as proof of concept

---

_Document Version: 1.0_  
_Created: 2025-01-20_  
_Author: GitHub Copilot Analysis_
