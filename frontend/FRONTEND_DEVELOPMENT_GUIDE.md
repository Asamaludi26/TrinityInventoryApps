# 📘 Trinity Asset Flow - Frontend Development Guide

> **Panduan Lengkap Konfigurasi, Pengembangan & Penyempurnaan Frontend**
>
> Version: 1.0.0 | Last Updated: 2026-01-24

---

## 📑 Daftar Isi

1. [Gambaran Umum Arsitektur](#1-gambaran-umum-arsitektur)
2. [Teknologi Stack](#2-teknologi-stack)
3. [Quick Start](#3-quick-start)
4. [Struktur Folder & File](#4-struktur-folder--file)
5. [Konfigurasi Environment](#5-konfigurasi-environment)
6. [Design System & Styling](#6-design-system--styling)
7. [State Management dengan Zustand](#7-state-management-dengan-zustand)
8. [Data Fetching dengan TanStack Query](#8-data-fetching-dengan-tanstack-query)
9. [Routing dengan React Router](#9-routing-dengan-react-router)
10. [Component Library](#10-component-library)
11. [Form Handling dengan React Hook Form + Zod](#11-form-handling-dengan-react-hook-form--zod)
12. [Testing dengan Vitest](#12-testing-dengan-vitest)
13. [Performance Optimization](#13-performance-optimization)
14. [Rekomendasi Penyempurnaan](#14-rekomendasi-penyempurnaan)
15. [Best Practices & Coding Standards](#15-best-practices--coding-standards)

---

## 1. Gambaran Umum Arsitektur

### 1.1 Filosofi Arsitektur

Trinity Asset Flow menggunakan arsitektur **Feature-First** dengan prinsip:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend App                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routing   │  │   Layout    │  │  Providers  │         │
│  │ React Router│  │  MainLayout │  │ Query/Notif │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│  ┌──────┴────────────────┴────────────────┴──────┐         │
│  │                  Features                      │         │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │         │
│  │  │Dashboard│ │ Assets  │ │ Requests│  ...    │         │
│  │  └────┬────┘ └────┬────┘ └────┬────┘         │         │
│  └───────┴───────────┴───────────┴───────────────┘         │
│         │                │                │                 │
│  ┌──────┴────────────────┴────────────────┴──────┐         │
│  │              Shared Resources                  │         │
│  │  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  │         │
│  │  │Stores │  │ Hooks │  │  API  │  │  UI   │  │         │
│  │  │Zustand│  │Queries│  │Client │  │Comps  │  │         │
│  └───────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Alur Data

```
User Action → Component → Store/Query → API Client → Backend
      ↑                                                   │
      └──── Re-render ← State Update ← Response ←────────┘
```

---

## 2. Teknologi Stack

### 2.1 Core Framework

| Teknologi      | Versi   | Fungsi                  |
| -------------- | ------- | ----------------------- |
| **React**      | ^18.3.1 | UI Library              |
| **TypeScript** | ^5.7.2  | Type Safety             |
| **Vite**       | ^6.0.11 | Build Tool & Dev Server |

### 2.2 Styling

| Teknologi          | Versi   | Fungsi              |
| ------------------ | ------- | ------------------- |
| **Tailwind CSS**   | ^3.4.17 | Utility-First CSS   |
| **PostCSS**        | ^8.4.49 | CSS Processing      |
| **clsx**           | ^2.1.1  | Conditional Classes |
| **tailwind-merge** | ^2.6.0  | Class Deduplication |

### 2.3 State & Data Management

| Teknologi          | Versi    | Fungsi                  |
| ------------------ | -------- | ----------------------- |
| **Zustand**        | ^5.0.3   | Global State Management |
| **TanStack Query** | ^5.90.19 | Server State & Caching  |

### 2.4 Routing & Navigation

| Teknologi        | Versi   | Fungsi              |
| ---------------- | ------- | ------------------- |
| **React Router** | ^7.12.0 | Client-Side Routing |

### 2.5 Forms & Validation

| Teknologi               | Versi    | Fungsi                |
| ----------------------- | -------- | --------------------- |
| **React Hook Form**     | ^7.71.1  | Form State Management |
| **Zod**                 | ^3.25.76 | Schema Validation     |
| **@hookform/resolvers** | ^5.2.2   | Zod Integration       |

### 2.6 UI Libraries

| Teknologi             | Versi    | Fungsi                         |
| --------------------- | -------- | ------------------------------ |
| **@headlessui/react** | ^2.2.0   | Unstyled Accessible Components |
| **Framer Motion**     | ^11.15.0 | Animations                     |
| **react-icons**       | ^5.5.0   | Icon Library                   |
| **Recharts**          | ^3.6.0   | Charts & Graphs                |

### 2.7 Utilities

| Teknologi        | Versi  | Fungsi             |
| ---------------- | ------ | ------------------ |
| **date-fns**     | ^4.1.0 | Date Manipulation  |
| **qrcode.react** | ^4.2.0 | QR Code Generation |
| **html5-qrcode** | ^2.3.8 | QR Code Scanner    |
| **jspdf**        | ^4.0.0 | PDF Generation     |
| **html2canvas**  | ^1.4.1 | Screenshot Capture |

### 2.8 Testing

| Teknologi                  | Versi   | Fungsi          |
| -------------------------- | ------- | --------------- |
| **Vitest**                 | ^3.0.0  | Test Runner     |
| **@testing-library/react** | ^16.3.1 | React Testing   |
| **jsdom**                  | ^27.4.0 | DOM Environment |

### 2.9 Dependensi yang Direkomendasikan (Belum Terinstall)

```bash
# Performance Monitoring
pnpm add @tanstack/react-query-devtools

# Form Enhancement (opsional)
pnpm add react-select            # Advanced Select
pnpm add react-dropzone          # File Upload

# Animation (opsional)
pnpm add @formkit/auto-animate   # Auto Animations

# Error Tracking (production)
pnpm add @sentry/react           # Error Monitoring

# PWA Support
pnpm add vite-plugin-pwa         # PWA Plugin

# Code Quality
pnpm add -D @trivago/prettier-plugin-sort-imports
pnpm add -D prettier-plugin-tailwindcss
```

---

## 3. Quick Start

### 3.1 Prerequisites

- **Node.js**: v18.x atau v20.x LTS
- **pnpm**: v8.x atau lebih baru
- **VS Code** dengan extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

### 3.2 Installation

```powershell
# Clone repository (jika belum)
git clone https://github.com/Asamaludi26/TrinityInventoryApps.git
cd TrinityInventoryApps/frontend

# Install dependencies
pnpm install

# Copy environment file
copy .env.example .env.local

# Start development server
pnpm dev
```

### 3.3 NPM Scripts

```json
{
  "dev": "vite", // Development server (port 5173)
  "build": "tsc -b && vite build", // Production build
  "preview": "vite preview", // Preview production build
  "lint": "eslint .", // Run ESLint
  "lint:fix": "eslint . --fix", // Fix ESLint errors
  "typecheck": "tsc --noEmit", // TypeScript check
  "test": "vitest run", // Run tests once
  "test:watch": "vitest", // Watch mode
  "test:coverage": "vitest run --coverage", // Coverage report
  "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\""
}
```

---

## 4. Struktur Folder & File

```
frontend/
├── .env.example              # Template environment variables
├── .env.local                # Local environment (gitignored)
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint flat config
│
├── public/                   # Static assets
│   └── trinity-logo.svg
│
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Legacy app (state-based navigation)
    ├── RouterApp.tsx         # Modern app (React Router)
    ├── routes.tsx            # Route definitions
    ├── index.css             # Global styles & Tailwind
    │
    ├── components/           # Shared components
    │   ├── layout/           # Layout components
    │   │   ├── MainLayout.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Header.tsx
    │   │
    │   ├── ui/               # UI component library
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Badge.tsx
    │   │   └── ...
    │   │
    │   ├── icons/            # Custom icon components
    │   │   ├── DashboardIcon.tsx
    │   │   └── ...
    │   │
    │   ├── ErrorBoundary.tsx
    │   └── ProtectedRoute.tsx
    │
    ├── features/             # Feature modules
    │   ├── auth/             # Authentication
    │   ├── dashboard/        # Dashboard & analytics
    │   ├── assetRegistration/ # Asset management
    │   ├── handover/         # Asset handover
    │   ├── repair/           # Repair management
    │   ├── requests/         # Request hub
    │   ├── stock/            # Stock overview
    │   ├── customers/        # Customer management
    │   ├── users/            # User management
    │   ├── categories/       # Category management
    │   └── preview/          # Document preview
    │
    ├── stores/               # Zustand stores
    │   ├── useAuthStore.ts
    │   ├── useAssetStore.ts
    │   ├── useRequestStore.ts
    │   ├── useTransactionStore.ts
    │   ├── useMasterDataStore.ts
    │   ├── useNotificationStore.ts
    │   └── useUIStore.ts
    │
    ├── hooks/                # Custom React hooks
    │   ├── queries/          # TanStack Query hooks
    │   │   ├── useAssetQueries.ts
    │   │   ├── useAuthQueries.ts
    │   │   └── ...
    │   ├── useZodForm.ts
    │   ├── useGenericFilter.ts
    │   └── ...
    │
    ├── services/             # API & external services
    │   ├── api/
    │   │   ├── client.ts     # API client with interceptors
    │   │   ├── assets.api.ts
    │   │   ├── auth.api.ts
    │   │   └── ...
    │   └── whatsappIntegration.ts
    │
    ├── providers/            # React context providers
    │   ├── QueryProvider.tsx
    │   └── NotificationProvider.tsx
    │
    ├── types/                # TypeScript definitions
    │   └── index.ts
    │
    ├── utils/                # Utility functions
    │   ├── cn.ts             # Class name utility
    │   ├── designSystem.ts   # Design tokens
    │   ├── permissions.ts    # RBAC utilities
    │   ├── dateFormatter.ts
    │   └── ...
    │
    ├── validation/           # Zod schemas
    │   └── schemas/
    │
    ├── constants/            # App constants
    │   └── labels.ts
    │
    └── test/                 # Test utilities
        ├── vitest.setup.ts
        └── test-utils.tsx
```

---

## 5. Konfigurasi Environment

### 5.1 Environment Variables

**File: `.env.local`**

```env
# ==========================================
# API Configuration
# ==========================================
VITE_API_URL=http://localhost:3001/api/v1

# ==========================================
# Feature Flags
# ==========================================
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_DEMO_ACCOUNTS=true

# ==========================================
# App Metadata
# ==========================================
VITE_APP_NAME=Trinity Asset Flow
VITE_APP_VERSION=1.3.0
VITE_APP_DESCRIPTION=Manajemen aset PT. Trinity Media Indonesia

# ==========================================
# Debug Options (development only)
# ==========================================
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
```

### 5.2 Akses Environment di Code

```typescript
// Akses via import.meta.env
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Type-safe access (buat di src/env.d.ts)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_ENABLE_DEMO_ACCOUNTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 5.3 Vite Configuration

**File: `vite.config.ts`**

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Path aliases untuk import yang lebih bersih
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@types": path.resolve(__dirname, "./src/types"),
        "@services": path.resolve(__dirname, "./src/services"),
      },
    },

    // Development server configuration
    server: {
      port: 5173,
      host: true,
      cors: true,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Production build optimization
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      chunkSizeWarningLimit: 600,
      target: "esnext",
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-state": ["zustand", "@tanstack/react-query"],
            "vendor-ui": ["@headlessui/react", "framer-motion"],
            "vendor-charts": ["recharts"],
            "vendor-forms": ["react-hook-form", "zod"],
          },
        },
      },
    },

    // Test configuration
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/vitest.setup.ts"],
      include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
    },
  };
});
```

---

## 6. Design System & Styling

### 6.1 Color Palette

Design system menggunakan semantic colors yang didefinisikan di `tailwind.config.js`:

```javascript
// tailwind.config.js
colors: {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",  // Main
    600: "#2563eb",  // Hover
    700: "#1d4ed8",  // Active
  },
  secondary: {
    50: "#f8fafc",
    500: "#64748b",
    900: "#0f172a",
  },
  success: {
    50: "#f0fdf4",
    500: "#22c55e",
    700: "#15803d",
  },
  warning: {
    50: "#fffbeb",
    500: "#f59e0b",
    700: "#b45309",
  },
  danger: {
    50: "#fef2f2",
    500: "#ef4444",
    700: "#b91c1c",
  },
  info: {
    50: "#ecfeff",
    500: "#06b6d4",
    700: "#0e7490",
  },
}
```

### 6.2 Typography

```css
/* Font families */
font-sans: Inter, system-ui, sans-serif
font-mono: JetBrains Mono, monospace

/* Font sizes */
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)  ← Default body
text-base: 1rem     (16px)
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
```

### 6.3 CSS Utility Function

**File: `src/utils/cn.ts`**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  "px-4 py-2 rounded-lg",
  isActive && "bg-primary-500",
  disabled && "opacity-50 cursor-not-allowed"
)} />
```

### 6.4 Design System Utilities

**File: `src/utils/designSystem.ts`**

```typescript
// Typography presets
export const textStyles = {
  h1: "text-4xl font-bold text-gray-900",
  h2: "text-3xl font-bold text-gray-900",
  h3: "text-2xl font-semibold text-gray-900",
  body: "text-sm text-gray-700",
  caption: "text-xs text-gray-500 uppercase tracking-wide",
  label: "text-sm font-medium text-gray-700",
};

// Card styles
export const cardStyles = {
  base: "bg-white rounded-lg border border-gray-200 shadow-sm",
  interactive: "hover:shadow-md transition-all duration-200",
  elevated: "shadow-card bg-white rounded-lg",
};

// Input styles
export const inputStyles = {
  base: "w-full px-4 py-2.5 text-sm rounded-lg border bg-white",
  focus: "focus:outline-none focus:ring-2 focus:ring-primary-500",
  error: "border-danger-500 focus:ring-danger-500",
};
```

### 6.5 CSS Custom Properties

**File: `src/index.css`**

```css
:root {
  /* Colors */
  --color-primary-500: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 200ms;

  /* Z-Index */
  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-toast: 1200;
}
```

---

## 7. State Management dengan Zustand

### 7.1 Store Architecture

```
┌─────────────────────────────────────────────┐
│              Global State                    │
├─────────────────────────────────────────────┤
│  useAuthStore     → User, Token, Session    │
│  useAssetStore    → Assets, Categories      │
│  useRequestStore  → Requests, Loans         │
│  useTransactionStore → Handovers, Installs  │
│  useMasterDataStore → Users, Customers      │
│  useNotificationStore → Notifications       │
│  useUIStore       → UI State, Navigation    │
└─────────────────────────────────────────────┘
```

### 7.2 Store Pattern

**File: `src/stores/useAuthStore.ts`**

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";
import { authApi } from "../services/api/auth.api";

interface AuthState {
  // State
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      token: null,
      isLoading: false,
      error: null,

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          set({
            currentUser: response.user,
            token: response.token,
            isLoading: false,
          });
          return response.user;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // Logout action
      logout: () => {
        set({ currentUser: null, token: null });
        localStorage.removeItem("auth-storage");
      },

      // Update user
      updateCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
    }
  )
);
```

### 7.3 Menggunakan Store di Component

```tsx
import { useAuthStore } from "@stores/useAuthStore";

function ProfileCard() {
  // Select specific state (optimized re-renders)
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  // Atau multiple selectors
  const { currentUser, isLoading } = useAuthStore((state) => ({
    currentUser: state.currentUser,
    isLoading: state.isLoading,
  }));

  return (
    <div>
      <p>{currentUser?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 7.4 Store Best Practices

```typescript
// ✅ DO: Select minimal state
const userName = useAuthStore((s) => s.currentUser?.name);

// ❌ DON'T: Select entire store
const store = useAuthStore(); // Causes re-render on any change

// ✅ DO: Actions outside component for testing
const logout = useAuthStore.getState().logout;

// ✅ DO: Subscribe to store changes (outside React)
const unsubscribe = useAuthStore.subscribe((state) => console.log("Auth changed:", state.currentUser));
```

---

## 8. Data Fetching dengan TanStack Query

### 8.1 Query Provider Setup

**File: `src/providers/QueryProvider.tsx`**

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,     // Fresh for 5 minutes
        gcTime: 10 * 60 * 1000,       // Keep in cache 10 minutes
        retry: 3,
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
      },
      mutations: {
        retry: 1,
      },
    },
  });

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 8.2 Query Hooks Pattern

**File: `src/hooks/queries/useAssetQueries.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "@services/api/assets.api";
import { Asset } from "@/types";

// Query Keys - centralized for cache management
export const assetKeys = {
  all: ["assets"] as const,
  lists: () => [...assetKeys.all, "list"] as const,
  list: (filters: object) => [...assetKeys.lists(), filters] as const,
  details: () => [...assetKeys.all, "detail"] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
};

// Fetch all assets
export function useAssets(filters?: object) {
  return useQuery({
    queryKey: assetKeys.list(filters ?? {}),
    queryFn: () => assetsApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch single asset
export function useAsset(id: string) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => assetsApi.getById(id),
    enabled: !!id,
  });
}

// Create asset mutation
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Asset>) => assetsApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

// Update asset mutation
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) => assetsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}
```

### 8.3 Menggunakan Query Hooks

```tsx
import { useAssets, useCreateAsset } from "@hooks/queries";

function AssetList() {
  const { data: assets, isLoading, error } = useAssets();
  const createMutation = useCreateAsset();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  const handleCreate = async (formData: AssetFormData) => {
    await createMutation.mutateAsync(formData);
  };

  return (
    <div>
      {assets?.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
      <Button onClick={() => handleCreate(newAsset)} isLoading={createMutation.isPending}>
        Create Asset
      </Button>
    </div>
  );
}
```

---

## 9. Routing dengan React Router

### 9.1 Route Definitions

**File: `src/routes.tsx`**

```typescript
import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import { PageSkeleton } from "@components/ui/PageSkeleton";

// Lazy load pages
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const RegistrationPage = lazy(() => import("./features/assetRegistration/RegistrationPage"));

// Route constants
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  REQUESTS: "/requests",
  ASSETS: "/assets",
  ASSET_NEW: "/assets/new",
  ASSET_EDIT: "/assets/:id/edit",
  CUSTOMERS: "/customers",
  CUSTOMER_DETAIL: "/customers/:id",
  USERS: "/users",
  SETTINGS: "/settings",
} as const;

// Route builders for dynamic routes
export const buildRoute = {
  assetEdit: (id: string) => `/assets/${id}/edit`,
  customerDetail: (id: string) => `/customers/${id}`,
  userDetail: (id: number) => `/users/${id}`,
};

// Protected routes
export const protectedRoutes: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD,
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardPage />
      </Suspense>
    ),
  },
  // ... more routes
];
```

### 9.2 Protected Route Component

**File: `src/components/ProtectedRoute.tsx`**

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@stores/useAuthStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

### 9.3 Navigation Helpers

```tsx
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ROUTES, buildRoute } from "@/routes";

function AssetPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation
  const goToEdit = () => navigate(buildRoute.assetEdit(id!));
  const goBack = () => navigate(-1);

  // Query params
  const page = searchParams.get("page") || "1";
  const setPage = (p: number) => setSearchParams({ page: String(p) });
}
```

---

## 10. Component Library

### 10.1 Button Component

**File: `src/components/ui/Button.tsx`**

```tsx
import React from "react";
import { cn } from "@utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, children, className, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200";

    const sizeStyles = {
      xs: "px-3 py-1.5 text-xs",
      sm: "px-3.5 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-3.5 text-base",
    };

    const variantStyles = {
      primary: "bg-primary-600 text-white hover:bg-primary-700",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
      outline: "bg-transparent text-primary-600 border-2 border-primary-600 hover:bg-primary-50",
      destructive: "bg-danger-600 text-white hover:bg-danger-700",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Spinner className="mr-2" />}
        {children}
      </button>
    );
  }
);
```

### 10.2 Input Component

```tsx
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>}
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 text-sm rounded-lg border",
        "focus:outline-none focus:ring-2 focus:ring-primary-500",
        error ? "border-danger-500" : "border-gray-300",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
  </div>
));
```

### 10.3 Card Component

```tsx
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white rounded-lg border border-gray-200 shadow-sm",
      elevated: "bg-white rounded-lg shadow-card",
      outlined: "border-2 border-gray-200 rounded-lg",
    };

    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div ref={ref} className={cn(variantClasses[variant], paddingClasses[padding], className)} {...props}>
        {children}
      </div>
    );
  }
);

// Sub-components
Card.Header = ({ title, action }) => (
  <div className="flex items-center justify-between pb-4 border-b">
    <h3 className="text-lg font-semibold">{title}</h3>
    {action}
  </div>
);

Card.Body = ({ children }) => <div className="py-4">{children}</div>;
Card.Footer = ({ children }) => <div className="pt-4 border-t">{children}</div>;
```

### 10.4 Modal Component

```tsx
import { Dialog, Transition } from "@headlessui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, size = "md", children }: ModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* Modal Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={cn("w-full bg-white rounded-xl shadow-xl", sizeClasses[size])}>
              {title && <Dialog.Title className="px-6 py-4 border-b font-semibold text-lg">{title}</Dialog.Title>}
              <div className="p-6">{children}</div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
```

---

## 11. Form Handling dengan React Hook Form + Zod

### 11.1 Zod Schema Definition

**File: `src/validation/schemas/asset.schema.ts`**

```typescript
import { z } from "zod";

export const assetFormSchema = z.object({
  name: z.string().min(1, "Nama aset wajib diisi").max(100),
  categoryId: z.number().min(1, "Kategori wajib dipilih"),
  serialNumber: z.string().optional(),
  purchasePrice: z.number().min(0, "Harga tidak boleh negatif").optional(),
  purchaseDate: z.string().optional(),
  condition: z.enum(["BRAND_NEW", "GOOD", "USED_OKAY", "MINOR_DAMAGE", "MAJOR_DAMAGE"]),
  quantity: z.number().min(1, "Minimal 1 unit"),
  notes: z.string().max(500).optional(),
});

export type AssetFormData = z.infer<typeof assetFormSchema>;
```

### 11.2 useZodForm Hook

**File: `src/hooks/useZodForm.ts`**

```typescript
import { useForm, UseFormProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

export function useZodForm<T extends FieldValues>(schema: ZodSchema<T>, options?: Omit<UseFormProps<T>, "resolver">) {
  return useForm<T>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    ...options,
  });
}
```

### 11.3 Form Component Example

```tsx
import { useZodForm } from "@hooks/useZodForm";
import { assetFormSchema, AssetFormData } from "@validation/schemas/asset.schema";
import { Button, Input } from "@components/ui";

function AssetForm({ onSubmit }: { onSubmit: (data: AssetFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useZodForm(assetFormSchema, {
    defaultValues: {
      condition: "BRAND_NEW",
      quantity: 1,
    },
  });

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
    reset();
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <Input label="Nama Aset" {...register("name")} error={errors.name?.message} />

      <Input
        label="Harga Pembelian"
        type="number"
        {...register("purchasePrice", { valueAsNumber: true })}
        error={errors.purchasePrice?.message}
      />

      <Input
        label="Kuantitas"
        type="number"
        {...register("quantity", { valueAsNumber: true })}
        error={errors.quantity?.message}
      />

      <Button type="submit" isLoading={isSubmitting}>
        Simpan
      </Button>
    </form>
  );
}
```

---

## 12. Testing dengan Vitest

### 12.1 Test Setup

**File: `src/test/vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
```

### 12.2 Test Utils

**File: `src/test/test-utils.tsx`**

```typescript
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactElement, ReactNode } from "react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
```

### 12.3 Component Test Example

**File: `src/components/ui/Button.test.tsx`**

```typescript
import { render, screen, fireEvent } from "@test/test-utils";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading spinner when isLoading", () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant styles", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-danger-600");
  });
});
```

### 12.4 Hook Test Example

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useAssets } from "@hooks/queries";
import { wrapper } from "@test/test-utils";

describe("useAssets", () => {
  it("fetches assets successfully", async () => {
    const { result } = renderHook(() => useAssets(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
```

---

## 13. Performance Optimization

### 13.1 Code Splitting

```typescript
// vite.config.ts - Manual chunks
rollupOptions: {
  output: {
    manualChunks: {
      "vendor-react": ["react", "react-dom"],
      "vendor-state": ["zustand", "@tanstack/react-query"],
      "vendor-ui": ["@headlessui/react", "framer-motion"],
      "vendor-charts": ["recharts"],
      "vendor-forms": ["react-hook-form", "zod"],
      "vendor-utils": ["date-fns", "clsx", "tailwind-merge"],
    },
  },
},
```

### 13.2 Lazy Loading

```tsx
// Route-based code splitting
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));

// Component-level lazy loading
const HeavyChart = lazy(() => import("./components/HeavyChart"));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### 13.3 Memoization

```tsx
import { memo, useMemo, useCallback } from "react";

// Memoize expensive computations
const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.price, 0), [assets]);

// Memoize callbacks
const handleSearch = useCallback((term: string) => {
  setSearchTerm(term);
}, []);

// Memoize components
const AssetCard = memo(({ asset }: { asset: Asset }) => <Card>{asset.name}</Card>);
```

### 13.4 Virtual Lists

```bash
pnpm add @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualAssetList({ assets }: { assets: Asset[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: assets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <AssetRow asset={assets[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 14. Rekomendasi Penyempurnaan

### 14.1 Dependensi yang Direkomendasikan

```bash
# Performance & DX
pnpm add @tanstack/react-virtual       # Virtual scrolling
pnpm add @formkit/auto-animate         # Auto animations

# Enhanced Forms
pnpm add react-select                   # Better select component
pnpm add react-dropzone                 # File upload

# Date/Time
pnpm add react-datepicker               # Date picker

# Error Monitoring (Production)
pnpm add @sentry/react                  # Error tracking

# PWA Support
pnpm add -D vite-plugin-pwa             # PWA plugin

# Code Quality
pnpm add -D @trivago/prettier-plugin-sort-imports
pnpm add -D prettier-plugin-tailwindcss
```

### 14.2 File yang Perlu Dibuat

#### 14.2.1 Environment Types

**Buat file: `src/env.d.ts`**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_ENABLE_DEMO_ACCOUNTS: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_ANALYTICS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

#### 14.2.2 Prettier Configuration

**Buat file: `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  "importOrder": [
    "^react",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^@components/(.*)$",
    "^@features/(.*)$",
    "^@hooks/(.*)$",
    "^@stores/(.*)$",
    "^@services/(.*)$",
    "^@utils/(.*)$",
    "^@types/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

#### 14.2.3 VS Code Settings

**Buat file: `.vscode/settings.json`**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### 14.2.4 Git Hooks (Husky + lint-staged)

```bash
pnpm add -D husky lint-staged
npx husky init
```

**Buat file: `.husky/pre-commit`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Tambahkan ke `package.json`:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

### 14.3 Error Boundary Improvement

**Perbaiki file: `src/components/ErrorBoundary.tsx`**

```tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // TODO: Send to error tracking service (Sentry)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-6">Maaf, terjadi kesalahan yang tidak terduga.</p>
            <Button onClick={this.handleReset}>Kembali ke Beranda</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 14.4 Loading States

**Buat file: `src/components/ui/Skeleton.tsx`**

```tsx
import { cn } from "@utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "text", width, height }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div className={cn("animate-pulse bg-gray-200", variantClasses[variant], className)} style={{ width, height }} />
  );
}

// Preset skeletons
export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <Skeleton height={24} width="50%" />
      <Skeleton height={16} />
      <Skeleton height={16} width="75%" />
    </div>
  );
}
```

---

## 15. Best Practices & Coding Standards

### 15.1 Naming Conventions

| Type             | Format                     | Example                 |
| ---------------- | -------------------------- | ----------------------- |
| Components       | PascalCase                 | `AssetCard.tsx`         |
| Hooks            | camelCase + `use` prefix   | `useAssetQueries.ts`    |
| Utils            | camelCase                  | `formatCurrency.ts`     |
| Types/Interfaces | PascalCase (no `I` prefix) | `Asset`, `UserRole`     |
| Constants        | UPPER_SNAKE_CASE           | `MAX_FILE_SIZE`         |
| Booleans         | `is/has/should/can` prefix | `isLoading`, `hasError` |

### 15.2 File Organization

```typescript
// Urutan import
import React from "react"; // 1. React
import { useQuery } from "@tanstack/react-query"; // 2. External libs
import { Button } from "@components/ui"; // 3. Internal absolute
import { useAssets } from "@hooks/queries"; // 4. Hooks
import { formatDate } from "@utils/dateFormatter"; // 5. Utils
import type { Asset } from "@/types"; // 6. Types
import "./AssetCard.css"; // 7. Styles
```

### 15.3 Component Structure

```tsx
// 1. Imports
import React from "react";
import { cn } from "@utils/cn";

// 2. Types/Interfaces
interface AssetCardProps {
  asset: Asset;
  onSelect?: (asset: Asset) => void;
}

// 3. Component
export function AssetCard({ asset, onSelect }: AssetCardProps) {
  // 3a. Hooks (queries, state, refs)
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Derived state
  const displayName = asset.name.toUpperCase();

  // 3c. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3d. Handlers
  const handleClick = () => {
    onSelect?.(asset);
  };

  // 3e. Render
  return <div onClick={handleClick}>{displayName}</div>;
}

// 4. Default export (if needed)
export default AssetCard;
```

### 15.4 TypeScript Best Practices

```typescript
// ✅ Prefer interfaces for object types
interface User {
  id: number;
  name: string;
}

// ✅ Use type for unions/intersections
type UserRole = "admin" | "user" | "guest";
type AdminUser = User & { permissions: string[] };

// ✅ Avoid `any`, use `unknown` for dynamic data
function parseJSON(data: unknown): User {
  // Type guard
  if (isUser(data)) {
    return data;
  }
  throw new Error("Invalid user data");
}

// ✅ Use const assertions for literal types
const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
} as const;

// ✅ Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map(renderItem)}</>;
}
```

### 15.5 Performance Tips

```typescript
// ✅ Use selective store subscriptions
const userName = useAuthStore((s) => s.currentUser?.name);

// ✅ Memoize expensive computations
const sortedAssets = useMemo(() =>
  [...assets].sort((a, b) => a.name.localeCompare(b.name)),
  [assets]
);

// ✅ Memoize callbacks passed to children
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);

// ✅ Use React.memo for pure components
const AssetRow = memo(({ asset }: { asset: Asset }) => (
  <tr>{asset.name}</tr>
));

// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import("./HeavyChart"));
```

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)

---

## 📝 Changelog

| Version | Date       | Changes                             |
| ------- | ---------- | ----------------------------------- |
| 1.0.0   | 2026-01-24 | Initial comprehensive documentation |

---

**Maintained by**: Trinity Development Team  
**Last Review**: 2026-01-24
