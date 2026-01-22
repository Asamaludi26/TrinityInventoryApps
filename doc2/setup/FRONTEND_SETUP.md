# ⚛️ Frontend Setup Guide - React + Vite

## 📋 Dokumentasi Lengkap Setup dan Konfigurasi Frontend

Panduan komprehensif untuk setup, konfigurasi, dan pengembangan frontend Trinity Asset Management menggunakan React dan Vite.

---

## 📊 Informasi Teknis

| Aspek                | Detail                         |
| -------------------- | ------------------------------ |
| **Framework**        | React 18.3.1                   |
| **Build Tool**       | Vite 6.0.11                    |
| **Language**         | TypeScript 5.7.2               |
| **State Management** | Zustand 5.0.3                  |
| **API Client**       | TanStack Query 5.90.19         |
| **Routing**          | React Router 7.12.0            |
| **Styling**          | Tailwind CSS 3.4.17            |
| **Forms**            | React Hook Form 7.71.1 + Zod   |
| **Testing**          | Vitest 3.0.0 + Testing Library |
| **Package Manager**  | pnpm                           |
| **Port**             | 5173 (development)             |

---

## 🛠️ A. Prerequisites

### A1. Software Requirements

```bash
# Check Node.js version (minimum 18.x, recommended 20.x)
node --version
# Expected: v20.x.x

# Check pnpm version
pnpm --version
# Expected: 9.x.x

# If pnpm not installed
npm install -g pnpm@latest
```

### A2. Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets",
    "vitest.explorer"
  ]
}
```

---

## 🚀 B. Initial Setup

### B1. Navigate to Frontend Directory

```bash
cd frontend

# Verify structure
ls -la
# Expected: package.json, src/, public/, vite.config.ts
```

### B2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list --depth=0
```

### B3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env.local

# Edit environment variables
notepad .env.local
```

**File `.env.local` yang harus dikonfigurasi:**

```dotenv
# =============================================================================
# Trinity Frontend Environment Configuration
# =============================================================================

# API Configuration
VITE_API_URL=http://localhost:3001/api/v1
VITE_USE_MOCK=false

# App Configuration
VITE_APP_NAME=Trinity Asset Flow
VITE_APP_VERSION=1.3.0

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
```

### B4. Start Development Server

```bash
# Start Vite dev server
pnpm dev

# Output yang diharapkan:
#  VITE v6.0.11  ready in 500ms
#
#  ➜  Local:   http://localhost:5173/
#  ➜  Network: http://192.168.x.x:5173/
#  ➜  press h + enter to show help
```

### B5. Access Application

Buka browser dan akses: `http://localhost:5173`

---

## 📁 C. Project Structure

### C1. Directory Layout

```
frontend/
├── public/                    # Static assets
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Root component
│   ├── RouterApp.tsx          # Route definitions
│   ├── routes.tsx             # Route configuration
│   ├── index.css              # Global styles (Tailwind)
│   │
│   ├── components/            # Shared components
│   │   ├── ui/                # Atomic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ...
│   │   ├── layout/            # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── icons/             # Icon components
│   │   └── ProtectedRoute.tsx # Auth route wrapper
│   │
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Dashboard
│   │   ├── assetRegistration/ # Asset registration
│   │   ├── requests/          # Request management
│   │   ├── stock/             # Stock management
│   │   ├── handover/          # Handover process
│   │   ├── repair/            # Repair management
│   │   ├── customers/         # Customer management
│   │   ├── users/             # User management
│   │   └── categories/        # Category management
│   │
│   ├── stores/                # Zustand state stores
│   │   ├── useAuthStore.ts
│   │   ├── useAssetStore.ts
│   │   ├── useRequestStore.ts
│   │   ├── useTransactionStore.ts
│   │   ├── useMasterDataStore.ts
│   │   ├── useNotificationStore.ts
│   │   └── useUIStore.ts
│   │
│   ├── services/              # API services
│   │   ├── api/               # Modular API clients
│   │   │   ├── client.ts      # Base HTTP client
│   │   │   ├── auth.api.ts    # Auth endpoints
│   │   │   ├── assets.api.ts  # Asset endpoints
│   │   │   ├── requests.api.ts
│   │   │   └── ...
│   │   └── api.ts             # Legacy compatibility layer
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useZodForm.ts
│   │   ├── useGenericFilter.ts
│   │   ├── useSortableData.ts
│   │   └── queries/           # TanStack Query hooks
│   │
│   ├── providers/             # React context providers
│   │   ├── QueryProvider.tsx
│   │   └── NotificationProvider.tsx
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── cn.ts              # Classname helper
│   │   ├── dateFormatter.ts   # Date utilities
│   │   ├── permissions.ts     # RBAC permissions
│   │   └── ...
│   │
│   ├── validation/            # Zod schemas
│   │   └── schemas/
│   │
│   ├── constants/             # Application constants
│   │   └── labels.ts
│   │
│   ├── contexts/              # React contexts
│   │   └── GlobalDataContext.tsx
│   │
│   └── test/                  # Test utilities
│       ├── test-utils.tsx
│       └── vitest.setup.ts
│
├── .env.example               # Environment template
├── .env.local                 # Local environment (git-ignored)
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── postcss.config.js          # PostCSS configuration
```

### C2. Feature Module Pattern

Setiap feature mengikuti struktur yang konsisten:

```
features/{feature}/
├── index.ts                   # Public exports
├── {Feature}Page.tsx          # Main page component
├── components/                # Feature-specific components
│   ├── {Feature}Form.tsx
│   ├── {Feature}List.tsx
│   └── {Feature}Card.tsx
├── hooks/                     # Feature-specific hooks
│   └── use{Feature}.ts
└── types.ts                   # Feature-specific types
```

---

## 🗂️ D. State Management (Zustand)

### D1. Available Stores

| Store                  | Purpose                           |
| ---------------------- | --------------------------------- |
| `useAuthStore`         | User authentication, login/logout |
| `useAssetStore`        | Asset data and operations         |
| `useRequestStore`      | Request management                |
| `useTransactionStore`  | Transaction handling              |
| `useMasterDataStore`   | Categories, types, divisions      |
| `useNotificationStore` | Toast notifications               |
| `useUIStore`           | UI state (sidebar, modals)        |

### D2. Usage Pattern

```typescript
import { useAuthStore } from '@stores/useAuthStore';

function ProfileComponent() {
  // Select specific state
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  // Or destructure multiple values
  const { currentUser, token, login } = useAuthStore();

  return (
    <div>
      <p>Welcome, {currentUser?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### D3. Store with Persistence

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      currentUser: null,
      login: async (email, password) => {
        const response = await authApi.login(email, password);
        set({ token: response.token, currentUser: response.user });
      },
      logout: () => {
        set({ token: null, currentUser: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

---

## 🔄 E. API Integration (TanStack Query)

### E1. Query Provider Setup

```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### E2. Using Queries

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@services/api/assets.api';

// Fetch data
function AssetList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsApi.getAll(),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <AssetTable data={data} />;
}

// Mutate data
function CreateAssetForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newAsset) => assetsApi.create(newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### E3. API Client Structure

```typescript
// src/services/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth-storage")?.token;

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.json());
  }

  return response.json();
}

export { fetchWithAuth, API_URL, USE_MOCK };
```

---

## 📝 F. Form Handling

### F1. React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const assetSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  brand: z.string().min(1, 'Brand wajib diisi'),
  serialNumber: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  purchaseDate: z.date().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

// Use in component
function AssetForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      brand: '',
    },
  });

  const onSubmit = (data: AssetFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('brand')} />
      {errors.brand && <span>{errors.brand.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### F2. Custom useZodForm Hook

```typescript
import { useZodForm } from '@hooks/useZodForm';

function MyForm() {
  const { form, handleSubmit, errors } = useZodForm({
    schema: assetSchema,
    defaultValues: { name: '', brand: '' },
    onSubmit: async (data) => {
      await saveAsset(data);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

---

## 🎨 G. Styling (Tailwind CSS)

### G1. Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        success: {
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          500: "#eab308",
          600: "#ca8a04",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
```

### G2. Using cn() Helper

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in component
function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium',
        variant === 'primary' && 'bg-primary-600 text-white',
        variant === 'secondary' && 'bg-secondary-200 text-secondary-800',
        className
      )}
      {...props}
    />
  );
}
```

---

## 🧪 H. Testing

### H1. Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/utils/cn.test.ts
```

### H2. Vitest Configuration

```typescript
// vite.config.ts (test section)
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/vitest.setup.ts'],
  include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  exclude: ['node_modules', 'dist'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  },
}
```

### H3. Test Setup

```typescript
// src/test/vitest.setup.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

### H4. Testing Components

```typescript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### H5. Testing Utilities

```typescript
// src/test/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function AllTheProviders({ children }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

const customRender = (ui, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

---

## 📦 I. Build & Deployment

### I1. Build for Production

```bash
# Type check and build
pnpm build

# Output directory: dist/
# Files will be optimized and minified
```

### I2. Preview Production Build

```bash
# Preview built files locally
pnpm preview

# Access at http://localhost:4173
```

### I3. Build Output Structure

```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-[hash].js     # Main bundle
│   ├── index-[hash].css    # Styles
│   ├── vendor-react-[hash].js
│   ├── vendor-ui-[hash].js
│   └── ...
└── favicon.ico
```

### I4. Chunk Splitting Strategy

```typescript
// vite.config.ts
rollupOptions: {
  output: {
    manualChunks: (id) => {
      // Core React
      if (id.includes('react-dom')) return 'vendor-react';
      if (id.includes('react') && !id.includes('react-icons')) return 'vendor-react';

      // State management
      if (id.includes('zustand')) return 'vendor-state';

      // UI libraries
      if (id.includes('@headlessui') || id.includes('framer-motion')) return 'vendor-ui';

      // Charts
      if (id.includes('recharts')) return 'vendor-charts';

      // Forms
      if (id.includes('react-hook-form') || id.includes('zod')) return 'vendor-forms';
    },
  },
}
```

---

## 🔧 J. Common Commands

### J1. Development

```bash
# Start development server
pnpm dev

# Open Vite dev server with debug
pnpm dev --debug
```

### J2. Code Quality

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Type checking
pnpm typecheck
```

### J3. Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### J4. Build

```bash
# Production build
pnpm build

# Preview production build
pnpm preview
```

---

## 🔍 K. Troubleshooting

### K1. Common Issues

| Issue                    | Cause                            | Solution                               |
| ------------------------ | -------------------------------- | -------------------------------------- |
| `CORS error`             | API not allowing frontend origin | Check backend CORS config              |
| `Module not found`       | Path alias issue                 | Check vite.config.ts aliases           |
| `Blank page`             | React error boundary             | Check console for errors               |
| `Styling not applied`    | Tailwind not processing          | Check tailwind.config.js content paths |
| `Hot reload not working` | Vite HMR issue                   | Restart dev server                     |

### K2. Debug Mode

```typescript
// Enable React Query Devtools
// Already included in QueryProvider

// Access via browser:
// Click the React Query logo in bottom-right corner
```

### K3. Network Debugging

```typescript
// Check API calls in Network tab
// Enable VITE_ENABLE_DEBUG=true for verbose logging

// In api client:
if (import.meta.env.VITE_ENABLE_DEBUG === "true") {
  console.log("API Request:", url, options);
}
```

---

## 📚 L. Additional Resources

### L1. Related Documentation

- [Backend Setup Guide](BACKEND_SETUP.md) - NestJS configuration
- [Database Setup Guide](DATABASE_SETUP.md) - PostgreSQL & Prisma
- [Environment Configuration](ENVIRONMENT_CONFIG.md) - All environment variables

### L2. External Links

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)

---

**© 2026 Trinity Asset Management System**
