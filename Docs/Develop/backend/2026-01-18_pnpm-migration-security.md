# Backend pnpm Migration & Security Enhancement

**Tanggal**: 2026-01-18
**Sesi**: Migrasi Package Manager dan Penambahan Security Features
**Author**: Agent

## 📝 Ringkasan

Sesi ini melakukan migrasi package manager dari npm ke pnpm, menambahkan struktur clean architecture untuk common utilities, dan mengimplementasikan security features standar industri.

## 🔄 Perubahan

### File Baru

#### Configuration Files

- `backend/.npmrc` - Konfigurasi pnpm (engine-strict, auto-install-peers)
- `backend/.prettierrc` - Prettier formatting rules
- `backend/.prettierignore` - File yang diabaikan Prettier
- `backend/.gitignore` - Git ignore rules
- `backend/pnpm-workspace.yaml` - pnpm workspace configuration
- `backend/eslint.config.mjs` - ESLint flat config
- `backend/jest.config.js` - Jest unit test configuration
- `backend/docker-compose.dev.yml` - Docker Compose untuk development

#### Common Infrastructure

- `backend/src/common/index.ts` - Barrel export untuk common module
- `backend/src/common/constants/app.constants.ts` - Application constants
- `backend/src/common/constants/index.ts` - Constants barrel export

#### Decorators

- `backend/src/common/decorators/public.decorator.ts` - @Public() untuk bypass JWT
- `backend/src/common/decorators/roles.decorator.ts` - @Roles() untuk role-based access
- `backend/src/common/decorators/permissions.decorator.ts` - @RequirePermissions() untuk granular permissions
- `backend/src/common/decorators/current-user.decorator.ts` - @CurrentUser() untuk extract user dari request
- `backend/src/common/decorators/auth.decorator.ts` - Composite decorators (@Auth, @AuthPermissions)
- `backend/src/common/decorators/swagger.decorator.ts` - Swagger helper decorators
- `backend/src/common/decorators/index.ts` - Decorators barrel export

#### Guards

- `backend/src/common/guards/roles.guard.ts` - Role-based access control guard
- `backend/src/common/guards/permissions.guard.ts` - Permission-based access control guard
- `backend/src/common/guards/index.ts` - Guards barrel export

#### Filters

- `backend/src/common/filters/all-exceptions.filter.ts` - Global exception filter dengan Prisma error handling
- `backend/src/common/filters/index.ts` - Filters barrel export

#### Interceptors

- `backend/src/common/interceptors/logging.interceptor.ts` - Request/response logging
- `backend/src/common/interceptors/transform.interceptor.ts` - Response wrapper untuk consistent format
- `backend/src/common/interceptors/timeout.interceptor.ts` - Request timeout handler (30s default)
- `backend/src/common/interceptors/index.ts` - Interceptors barrel export

#### Pipes

- `backend/src/common/pipes/parse-id.pipe.ts` - ID parameter validation (numeric & custom format)
- `backend/src/common/pipes/trim-string.pipe.ts` - Auto-trim whitespace dari input
- `backend/src/common/pipes/zod-validation.pipe.ts` - Zod schema validation alternative
- `backend/src/common/pipes/index.ts` - Pipes barrel export

#### DTOs

- `backend/src/common/dto/pagination.dto.ts` - Reusable pagination DTO & helpers
- `backend/src/common/dto/filter.dto.ts` - Common filter DTOs
- `backend/src/common/dto/index.ts` - DTOs barrel export

#### Utilities

- `backend/src/common/utils/generators.util.ts` - Secure random string & document number generators
- `backend/src/common/utils/date.util.ts` - Date formatting utilities (Indonesian locale)
- `backend/src/common/utils/helpers.util.ts` - General helper functions (sanitize, mask, clone)
- `backend/src/common/utils/index.ts` - Utils barrel export

#### Testing

- `backend/test/app.e2e-spec.ts` - E2E test for health endpoints
- `backend/test/jest-e2e.json` - E2E test configuration
- `backend/src/modules/auth/auth.service.spec.ts` - Unit test for AuthService

#### Documentation

- `backend/README.md` - Comprehensive backend documentation

#### Uploads

- `backend/uploads/.gitignore` - Keep uploads folder but ignore contents

### File Dimodifikasi

- `backend/package.json` - Migrasi ke pnpm, tambah scripts & dependencies baru
- `backend/tsconfig.json` - Strict mode, path aliases, ES2022 target
- `backend/src/main.ts` - Security middleware (helmet, compression), Swagger, global pipes/filters/interceptors
- `backend/src/app.module.ts` - ThrottlerModule untuk rate limiting
- `backend/src/common/health/health.controller.ts` - Enhanced health check dengan memory stats
- `backend/.env.example` - Expanded environment variables

## 📦 Dependencies

### Ditambahkan

| Package                  | Version  | Alasan                 |
| ------------------------ | -------- | ---------------------- |
| `@nestjs/swagger`        | ^11.2.0  | API Documentation      |
| `@nestjs/throttler`      | ^6.4.0   | Rate Limiting          |
| `helmet`                 | ^8.1.0   | Security Headers       |
| `compression`            | ^1.8.0   | Response Compression   |
| `zod`                    | ^3.25.76 | Alternative Validation |
| `date-fns`               | ^4.1.0   | Date Utilities         |
| `@types/compression`     | ^1.7.5   | TypeScript types       |
| `eslint-config-prettier` | ^10.1.0  | ESLint + Prettier      |
| `eslint-plugin-prettier` | ^5.2.0   | Prettier ESLint plugin |
| `prettier`               | ^3.5.0   | Code Formatter         |
| `supertest`              | ^7.0.0   | E2E Testing            |
| `tsx`                    | ^4.20.0  | TypeScript execution   |
| `source-map-support`     | ^0.5.21  | Debug support          |

### Dihapus

- `ts-node` - Diganti dengan `tsx` untuk performa lebih baik

## ⚙️ Konfigurasi

### Package Manager Migration (npm → pnpm)

```bash
# Hapus npm artifacts
rm -rf node_modules package-lock.json

# Install dengan pnpm
pnpm install
```

### New Scripts

```json
{
  "lint:fix": "eslint ... --fix",
  "typecheck": "tsc --noEmit",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "prisma:migrate:prod": "prisma migrate deploy",
  "prisma:seed": "tsx prisma/seed.ts",
  "db:setup": "pnpm prisma:generate && pnpm prisma:migrate",
  "preinstall": "npx only-allow pnpm"
}
```

### TypeScript Paths

```json
{
  "@/*": ["src/*"],
  "@common/*": ["src/common/*"],
  "@modules/*": ["src/modules/*"]
}
```

### Security Configuration

- Helmet enabled dengan CSP disabled untuk development
- Rate limiting: 100 req/min general, 5 req/min login
- CORS: Configurable origins, credentials enabled
- Request timeout: 30 seconds

## 🔒 Security Features Implemented

1. **Helmet** - Security headers (XSS, Content-Type sniffing, etc.)
2. **Rate Limiting** - Brute force protection via ThrottlerGuard
3. **CORS** - Configurable cross-origin policy
4. **Input Validation** - ValidationPipe dengan whitelist & forbidNonWhitelisted
5. **Response Sanitization** - TransformInterceptor untuk consistent format
6. **Error Masking** - AllExceptionsFilter untuk hide internal errors
7. **RBAC** - Role & Permission guards implemented

## 🧪 Testing

```bash
# TypeScript check
pnpm typecheck  # ✅ Pass

# Build
pnpm build      # ✅ Pass

# Dependencies installed
pnpm install    # ✅ 799 packages
```

## 📌 Catatan

1. **Swagger Documentation** tersedia di `/api/docs` (development only)
2. **Health Endpoints** baru:
   - `GET /api/health` - Full health check dengan memory stats
   - `GET /api/health/ready` - Kubernetes readiness probe
   - `GET /api/health/live` - Kubernetes liveness probe
3. **Path Aliases** dapat digunakan dalam import:
   ```typescript
   import { Public } from "@common/decorators";
   import { PrismaService } from "@common/prisma/prisma.service";
   ```
4. **Pagination Helper** tersedia:
   ```typescript
   import { createPaginatedResult, calculateSkip } from "@common/dto";
   ```

## 🔗 File Terkait

- [Backend README](../../../backend/README.md)
- [Package.json](../../../backend/package.json)
- [tsconfig.json](../../../backend/tsconfig.json)
