# 📊 Trinity Inventory - Ringkasan Arsitektur & Tech Stack

## Status Aplikasi Saat Ini

- **Status:** Production-Ready ✅
- **Arsitektur:** Decoupled Client-Server (REST API)
- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React + Vite SPA
- **State Management:** Zustand + TanStack Query
- **Port Backend:** 3001
- **Port Frontend:** 5173 (dev)

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│    React 18 + Vite 6 + TypeScript + Tailwind CSS            │
│    Port: 5173 (dev) / 80/443 (prod via Nginx)               │
├─────────────────────────────────────────────────────────────┤
│                   State Management                           │
│    Zustand (7 stores) + TanStack Query (Server State)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (HTTP/HTTPS)
                           │ /api/v1/*
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│        NestJS 11 + TypeScript + Prisma ORM                  │
│        Port: 3001                                            │
├─────────────────────────────────────────────────────────────┤
│  Modules: Auth, Users, Assets, Requests, Loans,             │
│  Transactions, Customers, Categories, Dashboard,             │
│  Notifications, Activity Logs, Reports                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma Client
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│           PostgreSQL 17 + 27+ Tables                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 1. Teknologi Frontend

### Stack Utama

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| React | 18.3.1 | Core UI Library |
| TypeScript | 5.7.2 | Type Safety |
| Vite | 6.0.11 | Build Tool & Dev Server |
| React Router | 7.12.0 | Client-side Routing |
| Zustand | 5.0.3 | Client State Management |
| TanStack Query | 5.90.19 | Server State Management |

### Styling & UI

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| Tailwind CSS | 3.4.17 | Utility-first CSS |
| Headless UI | 2.2.0 | Accessible UI Components |
| Framer Motion | 11.15.0 | Animations |
| React Icons | 5.5.0 | Icon Library |
| Tailwind Merge | 2.6.0 | Class Conflict Resolution |
| clsx | 2.1.1 | Conditional Classes |

### Form & Validation

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| React Hook Form | 7.71.1 | Form State Management |
| Zod | 3.25.76 | Schema Validation |
| @hookform/resolvers | 5.2.2 | Zod Integration |

### Utilities

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| date-fns | 4.1.0 | Date Manipulation |
| Recharts | 3.6.0 | Charts & Visualizations |
| QRCode.react | 4.2.0 | QR Code Generation |
| html5-qrcode | 2.3.8 | QR Code Scanning |
| jspdf | 4.0.0 | PDF Generation |
| html2canvas | 1.4.1 | Screenshot Capture |

### Testing

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| Vitest | 3.0.0 | Unit Testing |
| Testing Library React | 16.3.1 | Component Testing |
| Testing Library Jest DOM | 6.9.1 | DOM Assertions |
| Testing Library User Event | 14.6.1 | User Interaction |
| jsdom | 27.4.0 | DOM Environment |

### State Management (Zustand Stores)

```typescript
// 7 Zustand Stores
useAuthStore      // Authentication & user session
useUIStore        // UI state, navigation, modals
useAssetStore     // Assets data & filtering
useRequestStore   // Request workflow management
useTransactionStore // Transactions (handover, dismantle)
useMasterDataStore  // Users, divisions, categories
useNotificationStore // Notifications & toasts
```

### API Integration Pattern

```typescript
// TanStack Query untuk server state
const { data, isLoading, error } = useQuery({
  queryKey: ['assets', filters],
  queryFn: () => assetApi.getAssets(filters)
});

// Mutations dengan optimistic updates
const createMutation = useMutation({
  mutationFn: assetApi.createAsset,
  onSuccess: () => queryClient.invalidateQueries(['assets'])
});
```

### Folder Structure

```
frontend/src/
├── components/
│   └── ui/              # Atomic UI components
├── features/            # Feature modules
│   ├── assets/
│   ├── auth/
│   ├── customers/
│   ├── dashboard/
│   ├── loans/
│   ├── master-data/
│   ├── notifications/
│   ├── requests/
│   ├── settings/
│   └── transactions/
├── hooks/               # Custom React hooks
├── services/
│   └── api/            # API client modules
├── stores/              # Zustand stores
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

---

## 🔧 2. Teknologi Backend

### Stack Utama

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| NestJS | 11.1.12 | Backend Framework |
| TypeScript | 5.9.3 | Type Safety |
| Prisma | 7.2.0 | ORM |
| PostgreSQL | 17 | Database |
| Node.js | ≥20.0.0 | Runtime |
| pnpm | ≥9.0.0 | Package Manager |

### Core NestJS Modules

| Module | Purpose |
|--------|---------|
| @nestjs/config | Environment Configuration |
| @nestjs/jwt | JWT Token Management |
| @nestjs/passport | Authentication |
| @nestjs/swagger | API Documentation |
| @nestjs/throttler | Rate Limiting |
| @nestjs/platform-express | HTTP Server |

### Security & Middleware

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| Helmet | 8.1.0 | Security Headers |
| bcrypt | 6.0.0 | Password Hashing |
| passport-jwt | 4.0.1 | JWT Strategy |
| passport-local | 1.0.0 | Local Strategy |
| compression | 1.8.0 | Response Compression |
| class-validator | 0.14.3 | DTO Validation |
| class-transformer | 0.5.1 | DTO Transformation |

### Feature Modules (12 Modules)

```typescript
// backend/src/modules/
├── activity-logs/   // Audit trail & activity logging
├── assets/          // Asset management CRUD
├── auth/            // Authentication (JWT)
├── categories/      // Asset categories & types
├── customers/       // Customer management
├── dashboard/       // Statistics & analytics
├── loans/           // Loan request workflow
├── notifications/   // Notification system
├── reports/         // Report generation
├── requests/        // Purchase request workflow
├── transactions/    // Handover, dismantle operations
└── users/           // User management & RBAC
```

### Module Pattern

```typescript
// Setiap module mengikuti pattern NestJS:
{feature}/
├── {feature}.module.ts      // Module definition
├── {feature}.controller.ts  // REST endpoints
├── {feature}.service.ts     // Business logic
└── dto/                     // Request/Response DTOs
    ├── create-{feature}.dto.ts
    ├── update-{feature}.dto.ts
    └── {feature}-response.dto.ts
```

### Testing

| Teknologi | Versi | Purpose |
|-----------|-------|---------|
| Jest | 30.2.0 | Testing Framework |
| SuperTest | 7.0.0 | HTTP Testing |
| @nestjs/testing | 11.1.12 | NestJS Test Utils |
| ts-jest | 29.4.6 | TypeScript Support |

### Common Services

```typescript
// backend/src/common/services/
DocumentNumberService  // Generate document IDs
PaginationHelper       // Pagination utilities
```

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { /* payload */ },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// Error Response
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "error": "BadRequest"
}
```

---

## 🗄️ 3. Database (PostgreSQL + Prisma)

### Database Configuration

```typescript
// PostgreSQL 17 + Prisma ORM
DATABASE_URL="postgresql://user:password@localhost:5432/trinity_inventory"
```

### Schema Statistics

| Category | Count |
|----------|-------|
| Total Models | 27+ |
| Enums | 15 |
| Relations | 50+ |

### Core Models

```prisma
// Master Data
Division, User, UserPreference
AssetCategory, AssetType, StandardItem

// Assets
Asset, StockThreshold, StockMovement

// Requests
Request, RequestItem, RequestActivity

// Loans
LoanRequest, LoanItem, LoanAssetAssignment, AssetReturn

// Field Operations
Customer, Installation, Maintenance, Dismantle

// System
Notification, ActivityLog, Attachment, WhatsAppLog, SystemConfig
```

### Key Enums

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN_LOGISTIK
  ADMIN_PURCHASE
  LEADER
  STAFF
  TEKNISI
}

enum AssetStatus {
  TERSEDIA
  DIPINJAM
  DIGUNAKAN
  MAINTENANCE
  RUSAK
  HILANG
  DIHAPUS
}

enum AssetCondition {
  BARU
  BAIK
  CUKUP
  RUSAK_RINGAN
  RUSAK_BERAT
  TIDAK_LAYAK
}

enum RequestStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum LoanRequestStatus {
  PENDING
  APPROVED
  PARTIAL
  ACTIVE
  RETURNED
  REJECTED
  CANCELLED
}
```

### Performance Indexes

```prisma
// Asset indexes
@@index([status])
@@index([condition])
@@index([categoryId])
@@index([typeId])
@@index([locationDivisionId])

// Request indexes
@@index([status])
@@index([requestedById])
@@index([divisionId])
@@index([createdAt(sort: Desc)])

// Composite indexes for common queries
@@index([status, condition])
@@index([status, requestedById, createdAt])
```

---

## 🔐 4. Authentication & Security

### JWT Implementation

```typescript
// Dual Token System
Access Token:  15 menit (short-lived)
Refresh Token: 7 hari (long-lived)

// Token Payload
{
  sub: userId,
  email: string,
  role: UserRole,
  divisionId: number,
  iat: timestamp,
  exp: timestamp
}
```

### RBAC (Role-Based Access Control)

```typescript
// Roles dengan permission levels
SUPER_ADMIN     // Full access ke semua fitur
ADMIN_LOGISTIK  // Manage assets, inventory, transactions
ADMIN_PURCHASE  // Manage requests, procurement
LEADER          // Approve requests, view reports
STAFF           // Create requests, view own data
TEKNISI         // Field operations, installations

// Guard Implementation
@Roles('SUPER_ADMIN', 'ADMIN_LOGISTIK')
@UseGuards(JwtAuthGuard, RolesGuard)
async createAsset() { /* ... */ }
```

### Security Headers (Helmet)

```typescript
// Configured headers
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### Rate Limiting

```typescript
// ThrottlerModule configuration
ttl: 60000        // 1 menit window
limit: 100        // Max 100 requests per window

// Login endpoint: stricter limits
ttl: 60000
limit: 5
```

### Input Validation

```typescript
// DTO Validation dengan class-validator
class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsPositive()
  categoryId: number;

  @IsEnum(AssetCondition)
  condition: AssetCondition;
}
```

---

## 🚀 5. DevOps & Deployment

### Docker Configuration

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://trinity:${DB_PASS}@postgres:5432/inventory
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:17-alpine
    volumes:
      - pg_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: trinity_inventory
      POSTGRES_USER: trinity
      POSTGRES_PASSWORD: ${DB_PASS}
```

### Multi-Stage Dockerfile

```dockerfile
# Backend Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma:generate && pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Development Commands

```bash
# Backend (from /backend)
pnpm install                    # Install dependencies
pnpm prisma:generate            # Generate Prisma Client
pnpm prisma:migrate             # Run migrations
pnpm start:dev                  # Development server (port 3001)
pnpm test                       # Unit tests
pnpm test:e2e                   # E2E tests
pnpm test:cov                   # Coverage report

# Frontend (from /frontend)
pnpm install                    # Install dependencies
pnpm dev                        # Dev server (port 5173)
pnpm build                      # Production build
pnpm test                       # Unit tests (Vitest)
pnpm lint                       # ESLint check

# Docker
docker compose -f docker-compose.dev.yml up -d
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
jobs:
  test-backend:
    - pnpm install --frozen-lockfile
    - pnpm prisma:generate
    - pnpm lint
    - pnpm test:cov
    - pnpm build

  test-frontend:
    - pnpm install --frozen-lockfile
    - pnpm lint
    - pnpm typecheck
    - pnpm test:coverage
    - pnpm build

  deploy:
    needs: [test-backend, test-frontend]
    - docker build & push
    - ssh deploy to Proxmox
```

---

## ✅ 6. Quality Assurance

### Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit Tests (Backend) | Jest | 80%+ |
| Unit Tests (Frontend) | Vitest | 80%+ |
| Integration Tests | SuperTest | Critical paths |
| E2E Tests | Playwright/Cypress | User journeys |

### Code Quality

| Tool | Purpose |
|------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| TypeScript | Static Type Checking |
| Husky + lint-staged | Pre-commit hooks |

### Test Example

```typescript
// Backend: Jest
describe('AssetsService', () => {
  it('should create asset with valid data', async () => {
    const result = await service.create(createAssetDto);
    expect(result.id).toBeDefined();
    expect(result.status).toBe(AssetStatus.TERSEDIA);
  });
});

// Frontend: Vitest
describe('useAuthStore', () => {
  it('should login with valid credentials', async () => {
    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.login(credentials);
    });
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## 📈 7. Performance Optimization

### Backend

- **Database:** Prisma query optimization, proper indexing
- **Caching:** Response compression (gzip)
- **Rate Limiting:** ThrottlerModule prevents abuse
- **Pagination:** All list endpoints paginated

### Frontend

- **Code Splitting:** Vite automatic chunking
- **Lazy Loading:** Dynamic imports untuk routes
- **State Management:** Zustand minimal re-renders
- **Server State:** TanStack Query caching & deduplication

### Database

```sql
-- Key performance indexes
CREATE INDEX idx_assets_status ON Asset(status);
CREATE INDEX idx_assets_category ON Asset(categoryId);
CREATE INDEX idx_requests_status ON Request(status);
CREATE INDEX idx_activity_logs_created ON ActivityLog(createdAt DESC);
```

---

## 📋 Tech Stack Summary

```json
{
  "frontend": {
    "framework": "React 18.3.1",
    "buildTool": "Vite 6.0.11",
    "language": "TypeScript 5.7.2",
    "styling": "Tailwind CSS 3.4.17",
    "stateManagement": "Zustand 5.0.3",
    "serverState": "TanStack Query 5.90.19",
    "routing": "React Router 7.12.0",
    "forms": "React Hook Form 7.71.1 + Zod",
    "testing": "Vitest 3.0.0 + Testing Library"
  },
  "backend": {
    "framework": "NestJS 11.1.12",
    "language": "TypeScript 5.9.3",
    "orm": "Prisma 7.2.0",
    "database": "PostgreSQL 17",
    "auth": "Passport + JWT",
    "validation": "class-validator + class-transformer",
    "security": "Helmet + Throttler",
    "testing": "Jest 30.2.0 + SuperTest"
  },
  "devops": {
    "containerization": "Docker + docker-compose",
    "cicd": "GitHub Actions",
    "runtime": "Node.js 22 LTS",
    "packageManager": "pnpm 9.15.0"
  },
  "architecture": {
    "pattern": "Decoupled Client-Server",
    "api": "REST API (/api/v1/*)",
    "modules": "12 NestJS Feature Modules",
    "stores": "7 Zustand Stores"
  }
}
```

---

## 🔄 Perbedaan dari Perencanaan Awal

| Aspek | Perencanaan Awal | Implementasi Aktual |
|-------|------------------|---------------------|
| Backend | Next.js 16 Server Actions | NestJS REST API |
| Database Access | Server Actions | Prisma via REST API |
| Auth | NextAuth.js v5 | Passport + JWT |
| API Style | Server Actions (RPC) | REST API |
| Deployment | Single codebase | Decoupled services |

### Alasan Perubahan

1. **Separation of Concerns:** Backend dan frontend terpisah untuk maintainability
2. **Scalability:** Backend bisa di-scale independen
3. **Team Flexibility:** Tim bisa bekerja paralel
4. **Technology Maturity:** NestJS lebih mature untuk enterprise

---

**© 2026 Trinity Asset Management System**  
*Production-Ready Enterprise Application*
