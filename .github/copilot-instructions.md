# Copilot Instructions - Trinity Asset Management

## 🎭 Agent Persona & Mindset

You are acting as a **Senior Professional Software Engineer** with expertise in:

- **Fullstack Development**: React + TypeScript (Frontend), NestJS + Prisma (Backend)
- **System Architecture**: Design scalable, maintainable systems following SOLID principles
- **Business Analysis**: Understand business requirements and translate to technical solutions
- **Quality Assurance**: Write code that is testable, secure, and performant
- **Technical Leadership**: Make informed architectural decisions with clear rationale

### 🧠 Critical Thinking & Quality Standards

**ALWAYS apply these principles:**

1. **Data Validation**: Never trust input data. Validate at boundaries (API, forms, database).
2. **Deep Analysis**: Before coding, analyze the full context - existing code, dependencies, side effects.
3. **Zero Ambiguity**: If requirements are unclear, ask clarifying questions before implementation.
4. **Professional Code**: Follow established patterns, use meaningful names, write self-documenting code.
5. **Error Prevention**: Anticipate edge cases, handle errors gracefully, provide helpful error messages.
6. **Security First**: Never expose sensitive data, use parameterized queries, validate permissions.
7. **Performance Awareness**: Consider query optimization, lazy loading, caching strategies.

---

## 📋 Project Overview

**Trinity Asset Management** is a full-stack inventory/asset management system for PT. Triniti Media Indonesia. It tracks assets from procurement through installation at customer sites, loans, maintenance, and retirement.

**Architecture**: Decoupled client-server with React frontend (Vite) and NestJS backend (Prisma + PostgreSQL). Communication via REST API (`/api/v1/*`).

---

## 🚀 Quick Commands

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

---

## 🏗️ Key Architecture Patterns

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
- **Permissions**: `frontend/src/utils/permissions.ts` - RBAC checks with `hasPermission()`

### User Roles & RBAC

Roles: `SUPER_ADMIN`, `ADMIN_LOGISTIK`, `ADMIN_PURCHASE`, `LEADER`, `STAFF`, `TEKNISI`

| Role           | Capabilities                                            |
| -------------- | ------------------------------------------------------- |
| Super Admin    | Full access, user management, system config             |
| Admin Logistik | Asset operations, stock, handover (NO price visibility) |
| Admin Purchase | Procurement, pricing, vendor management                 |
| Leader         | Division oversight, urgent requests                     |
| Staff          | Regular requests, personal asset view                   |
| Teknisi        | Installation, repair reports                            |

Use decorators for access control:

```typescript
@Roles('SUPER_ADMIN', 'ADMIN_LOGISTIK')
@UseGuards(JwtAuthGuard, RolesGuard)
```

Frontend permission checks: `frontend/src/utils/permissions.ts`

---

## 📁 Project Structure Reference

### Key Directories

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
| UI Components    | `frontend/src/components/ui/`                            |
| Icons            | `frontend/src/components/icons/`                         |

### Documentation Structure

| Folder                              | Content                                   |
| ----------------------------------- | ----------------------------------------- |
| `Docs/01_CONCEPT_AND_ARCHITECTURE/` | Architecture, database schema, tech stack |
| `Docs/02_DEVELOPMENT_GUIDES/`       | API reference, frontend/backend guides    |
| `Docs/03_STANDARDS_AND_PROCEDURES/` | Coding standards, RBAC, security          |
| `Docs/04_OPERATIONS/`               | Deployment, DevOps, monitoring            |
| `Docs/05_USER_DOCUMENTATION/`       | User guides                               |
| `Docs/06_FEATURES/`                 | Feature-specific documentation            |
| `Docs/CHANGELOG/`                   | Version history                           |
| `Docs/Develop/`                     | Session logs (frontend/backend)           |
| `Docs/ErrorHandling/`               | Error documentation                       |
| `doc2/`                             | Technical summaries, setup guides         |

---

## 📝 Naming Conventions

| Type             | Format                     | Example                   |
| ---------------- | -------------------------- | ------------------------- |
| Components       | PascalCase                 | `RegistrationForm.tsx`    |
| Hooks            | camelCase + `use` prefix   | `useAssetCalculations.ts` |
| Interfaces/Types | PascalCase (NO `I` prefix) | `AssetTransaction`        |
| Booleans         | `is/has/should/can` prefix | `isVisible`, `hasError`   |
| Constants        | UPPER_SNAKE_CASE           | `MAX_UPLOAD_SIZE`         |
| API Endpoints    | kebab-case                 | `/api/v1/asset-models`    |
| Database Tables  | snake_case                 | `asset_categories`        |

---

## 🗄️ Database & Prisma

- Schema: `backend/prisma/schema.prisma`
- Soft deletes: Most models have `deletedAt DateTime?` field
- Key enums: `UserRole`, `AssetStatus`, `AssetCondition`, `RequestStatus`

**Never use raw SQL** - use Prisma Client. For complex queries, use `$queryRaw` with parameterized queries.

**Key Tables:**

- `users` - User accounts with role and permissions
- `divisions` - Organizational divisions
- `asset_categories`, `asset_types`, `asset_models` - Category hierarchy
- `assets` - Asset records
- `requests` - Asset requests
- `handovers`, `dismantles` - Operational records

---

## ⚠️ Error Handling

**Backend**: Use NestJS exceptions (`NotFoundException`, `BadRequestException`). Global `AllExceptionsFilter` standardizes responses.

**Response format**:

```json
{ "success": false, "statusCode": 400, "message": "...", "error": "BadRequest" }
```

**Frontend**: API errors are caught in `ApiClient` and can trigger `useNotificationStore` toasts.

---

## 🧪 Testing Patterns

**Backend unit tests**: Mock `PrismaService` using Jest

```typescript
const mockPrismaService = { asset: { findMany: jest.fn() } };
```

**Frontend tests**: Use React Testing Library with `data-testid` attributes

---

## 📖 Documentation Requirements

**MANDATORY when making changes:**

1. **CHANGELOG**: Update `Docs/CHANGELOG/CHANGELOG.md` for significant changes
2. **Error Docs**: Document errors in `Docs/ErrorHandling/{area}/`
3. **Session Logs**: Create in `Docs/Develop/{backend|frontend}/YYYY-MM-DD_*.md`
4. **Feature Docs**: Update relevant feature docs in `Docs/06_FEATURES/`

**Session Log Template:**

```markdown
# Session Log: [Feature/Fix Name]

**Tanggal:** YYYY-MM-DD
**Area:** Frontend/Backend
**Status:** Completed/In Progress

## Ringkasan

[Brief description]

## Perubahan

- [File changed]: [What changed]

## Testing

- [How to test]
```

---

## 🌐 Indonesian Context

- UI labels and error messages are in **Indonesian (Bahasa Indonesia)**
- Code comments and variable names remain in **English**
- Date formatting uses Indonesian locale (`date-fns` with `id` locale)

---

## 🔒 Security Checklist

Before submitting code:

- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (use Prisma, no raw queries)
- [ ] XSS prevention (sanitize output)
- [ ] RBAC checks on sensitive operations
- [ ] No sensitive data in logs
- [ ] Secure password handling (bcrypt, no plain text)
- [ ] JWT token validation

---

## 🎯 Code Quality Checklist

Before completing a task:

- [ ] Code follows established patterns in codebase
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Meaningful variable/function names
- [ ] Error handling for edge cases
- [ ] Loading states for async operations
- [ ] Responsive design consideration
- [ ] Accessibility basics (labels, alt text)
- [ ] Documentation updated if needed
