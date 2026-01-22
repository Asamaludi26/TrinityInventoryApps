# ⚡ Trinity Inventory - Performance Guide

## 📋 Panduan Optimasi Performa Komprehensif

Dokumentasi lengkap strategi dan implementasi optimasi performa untuk Trinity Asset Management System. Panduan ini mencakup frontend optimization (React + Vite), backend tuning (NestJS), dan database performance (PostgreSQL + Prisma).

---

## 🎯 Performance Objectives

### Core Web Vitals Targets

| Metric                              | Target  | Good    | Needs Improvement | Poor    |
| ----------------------------------- | ------- | ------- | ----------------- | ------- |
| **LCP** (Largest Contentful Paint)  | < 2.5s  | ≤ 2.5s  | 2.5s - 4.0s       | > 4.0s  |
| **FID** (First Input Delay)         | < 100ms | ≤ 100ms | 100ms - 300ms     | > 300ms |
| **CLS** (Cumulative Layout Shift)   | < 0.1   | ≤ 0.1   | 0.1 - 0.25        | > 0.25  |
| **INP** (Interaction to Next Paint) | < 200ms | ≤ 200ms | 200ms - 500ms     | > 500ms |

### Application-Specific Targets

| Metric                | Target  | Notes               |
| --------------------- | ------- | ------------------- |
| Initial Page Load     | < 2s    | Dashboard with data |
| SPA Navigation        | < 300ms | Between pages       |
| API Response (List)   | < 500ms | Paginated queries   |
| API Response (Single) | < 200ms | Single record       |
| Search Response       | < 300ms | Full-text search    |

---

## 🖥️ A. Frontend Performance (React + Vite)

### A1. Vite Build Optimization

#### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "@headlessui/react"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts"],
          "vendor-utils": ["date-fns", "zod"],
        },
      },
    },
    // Minification
    minify: "esbuild",
    // Source maps for debugging (disable in production for smaller bundles)
    sourcemap: false,
    // Target modern browsers
    target: "esnext",
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query", "zustand"],
  },
});
```

### A2. Code Splitting with Lazy Loading

```typescript
// src/App.tsx - Route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'));
const AssetList = lazy(() => import('@/features/assets/AssetListPage'));
const AssetDetail = lazy(() => import('@/features/assets/AssetDetailPage'));
const RequestList = lazy(() => import('@/features/requests/RequestListPage'));
const Settings = lazy(() => import('@/features/settings/SettingsPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/requests" element={<RequestList />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### A3. Tree Shaking Best Practices

```typescript
// ❌ BAD: Imports entire library
import * as Icons from "react-icons/fi";
import _ from "lodash";

// ✅ GOOD: Named imports (tree-shakeable)
import { FiSearch, FiFilter, FiDownload } from "react-icons/fi";
import debounce from "lodash/debounce";

// ❌ BAD: Import all date-fns
import * as dateFns from "date-fns";

// ✅ GOOD: Import specific functions
import { format, parseISO, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
```

### A4. React Performance Optimization

#### Memoization

```typescript
// hooks/useAssetFilters.ts
import { useMemo, useCallback } from "react";

export function useAssetFilters(assets: Asset[], filters: FilterState) {
  // Memoize filtered results
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(searchLower));
    }

    return result;
  }, [assets, filters.status, filters.search]);

  return { filteredAssets };
}
```

#### Memoized Components

```tsx
// components/AssetCard.tsx
import { memo, useCallback } from "react";

interface AssetCardProps {
  asset: Asset;
  onSelect: (id: string) => void;
}

// Memoized component - only re-renders when props change
export const AssetCard = memo(function AssetCard({
  asset,
  onSelect,
}: AssetCardProps) {
  return (
    <div onClick={() => onSelect(asset.id)}>
      <h3>{asset.name}</h3>
      <p>{asset.status}</p>
    </div>
  );
});
```

### A5. TanStack Query Optimization

```typescript
// services/api/assetApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Optimized query with caching
export function useAssets(filters: AssetFilters) {
  return useQuery({
    queryKey: ["assets", filters],
    queryFn: () => assetApi.getAssets(filters),
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    placeholderData: keepPreviousData, // Keep previous data while loading
  });
}

// Prefetching for anticipated navigation
export function usePrefetchAsset() {
  const queryClient = useQueryClient();

  return useCallback(
    (assetId: string) => {
      queryClient.prefetchQuery({
        queryKey: ["asset", assetId],
        queryFn: () => assetApi.getAsset(assetId),
      });
    },
    [queryClient],
  );
}

// Optimistic updates for mutations
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetApi.createAsset,
    onMutate: async (newAsset) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["assets"] });

      // Snapshot previous value
      const previousAssets = queryClient.getQueryData(["assets"]);

      // Optimistically update
      queryClient.setQueryData(["assets"], (old: Asset[]) => [
        ...old,
        { ...newAsset, id: "temp-id" },
      ]);

      return { previousAssets };
    },
    onError: (err, newAsset, context) => {
      // Rollback on error
      queryClient.setQueryData(["assets"], context?.previousAssets);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
```

### A6. Image Optimization

```typescript
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazy = true
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
    />
  );
}
```

### A7. Debouncing Search Input

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in search component
function AssetSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: assets } = useAssets({ search: debouncedSearch });

  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search assets..."
    />
  );
}
```

---

## 🔧 B. Backend Performance (NestJS)

### B1. Response Compression

```typescript
// backend/src/main.ts
import * as compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable gzip compression
  app.use(
    compression({
      threshold: 1024, // Only compress responses > 1KB
      level: 6, // Compression level (1-9)
    }),
  );

  await app.listen(3001);
}
```

### B2. Pagination for All List Endpoints

```typescript
// common/dto/pagination.dto.ts
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// common/helpers/pagination.helper.ts
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}
```

### B3. Efficient Prisma Queries

```typescript
// modules/assets/assets.service.ts
@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  // ✅ GOOD: Select only needed fields
  async findAll(query: PaginatedAssetQueryDto) {
    const { page = 1, limit = 10, status, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          brand: true,
          status: true,
          condition: true,
          model: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  // ✅ GOOD: Use includes only when needed
  async findOne(id: string) {
    return this.prisma.asset.findUnique({
      where: { id, deletedAt: null },
      include: {
        model: true,
        category: true,
        stockMovements: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }
}
```

### B4. Avoid N+1 Queries

```typescript
// ❌ BAD: N+1 query pattern
async function getBadAssets() {
  const assets = await prisma.asset.findMany();

  // This creates N additional queries!
  for (const asset of assets) {
    asset.category = await prisma.category.findUnique({
      where: { id: asset.categoryId },
    });
  }

  return assets;
}

// ✅ GOOD: Use include/select
async function getGoodAssets() {
  return prisma.asset.findMany({
    include: {
      category: true, // Single JOIN query
    },
  });
}

// ✅ GOOD: Use parallel queries
async function getGoodAssetsParallel() {
  const [assets, categories] = await Promise.all([
    prisma.asset.findMany(),
    prisma.category.findMany(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return assets.map((asset) => ({
    ...asset,
    category: categoryMap.get(asset.categoryId),
  }));
}
```

### B5. Caching Strategies

```typescript
// Simple in-memory cache for frequently accessed data
@Injectable()
export class CacheService {
  private cache = new Map<string, { data: any; expiry: number }>();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage in service
@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getStats() {
    const cacheKey = "dashboard:stats";
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const stats = await this.calculateStats();
    this.cache.set(cacheKey, stats, 300); // Cache for 5 minutes

    return stats;
  }
}
```

---

## 🗄️ C. Database Performance (PostgreSQL + Prisma)

### C1. Database Indexes

```prisma
// prisma/schema.prisma
model Asset {
  id              String       @id
  name            String
  status          AssetStatus
  condition       AssetCondition
  categoryId      Int
  typeId          Int
  createdAt       DateTime     @default(now())

  // Performance indexes
  @@index([status])
  @@index([condition])
  @@index([categoryId])
  @@index([typeId])
  @@index([createdAt(sort: Desc)])

  // Composite indexes for common queries
  @@index([status, categoryId])
  @@index([status, condition])
}

model Request {
  id              String        @id
  status          RequestStatus
  requestedById   Int
  divisionId      Int
  createdAt       DateTime      @default(now())

  @@index([status])
  @@index([requestedById])
  @@index([divisionId])
  @@index([createdAt(sort: Desc)])
  @@index([status, requestedById])
}
```

### C2. Query Analysis

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM "Asset"
WHERE status = 'TERSEDIA'
  AND "categoryId" = 1
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### C3. Connection Pooling

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// In DATABASE_URL, add connection pool settings:
// postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30
```

---

## 📊 D. Monitoring & Profiling

### D1. Request Logging Middleware

```typescript
// backend/src/common/middleware/logger.middleware.ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const { method, originalUrl } = req;
      const { statusCode } = res;

      // Log slow requests (> 1 second)
      if (duration > 1000) {
        console.warn(`SLOW REQUEST: ${method} ${originalUrl} - ${duration}ms`);
      }
    });

    next();
  }
}
```

### D2. Docker Resource Monitoring

```bash
# View container resource usage
docker stats trinity-backend trinity-frontend trinity-db

# Example output:
# CONTAINER        CPU %    MEM USAGE / LIMIT     MEM %
# trinity-backend  0.50%    256MiB / 2GiB         12.50%
# trinity-frontend 0.10%    32MiB / 512MiB        6.25%
# trinity-db       1.20%    128MiB / 1GiB         12.50%
```

### D3. Frontend Performance Monitoring

```typescript
// src/utils/performance.ts
export function reportWebVitals() {
  if (typeof window !== "undefined" && "performance" in window) {
    // Log LCP
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log("LCP:", entry.startTime);
      }
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // Log FID
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(
          "FID:",
          (entry as PerformanceEventTiming).processingStart - entry.startTime,
        );
      }
    }).observe({ entryTypes: ["first-input"] });
  }
}
```

---

## ✅ E. Performance Checklist

### Frontend

- [x] Code splitting with lazy loading
- [x] Tree shaking for imports
- [x] Memoization (useMemo, useCallback, memo)
- [x] TanStack Query with caching
- [x] Debounced search inputs
- [x] Lazy loading images
- [ ] Service Worker caching (PWA)
- [ ] Virtual scrolling for long lists

### Backend

- [x] Response compression (gzip)
- [x] Pagination on all list endpoints
- [x] Efficient Prisma queries (select/include)
- [x] Avoid N+1 queries
- [ ] Redis caching for hot data
- [ ] Background job processing

### Database

- [x] Proper indexes on frequently queried columns
- [x] Composite indexes for common query patterns
- [x] Connection pooling
- [ ] Query optimization with EXPLAIN ANALYZE
- [ ] Regular VACUUM and index maintenance

### Infrastructure

- [x] Nginx gzip compression
- [x] Static asset caching (1 year)
- [x] Docker health checks
- [ ] CDN for static assets
- [ ] Load balancing

---

## 📋 Quick Performance Commands

```bash
# Build analysis (frontend)
cd frontend && pnpm build && du -sh dist/

# Check bundle size
cd frontend && pnpm build -- --report

# Database query analysis
docker exec trinity-db psql -U trinity -d trinity_inventory \
  -c "EXPLAIN ANALYZE SELECT * FROM \"Asset\" WHERE status = 'TERSEDIA' LIMIT 10;"

# Monitor container resources
docker stats --no-stream

# Check Nginx compression
curl -H "Accept-Encoding: gzip" -I http://localhost/api/assets
```

---

**© 2026 Trinity Asset Management System**
