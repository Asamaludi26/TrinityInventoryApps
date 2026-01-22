# 🔧 Backend Setup Guide - NestJS API Server

## 📋 Dokumentasi Lengkap Setup dan Konfigurasi Backend

Panduan komprehensif untuk setup, konfigurasi, dan pengembangan backend Trinity Asset Management menggunakan NestJS framework.

---

## 📊 Informasi Teknis

| Aspek               | Detail           |
| ------------------- | ---------------- |
| **Framework**       | NestJS 11.1.12   |
| **Language**        | TypeScript 5.9.3 |
| **ORM**             | Prisma 7.2.0     |
| **Database**        | PostgreSQL 16/17 |
| **Authentication**  | Passport + JWT   |
| **Package Manager** | pnpm 9.15.0      |
| **Node.js**         | >= 20.0.0 LTS    |
| **Port**            | 3001             |

---

## 🛠️ A. Prerequisites

### A1. Software Requirements

```bash
# Check Node.js version (minimum 20.x)
node --version
# Expected: v20.x.x or higher

# Check pnpm version (minimum 9.x)
pnpm --version
# Expected: 9.x.x or higher

# If pnpm not installed
npm install -g pnpm@latest

# Alternative: Enable via corepack (recommended)
corepack enable
corepack prepare pnpm@latest --activate
```

### A2. Recommended VS Code Extensions

```json
{
  "recommendations": [
    "prisma.prisma",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "humao.rest-client",
    "wayou.vscode-todo-highlight"
  ]
}
```

---

## 🚀 B. Initial Setup

### B1. Clone dan Navigate

```bash
# Navigate to backend directory
cd backend

# Verify structure
ls -la
# Expected files: package.json, prisma/, src/, tsconfig.json
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
cp .env.example .env

# Edit environment variables
# Windows
notepad .env
# macOS/Linux
nano .env
```

**File `.env` yang harus dikonfigurasi:**

```dotenv
# =============================================================================
# Trinity Backend Environment Configuration
# =============================================================================

# --- Application ---
NODE_ENV=development
PORT=3001
API_PREFIX=api

# --- Database (PostgreSQL) ---
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://trinity_admin:YOUR_STRONG_PASSWORD@localhost:5432/trinity_assetflow?schema=public"

# --- JWT Authentication ---
# IMPORTANT: Generate strong secrets for production!
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-64-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# --- CORS ---
CORS_ORIGIN=http://localhost:5173

# --- Rate Limiting ---
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
THROTTLE_LOGIN_LIMIT=5

# --- Security ---
BCRYPT_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# --- Logging ---
LOG_LEVEL=debug
```

### B4. Generate Prisma Client

```bash
# Generate Prisma Client dari schema
pnpm prisma:generate

# Output yang diharapkan:
# ✔ Generated Prisma Client to ./generated/prisma
```

### B5. Database Migration

```bash
# Jalankan database migrations
pnpm prisma:migrate

# Jika diminta nama migration, masukkan nama descriptive:
# → initial_schema
# → add_customer_table
# → update_asset_fields
```

### B6. (Optional) Seed Database

```bash
# Populate database dengan data awal
pnpm prisma:seed

# Atau reset dan seed ulang
pnpm prisma:reset
```

### B7. Start Development Server

```bash
# Start dengan hot reload
pnpm start:dev

# Output yang diharapkan:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [InstanceLoader] AppModule dependencies initialized
# [Nest] LOG [RoutesResolver] AuthController {/api/v1/auth}
# ...
# [Nest] LOG Application is running on: http://localhost:3001
```

---

## 📁 C. Project Structure

### C1. Directory Layout

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── migrations/            # Database migration files
│   └── seed.ts                # Database seeding script
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── common/                # Shared utilities
│   │   ├── constants/         # Application constants
│   │   ├── decorators/        # Custom decorators
│   │   ├── dto/               # Shared DTOs
│   │   ├── enums/             # Shared enums
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth guards
│   │   ├── interceptors/      # Request/Response interceptors
│   │   ├── pipes/             # Validation pipes
│   │   ├── prisma/            # Prisma service
│   │   ├── services/          # Shared services
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   └── modules/               # Feature modules
│       ├── auth/              # Authentication
│       ├── users/             # User management
│       ├── assets/            # Asset management
│       ├── requests/          # Request management
│       ├── loans/             # Loan management
│       ├── transactions/      # Transaction handling
│       ├── customers/         # Customer management
│       ├── categories/        # Category management
│       ├── dashboard/         # Dashboard statistics
│       ├── notifications/     # Notification system
│       ├── activity-logs/     # Activity logging
│       └── reports/           # Report generation
├── test/
│   ├── unit/                  # Unit tests
│   └── jest-e2e.json          # E2E test config
├── uploads/                   # File uploads directory
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── nest-cli.json              # NestJS CLI configuration
```

### C2. Module Structure Pattern

Setiap feature module mengikuti struktur yang konsisten:

```
modules/{feature}/
├── {feature}.module.ts        # Module definition
├── {feature}.controller.ts    # REST endpoints
├── {feature}.service.ts       # Business logic
└── dto/                       # Data Transfer Objects
    ├── create-{feature}.dto.ts
    ├── update-{feature}.dto.ts
    └── {feature}-response.dto.ts
```

---

## 🔐 D. Authentication & Authorization

### D1. JWT Configuration

Backend menggunakan dual-token strategy:

| Token Type    | TTL                         | Purpose            |
| ------------- | --------------------------- | ------------------ |
| Access Token  | 15m (production) / 7d (dev) | API authentication |
| Refresh Token | 30d                         | Token renewal      |

### D2. Auth Guards

```typescript
// Penggunaan di controller
import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards";
import { RolesGuard } from "../common/guards";
import { Roles } from "../common/decorators";

@Controller("assets")
@UseGuards(JwtAuthGuard, RolesGuard) // Protect entire controller
export class AssetsController {
  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_LOGISTIK") // Role-based access
  findAll() {
    return this.assetsService.findAll();
  }
}
```

### D3. Available Roles

```typescript
enum UserRole {
  SUPER_ADMIN = "Super Admin",
  ADMIN_LOGISTIK = "Admin Logistik",
  ADMIN_PURCHASE = "Admin Purchase",
  LEADER = "Leader",
  STAFF = "Staff",
}
```

### D4. Custom Decorators

```typescript
// Get current user
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// Public endpoint (no auth required)
@Public()
@Get('public-data')
getPublicData() {
  return { message: 'Public endpoint' };
}

// Role-based access
@Roles('SUPER_ADMIN')
@Get('admin-only')
getAdminData() {
  return { message: 'Admin only' };
}
```

---

## 📡 E. API Configuration

### E1. Global Prefix dan Versioning

```typescript
// main.ts configuration
app.setGlobalPrefix("api");
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: "1",
  prefix: "v",
});

// Resulting URL pattern: /api/v1/{resource}
// Example: GET /api/v1/assets
```

### E2. CORS Configuration

```typescript
app.enableCors({
  origin: isProduction ? corsOrigin.split(",") : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],
  exposedHeaders: ["X-Total-Count", "X-Page", "X-Limit"],
  maxAge: 86400, // 24 hours
});
```

### E3. Rate Limiting

```typescript
// Default throttle configuration
ThrottlerModule.forRoot({
  throttlers: [
    {
      name: "short",
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests per minute
    },
    {
      name: "long",
      ttl: 60000, // 1 minute
      limit: 1000, // 1000 requests per minute
    },
  ],
});
```

### E4. Swagger Documentation

Tersedia di development mode: `http://localhost:3001/api/docs`

```typescript
// Access Swagger UI
// URL: http://localhost:3001/api/docs
// JSON: http://localhost:3001/api/docs-json
```

---

## 🧪 F. Testing

### F1. Unit Testing

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run specific test file
pnpm test -- --testPathPattern=users.service
```

### F2. E2E Testing

```bash
# Run E2E tests
pnpm test:e2e

# Run with verbose output
pnpm test:e2e -- --verbose
```

### F3. Test File Structure

```
test/
├── unit/
│   ├── assets.service.spec.ts
│   ├── auth.service.spec.ts
│   ├── loans.service.spec.ts
│   └── users.service.spec.ts
├── app.e2e-spec.ts
├── jest-e2e.json
└── jest.setup.ts
```

### F4. Test Pattern Example

```typescript
// test/unit/users.service.spec.ts
describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
```

---

## 📦 G. Common Commands

### G1. Development Commands

```bash
# Start development server (with hot reload)
pnpm start:dev

# Start with debugging
pnpm start:debug

# Build for production
pnpm build

# Start production server
pnpm start:prod
```

### G2. Database Commands

```bash
# Generate Prisma Client
pnpm prisma:generate

# Create and apply migration
pnpm prisma:migrate

# Apply migrations to production
pnpm prisma:migrate:prod

# Push schema changes (no migration)
pnpm prisma:push

# Open Prisma Studio (GUI)
pnpm prisma:studio

# Seed database
pnpm prisma:seed

# Reset database (WARNING: deletes all data)
pnpm prisma:reset
```

### G3. Code Quality Commands

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# TypeScript type checking
pnpm typecheck
```

### G4. Testing Commands

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

---

## 🔧 H. Configuration Files

### H1. tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"],
      "@common/*": ["./src/common/*"],
      "@modules/*": ["./src/modules/*"]
    }
  }
}
```

### H2. nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": ["**/*.json"],
    "watchAssets": true
  }
}
```

### H3. jest.config.js

```javascript
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  roots: ["<rootDir>/src/", "<rootDir>/test/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@common/(.*)$": "<rootDir>/src/common/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  },
};
```

---

## 🔍 I. Troubleshooting

### I1. Common Issues

| Issue                                 | Cause                      | Solution                            |
| ------------------------------------- | -------------------------- | ----------------------------------- |
| `Cannot find module '@prisma/client'` | Prisma not generated       | Run `pnpm prisma:generate`          |
| `Database connection refused`         | PostgreSQL not running     | Start PostgreSQL container          |
| `Port 3001 already in use`            | Another process using port | Kill process or change PORT in .env |
| `JWT malformed`                       | Invalid token format       | Check token generation/validation   |
| `CORS error`                          | Origin not allowed         | Add origin to CORS_ORIGIN           |

### I2. Debug Mode

```bash
# Start with debug enabled
pnpm start:debug

# Attach VS Code debugger
# Use "Attach to NestJS" launch configuration
```

### I3. Check Application Health

```bash
# Health check endpoint
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-22T..."}
```

### I4. View Application Logs

```bash
# Development logs appear in terminal
pnpm start:dev

# Filter specific log levels
# Modify in main.ts:
# logger: ['error', 'warn', 'log', 'debug', 'verbose']
```

---

## 📚 J. Additional Resources

### J1. Related Documentation

- [Database Setup Guide](DATABASE_SETUP.md) - PostgreSQL & Prisma configuration
- [Docker Setup Guide](DOCKER_COMPLETE.md) - Containerization
- [Environment Configuration](ENVIRONMENT_CONFIG.md) - All environment variables
- [API Reference](../api.md) - Complete API documentation

### J2. External Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

**© 2026 Trinity Asset Management System**
