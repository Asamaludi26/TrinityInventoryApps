# Copilot Instructions - Trinity Asset Management

## Project Overview

**Trinity Asset Management** is a full-stack inventory/asset management system for PT. Triniti Media Indonesia. It tracks assets from procurement through installation at customer sites, loans, maintenance, and retirement.

**Architecture**: Decoupled client-server with React frontend (Vite) and NestJS backend (Prisma + PostgreSQL). Communication via REST API (`/api/v1/*`).

## Quick Commands

```bash
# Backend (from /backend)
pnpm install && pnpm prisma:generate && pnpm prisma:migrate
pnpm start:dev                # Development server (port 3001)
pnpm test                     # Unit tests (Jest)
pnpm test:e2e                 # E2E tests

# Frontend (from /frontend)
pnpm install && pnpm dev      # Dev server (port 5173)
pnpm test                     # Unit tests (Vitest)

# Docker (from root)
docker compose -f docker-compose.dev.yml up -d
```

## Key Architecture Patterns

### Backend Module Structure (NestJS)

Each feature module follows this pattern in `backend/src/modules/{feature}/`:

```
{feature}/
├── {feature}.module.ts      # Module definition
├── {feature}.controller.ts  # REST endpoints
├── {feature}.service.ts     # Business logic
└── dto/                     # Request/Response DTOs
```

**Document ID Generation**: Use `DocumentNumberService` from `common/services/document-number.service.ts` for all document IDs. Formats vary by type (e.g., `AST-2026-0001`, `RO-20260119-0001`).

**Pagination**: Extend `PaginationQueryDto` from `common/dto/pagination.dto.ts`. Use `createPaginatedResult()` helper for responses.

### Frontend Architecture

- **State Management**: Zustand stores in `frontend/src/stores/` (e.g., `useAuthStore`, `useAssetStore`)
- **Feature Modules**: `frontend/src/features/{feature}/` contains feature-specific components, hooks, types
- **Shared UI**: Atomic components in `frontend/src/components/ui/`
- **API Layer**: `frontend/src/services/api/` - modular API clients per domain

### User Roles & RBAC

Roles: `SUPER_ADMIN`, `ADMIN_LOGISTIK`, `ADMIN_PURCHASE`, `LEADER`, `STAFF`, `TEKNISI`

Use decorators for access control:

```typescript
@Roles('SUPER_ADMIN', 'ADMIN_LOGISTIK')
@UseGuards(JwtAuthGuard, RolesGuard)
```

Frontend permission checks: `frontend/src/utils/permissions.ts`

## Naming Conventions

| Type             | Format                     | Example                   |
| ---------------- | -------------------------- | ------------------------- |
| Components       | PascalCase                 | `RegistrationForm.tsx`    |
| Hooks            | camelCase + `use` prefix   | `useAssetCalculations.ts` |
| Interfaces/Types | PascalCase (NO `I` prefix) | `AssetTransaction`        |
| Booleans         | `is/has/should/can` prefix | `isVisible`, `hasError`   |
| Constants        | UPPER_SNAKE_CASE           | `MAX_UPLOAD_SIZE`         |

## Database & Prisma

- Schema: `backend/prisma/schema.prisma`
- Soft deletes: Most models have `deletedAt DateTime?` field
- Key enums: `UserRole`, `AssetStatus`, `AssetCondition`, `RequestStatus`

**Never use raw SQL** - use Prisma Client. For complex queries, use `$queryRaw` with parameterized queries.

## Error Handling

**Backend**: Use NestJS exceptions (`NotFoundException`, `BadRequestException`). Global `AllExceptionsFilter` standardizes responses.

**Response format**:

```json
{ "success": false, "statusCode": 400, "message": "...", "error": "BadRequest" }
```

**Frontend**: API errors are caught in `ApiClient` and can trigger `useNotificationStore` toasts.

## Testing Patterns

**Backend unit tests**: Mock `PrismaService` using Jest

```typescript
const mockPrismaService = { asset: { findMany: jest.fn() } };
```

**Frontend tests**: Use React Testing Library with `data-testid` attributes

## Documentation Requirements

When making changes:

1. Update `Docs/CHANGELOG/CHANGELOG.md` for significant changes
2. Document errors in `Docs/ErrorHandling/{area}/`
3. Session updates go in `Docs/Develop/{backend|frontend}/YYYY-MM-DD_*.md`

## Key Files Reference

| Purpose          | Location                                                 |
| ---------------- | -------------------------------------------------------- |
| Prisma Schema    | `backend/prisma/schema.prisma`                           |
| App Module       | `backend/src/app.module.ts`                              |
| Document IDs     | `backend/src/common/services/document-number.service.ts` |
| Pagination DTOs  | `backend/src/common/dto/pagination.dto.ts`               |
| Auth decorators  | `backend/src/common/decorators/`                         |
| Zustand stores   | `frontend/src/stores/`                                   |
| API clients      | `frontend/src/services/api/`                             |
| Type definitions | `frontend/src/types/`                                    |
| Feature modules  | `frontend/src/features/`                                 |

## Indonesian Context

- UI labels and error messages are in **Indonesian (Bahasa Indonesia)**
- Code comments and variable names remain in **English**
- Date formatting uses Indonesian locale (`date-fns` with `id` locale)
