# Backend Changelog

All notable changes to the Trinity Inventory Backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### 🎉 Initial Release - Backend Implementation

This release marks the first complete implementation of the Trinity Inventory Management System backend, built with NestJS and Prisma ORM.

### Added

#### Core Infrastructure

- **NestJS Framework Setup**
  - Bootstrap configuration with CORS, ValidationPipe, and global prefix `/api`
  - Environment-based configuration using `@nestjs/config`
  - Health check endpoint at `/api/health`

- **Prisma ORM Integration (v7.2.0)**
  - PostgreSQL database adapter using `@prisma/adapter-pg`
  - Comprehensive schema with 20+ models
  - Soft delete support via `deletedAt` column pattern
  - Global PrismaModule for dependency injection

- **Database Schema** (aligned with `DATABASE_SCHEMA.md`)
  - User Management: `Division`, `User` with role-based enums
  - Asset Master Data: `AssetCategory`, `AssetType`, `AssetModel` hierarchy
  - Asset Inventory: `Asset` with status tracking, bulk material support
  - Request System: `Request`, `RequestItem` with approval workflow
  - Loan System: `LoanRequest`, `AssetReturn` with batch processing
  - Transaction Records: `Handover`, `Installation`, `Dismantle`, `Maintenance`
  - Customer Management: `Customer` with status tracking
  - Audit Trail: `StockMovement`, `ActivityLog`, `Notification`

#### Authentication Module (`/api/auth`)

- JWT-based authentication with Passport.js
- `POST /login` - User login with email/password
- `POST /register` - User registration
- `GET /me` - Get current user profile
- `POST /verify` - Token verification
- `POST /request-password-reset` - Password reset request
- Guards: `JwtAuthGuard`, `RolesGuard`
- Decorators: `@Roles()`, `@CurrentUser()`

#### Users Module (`/api/users`, `/api/divisions`)

- Full CRUD for users and divisions
- Role-based access control (SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE, TEKNISI, STAFF)
- Password hashing with bcrypt (10 rounds)
- Soft delete support
- Division assignment for users

#### Assets Module (`/api/assets`)

- Full CRUD for asset management
- `POST /bulk` - Bulk asset creation
- `POST /consume` - Stock consumption for bulk materials (from `BACKEND_GUIDE.md`)
- `GET /check-availability` - Stock availability checking
- `GET /stock-summary` - Stock summary by model
- Support for both individual assets and bulk materials

#### Requests Module (`/api/requests`)

- Request creation with automatic stock validation (from `BACKEND_GUIDE.md` Section 6.6)
- Multi-item requests with quantity tracking
- `PATCH /:id/approve` - Partial approval support with item adjustments
- `PATCH /:id/reject` - Request rejection with reason
- `POST /:id/register-assets` - Asset registration from approved requests (atomic transaction)
- Status workflow: PENDING → LOGISTIC_APPROVED → PURCHASE_APPROVED → ARRIVED → COMPLETED

#### Loans Module (`/api/loan-requests`, `/api/returns`)

- Loan request creation and tracking
- `PATCH /loan-requests/:id/approve` - Loan approval
- `PATCH /loan-requests/:id/reject` - Loan rejection
- `POST /returns` - Return initiation
- `PATCH /returns/:id/process` - Batch return processing with transactions (from `BACKEND_GUIDE.md` Section 6.7)
- Asset condition tracking on return

#### Transactions Module (`/api/transactions`)

- **Handovers** (`/handovers`) - Asset handover to technicians
  - JSONB storage for flexible item data
  - Status tracking: DRAFT → FINALIZED
- **Installations** (`/installations`) - Customer installation records
  - Customer asset tracking
  - Asset status updates on installation
- **Dismantles** (`/dismantles`) - Asset dismantle from customers
  - Complete workflow with technician assignment
- **Maintenances** (`/maintenances`) - Asset maintenance records
  - Work type and cost tracking

#### Customers Module (`/api/customers`)

- Full CRUD for customer management
- `GET /:id/assets` - Get customer's installed assets
- Status tracking: ACTIVE, INACTIVE, PROSPECT, SUSPENDED

#### Categories Module (`/api/categories`)

- Three-tier hierarchy management:
  - **Categories** (`/categories`) - Top-level grouping
  - **Types** (`/categories/types`) - Classification (ASSET, MATERIAL, TOOL) with tracking method
  - **Models** (`/categories/models`) - Specific models with bulk configuration

### Technical Decisions

1. **Prisma 7 Compatibility**
   - Migrated to adapter-based configuration (`@prisma/adapter-pg`)
   - Removed deprecated `url` from datasource
   - Created `prisma.config.ts` for schema configuration

2. **JWT Configuration**
   - Changed from string-based expiry to numeric seconds (`JWT_EXPIRES_IN_SECONDS`)
   - Compatible with `@nestjs/jwt` v10+ type requirements

3. **DTO Validation**
   - Used `@nestjs/mapped-types` for `PartialType` inheritance
   - Added explicit optional `password` field to `UpdateUserDto`

4. **Request Update Logic**
   - Implemented proper Prisma nested write syntax for items update
   - Delete-and-recreate pattern for request items

### Database Seed Data

Initial seed includes:

- 4 Divisions (Network Engineering, IT Support, NOC, Field Technician)
- 5 Users with different roles (admin@trinity.id / password123)
- 3 Asset Categories (Perangkat Jaringan, Peralatan Kantor, Material Jaringan)
- 3 Asset Types with classifications
- 3 Asset Models (Router, ONU, Kabel Fiber)
- 3 Sample Assets
- 2 Sample Customers

### Dependencies

#### Production

- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` ^10.0.0
- `@nestjs/jwt` ^10.2.0
- `@nestjs/passport` ^10.0.3
- `@nestjs/config` ^3.2.0
- `@prisma/client` ^7.2.0
- `@prisma/adapter-pg` ^7.2.0
- `passport`, `passport-jwt`, `passport-local`
- `class-validator` ^0.14.0
- `class-transformer` ^0.5.1
- `bcrypt` ^5.1.1

#### Development

- `prisma` ^7.2.0
- `@types/pg`, `@types/bcrypt`, `@types/passport-jwt`
- `@nestjs/cli` ^10.0.0
- TypeScript ^5.1.0

### Problems Resolved

1. **Prisma 7 Breaking Changes**
   - Error: "The datasource property `url` is no longer supported in schema files"
   - Solution: Migrated to `prisma.config.ts` with adapter pattern

2. **Missing Type Declarations**
   - Error: "Could not find a declaration file for module 'pg'"
   - Solution: Installed `@types/pg` as devDependency

3. **@nestjs/mapped-types Not Found**
   - Error: "Cannot find module '@nestjs/mapped-types'"
   - Solution: Installed package as devDependency

4. **JWT SignOptions Type Mismatch**
   - Error: "Type 'string' is not assignable to type 'number | StringValue | undefined'"
   - Solution: Changed to numeric seconds configuration

5. **UpdateUserDto Password Property Missing**
   - Error: "Property 'password' does not exist on type 'UpdateUserDto'"
   - Solution: Added explicit optional password field with validation

6. **RequestStatus Include Type Error**
   - Error: Array.includes type narrowing issue
   - Solution: Extracted to typed array before includes check

7. **Prisma Nested Update Type Mismatch**
   - Error: "Type 'RequestItemDto[]' has no properties in common with type 'RequestItemUpdateManyWithoutRequestNestedInput'"
   - Solution: Implemented delete-and-recreate pattern for items

---

## Roadmap

### [1.1.0] - Planned

- [ ] Unit tests for all services
- [ ] E2E tests for API endpoints
- [ ] Swagger/OpenAPI documentation
- [ ] Rate limiting
- [ ] Request logging middleware

### [1.2.0] - Planned

- [ ] WebSocket notifications
- [ ] File upload for documents/images
- [ ] Report generation (PDF/Excel)
- [ ] Dashboard statistics endpoints
