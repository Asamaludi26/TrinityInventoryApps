# 🔐 Trinity Inventory - Security Checklist

## 📋 Panduan Keamanan Komprehensif

Dokumentasi lengkap security checklist untuk Trinity Asset Management System. Panduan ini mencakup implementasi keamanan berdasarkan **OWASP Top 10 2021**, best practices industri, dan security hardening untuk NestJS + React production environment.

---

## 🏗️ Arsitektur Keamanan

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Security Layers                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   Nginx     │    │   Rate      │    │   CORS      │                  │
│  │   Headers   │ → │   Limiting  │ → │   Policy    │                   │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
│         │                                     │                          │
│         ▼                                     ▼                          │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │                    Backend (NestJS)                      │           │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │           │
│  │  │  JWT    │  │  Roles  │  │  Input  │  │   Helmet    │ │           │
│  │  │  Guard  │→│  Guard  │→│  Valid  │→│   Headers   │ │           │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────┘ │           │
│  └─────────────────────────────────────────────────────────┘           │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │                  Database (PostgreSQL)                   │           │
│  │  - Parameterized queries (Prisma)                       │           │
│  │  - Encrypted connections                                 │           │
│  │  - Soft deletes                                         │           │
│  └─────────────────────────────────────────────────────────┘           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔴 A. Authentication & Authorization

### A1. JWT Authentication

#### Implementation (NestJS)

```typescript
// backend/src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

#### Checklist

| Item               | Status | Description                          |
| ------------------ | ------ | ------------------------------------ |
| JWT Secret         | ✅     | Min 256-bit secret in environment    |
| Access Token       | ✅     | Short-lived (15 min recommended)     |
| Refresh Token      | ✅     | Long-lived (7 days), stored securely |
| Token Validation   | ✅     | Verified on every protected request  |
| Token Blacklisting | 🟡     | Implement for logout                 |

#### JWT Payload Structure

```typescript
// Safe JWT payload - no sensitive data
interface JwtPayload {
  sub: number; // User ID
  email: string;
  role: UserRole;
  divisionId: number;
  iat: number; // Issued at
  exp: number; // Expiration
}
```

### A2. Role-Based Access Control (RBAC)

#### Implementation

```typescript
// backend/src/modules/auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Super Admin bypass
    if (user.role === UserRole.SUPER_ADMIN) return true;

    return requiredRoles.includes(user.role);
  }
}
```

#### Usage in Controllers

```typescript
// Protecting endpoints with RBAC
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  findAll() {
    // Only SUPER_ADMIN and ADMIN_LOGISTIK can access
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param("id") id: number) {
    // Only SUPER_ADMIN can delete users
  }
}
```

#### Role Hierarchy

| Role           | Level | Access                                 |
| -------------- | ----- | -------------------------------------- |
| SUPER_ADMIN    | 1     | Full access to all features            |
| ADMIN_LOGISTIK | 2     | Manage assets, inventory, transactions |
| ADMIN_PURCHASE | 2     | Manage requests, procurement           |
| LEADER         | 3     | Approve requests, view reports         |
| STAFF          | 4     | Create requests, view own data         |
| TEKNISI        | 4     | Field operations, installations        |

#### Checklist

| Item                  | Status | Description                   |
| --------------------- | ------ | ----------------------------- |
| Roles Decorator       | ✅     | `@Roles()` decorator defined  |
| Roles Guard           | ✅     | `RolesGuard` checks user role |
| Super Admin Bypass    | ✅     | Super Admin has full access   |
| Default Deny          | ✅     | No role = no access           |
| Controller Protection | ✅     | Guards applied per endpoint   |

---

## 🟡 B. Input Validation & Sanitization

### B1. DTO Validation (class-validator)

#### Implementation

```typescript
// backend/src/modules/assets/dto/create-asset.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from "class-validator";

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsNumber()
  @Min(1)
  modelId: number;

  @IsEnum(AssetCondition)
  condition: AssetCondition;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;
}
```

### B2. Global Validation Pipe

```typescript
// backend/src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transform: true, // Auto-transform types
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### B3. Frontend Validation (Zod)

```typescript
// frontend/src/validation/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus mengandung huruf besar")
    .regex(/[0-9]/, "Harus mengandung angka"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN_LOGISTIK",
    "ADMIN_PURCHASE",
    "LEADER",
    "STAFF",
    "TEKNISI",
  ]),
});
```

#### Checklist

| Item                | Status | Description                |
| ------------------- | ------ | -------------------------- |
| DTO Validation      | ✅     | class-validator decorators |
| Whitelist Mode      | ✅     | Strip unknown properties   |
| Type Transformation | ✅     | Auto-convert types         |
| Frontend Validation | ✅     | Zod schemas                |
| Max Length Limits   | ✅     | Prevent excessive input    |

---

## 🟢 C. SQL Injection Prevention

### C1. Prisma ORM (Parameterized Queries)

```typescript
// ✅ SAFE: Prisma auto-escapes all values
const assets = await prisma.asset.findMany({
  where: {
    name: { contains: userInput }, // Auto-escaped
    status: AssetStatus.TERSEDIA,
  },
});

// ✅ SAFE: Raw SQL with parameterization
const result = await prisma.$queryRaw`
  SELECT * FROM "Asset" WHERE name = ${userInput}
`;

// ❌ UNSAFE: String interpolation (NEVER DO THIS)
// const result = await prisma.$queryRawUnsafe(
//   `SELECT * FROM Asset WHERE name = '${userInput}'`
// );
```

#### Checklist

| Item                  | Status | Description                            |
| --------------------- | ------ | -------------------------------------- |
| Use Prisma ORM        | ✅     | All queries via Prisma Client          |
| No Raw SQL            | ✅     | Avoid `$queryRawUnsafe`                |
| Parameterized Queries | ✅     | Use template literals with `$queryRaw` |

---

## 🔵 D. Security Headers

### D1. Helmet Configuration

```typescript
// backend/src/main.ts
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }),
);
```

### D2. Nginx Security Headers

```nginx
# frontend/nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

#### Headers Checklist

| Header                  | Status | Value                           |
| ----------------------- | ------ | ------------------------------- |
| X-Frame-Options         | ✅     | SAMEORIGIN                      |
| X-Content-Type-Options  | ✅     | nosniff                         |
| X-XSS-Protection        | ✅     | 1; mode=block                   |
| Referrer-Policy         | ✅     | strict-origin-when-cross-origin |
| HSTS                    | ✅     | max-age=31536000                |
| Content-Security-Policy | 🟡     | Configure for production        |

---

## 🟣 E. Rate Limiting

### E1. ThrottlerModule Configuration

```typescript
// backend/src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 100, // Max 100 requests per window
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### E2. Per-Endpoint Rate Limiting

```typescript
// Stricter limits for sensitive endpoints
@Controller("auth")
export class AuthController {
  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  login(@Body() loginDto: LoginDto) {
    // Login logic
  }

  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    // Password reset logic
  }
}
```

#### Rate Limiting Checklist

| Endpoint       | Limit | Window    |
| -------------- | ----- | --------- |
| General API    | 100   | 1 minute  |
| Login          | 5     | 1 minute  |
| Password Reset | 3     | 5 minutes |
| File Upload    | 10    | 1 minute  |

---

## 🔶 F. CORS Configuration

```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
});
```

#### CORS Checklist

| Item             | Status | Description                |
| ---------------- | ------ | -------------------------- |
| Origin Whitelist | ✅     | Only allowed origins       |
| Credentials      | ✅     | Allow cookies              |
| Methods          | ✅     | Restrict to needed methods |
| Headers          | ✅     | Restrict to needed headers |

---

## 🔷 G. Password Security

### G1. Bcrypt Hashing

```typescript
// backend/src/modules/auth/auth.service.ts
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### G2. Password Requirements

| Requirement        | Minimum      |
| ------------------ | ------------ |
| Length             | 8 characters |
| Uppercase          | 1 character  |
| Lowercase          | 1 character  |
| Numbers            | 1 digit      |
| Special Characters | Recommended  |

---

## 📝 H. Audit Logging

### H1. Activity Log Model

```prisma
// prisma/schema.prisma
model ActivityLog {
  id          Int       @id @default(autoincrement())
  userId      Int
  action      String    @db.VarChar(50)
  entityType  String    @db.VarChar(50)
  entityId    String?
  metadata    Json?
  ipAddress   String?   @db.VarChar(45)
  userAgent   String?
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt(sort: Desc)])
}
```

### H2. Logging Implementation

```typescript
// backend/src/common/services/activity-log.service.ts
@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId: number;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.prisma.activityLog.create({
      data: params,
    });
  }
}
```

#### What to Log

| Action           | Log | Details                      |
| ---------------- | --- | ---------------------------- |
| Login/Logout     | ✅  | User ID, IP, timestamp       |
| Create Asset     | ✅  | Asset ID, creator            |
| Update Asset     | ✅  | Asset ID, changes, editor    |
| Delete Asset     | ✅  | Asset ID, deleter            |
| Request Approval | ✅  | Request ID, approver, action |
| Role Change      | ✅  | User ID, old/new role        |

---

## 🛡️ I. Container Security

### I1. Non-Root User

```dockerfile
# backend/Dockerfile
# Create non-root user
RUN addgroup -g 1001 -S trinity && \
    adduser -S trinity -u 1001 -G trinity

# Switch to non-root
USER trinity
```

### I2. Security Best Practices

| Item                 | Status | Description                |
| -------------------- | ------ | -------------------------- |
| Non-root user        | ✅     | Containers run as non-root |
| Read-only filesystem | 🟡     | Where possible             |
| dumb-init            | ✅     | Proper signal handling     |
| Minimal base image   | ✅     | Alpine-based images        |
| No secrets in image  | ✅     | Use environment variables  |

---

## 📊 J. Security Checklist Summary

### Critical (Must Have)

- [x] JWT Authentication implemented
- [x] RBAC with RolesGuard
- [x] Input validation (class-validator + Zod)
- [x] SQL injection prevention (Prisma)
- [x] Password hashing (bcrypt)
- [x] Security headers (Helmet + Nginx)
- [x] Rate limiting (ThrottlerModule)
- [x] CORS configuration

### High Priority

- [x] Activity logging
- [x] Non-root containers
- [ ] Token blacklisting on logout
- [ ] Account lockout after failed attempts
- [ ] Password complexity requirements

### Recommended

- [ ] Two-factor authentication (2FA)
- [ ] API key rotation
- [ ] Security monitoring/alerting
- [ ] Penetration testing
- [ ] Security audit

---

## 🔧 Environment Variables

```bash
# .env.example - Security-related variables
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trinity

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Secret Generation

```bash
# Generate secure secrets
# JWT Secret (64 hex characters = 256 bits)
openssl rand -hex 32

# Database Password
openssl rand -base64 32
```

---

## 📋 Quick Security Audit Commands

```bash
# Check for vulnerable dependencies
cd backend && pnpm audit
cd frontend && pnpm audit

# Run security linting
pnpm lint

# Check TypeScript for type safety
pnpm typecheck

# Scan Docker images
docker scout quickview trinity-backend:latest
```

---

**© 2026 Trinity Asset Management System**
