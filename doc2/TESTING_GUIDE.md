# 🧪 Trinity Inventory - Testing Guide

## 📋 Panduan Testing Komprehensif

Dokumentasi lengkap strategi dan implementasi testing untuk Trinity Asset Management System. Panduan ini mencakup testing untuk backend (NestJS + Jest) dan frontend (React + Vitest).

---

## 🎯 Testing Strategy Overview

### Testing Pyramid

```
                    ┌───────────────┐
                    │     E2E       │  5%   - Critical user flows
                    │   (Cypress)   │       - Slow but comprehensive
                    ├───────────────┤
                    │  Integration  │  15%  - API + Database
                    │  (Supertest)  │       - Real service interaction
                    ├───────────────┤
                    │    Unit       │  80%  - Utils, services, components
                    │ (Jest/Vitest) │       - Fast & isolated
                    └───────────────┘
```

### Coverage Targets

| Layer              | Backend | Frontend | Priority    |
| ------------------ | ------- | -------- | ----------- |
| Services           | 80%     | N/A      | 🔴 Critical |
| Controllers        | 70%     | N/A      | 🔴 Critical |
| Utils/Helpers      | 90%     | 90%      | 🔴 Critical |
| Hooks              | N/A     | 80%      | 🔴 Critical |
| Components         | N/A     | 70%      | 🟡 Medium   |
| Validation Schemas | 90%     | 90%      | 🔴 Critical |

---

## 🏗️ Backend Testing (NestJS + Jest)

### Test Structure

```
backend/
├── test/
│   ├── jest.setup.ts           # Global test setup
│   ├── jest-e2e.json           # E2E test config
│   ├── app.e2e-spec.ts         # E2E tests
│   └── unit/
│       ├── auth.service.spec.ts
│       ├── assets.service.spec.ts
│       ├── loans.service.spec.ts
│       ├── users.service.spec.ts
│       └── common/
│           ├── document-number.service.spec.ts
│           └── query.types.spec.ts
└── jest.config.js
```

### Jest Configuration

#### File: `backend/jest.config.js`

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@common/(.*)$": "<rootDir>/src/common/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    ".module.ts",
    ".dto.ts",
    ".entity.ts",
    "main.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- assets.service.spec.ts
```

### Unit Test Examples

#### Service Test Pattern

```typescript
// test/unit/assets.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { AssetsService } from "../../src/modules/assets/assets.service";
import { PrismaService } from "../../src/common/prisma/prisma.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AssetStatus } from "@prisma/client";

describe("AssetsService", () => {
  let service: AssetsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockAsset = {
    id: "AST-2025-0001",
    name: "Router",
    brand: "Mikrotik",
    modelId: 1,
    serialNumber: "SN12345",
    status: AssetStatus.IN_STORAGE,
    condition: "GOOD",
    quantity: 1,
    location: "Gudang A",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: {
            asset: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            stockMovement: {
              create: jest.fn(),
            },
            activityLog: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    it("should return an asset if found", async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      const result = await service.findOne("AST-2025-0001");

      expect(result).toEqual(mockAsset);
      expect(prisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: "AST-2025-0001", deletedAt: null },
        include: expect.any(Object),
      });
    });

    it("should throw NotFoundException if asset not found", async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne("NOT-EXIST")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create an asset with auto-generated ID", async () => {
      (prisma.asset.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.asset.create as jest.Mock).mockResolvedValue(mockAsset);
      (prisma.stockMovement.create as jest.Mock).mockResolvedValue({});

      const dto = {
        name: "Router",
        brand: "Mikrotik",
        modelId: 1,
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockAsset);
      expect(prisma.asset.create).toHaveBeenCalled();
    });
  });
});
```

#### Auth Service Test

```typescript
// test/unit/auth.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../src/modules/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../src/common/prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 1,
    email: "test@example.com",
    password: "$2b$10$hashedpassword",
    name: "Test User",
    role: "STAFF",
    isActive: true,
    divisionId: 1,
    division: { id: 1, name: "IT" },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe("validateUser", () => {
    it("should return user data for valid credentials", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      const result = await service.validateUser("test@example.com", "password");

      expect(result).toEqual(
        expect.objectContaining({ email: "test@example.com" }),
      );
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      await expect(
        service.validateUser("test@example.com", "wrong-password"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.validateUser("test@example.com", "password"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("login", () => {
    it("should return access and refresh tokens", async () => {
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce("access-token")
        .mockResolvedValueOnce("refresh-token");

      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: expect.any(Object),
      });
    });
  });
});
```

#### Document Number Service Test

```typescript
// test/unit/common/document-number.service.spec.ts
import { DocumentNumberService } from "../../../src/common/services/document-number.service";

describe("DocumentNumberService", () => {
  let service: DocumentNumberService;

  beforeEach(() => {
    service = new DocumentNumberService();
  });

  describe("generateAssetId", () => {
    it("should generate asset ID with correct format", () => {
      const year = new Date().getFullYear();
      const result = service.generateAssetId(1);

      expect(result).toMatch(/^AST-\d{4}-\d{4}$/);
      expect(result).toContain(`AST-${year}`);
    });

    it("should pad sequence number to 4 digits", () => {
      const result = service.generateAssetId(1);
      expect(result).toContain("-0001");
    });
  });

  describe("generateRequestNumber", () => {
    it("should generate request number with correct format", () => {
      const result = service.generateRequestNumber(1);

      expect(result).toMatch(/^RO-\d{8}-\d{4}$/);
    });
  });
});
```

---

## 🎨 Frontend Testing (React + Vitest)

### Test Structure

```
frontend/
├── src/
│   ├── utils/
│   │   ├── dateFormatter.ts
│   │   ├── dateFormatter.test.ts    # Co-located test
│   │   ├── cn.ts
│   │   └── cn.test.ts
│   └── validation/
│       └── schemas/
│           ├── auth.schema.ts
│           ├── auth.schema.test.ts
│           ├── user.schema.ts
│           └── user.schema.test.ts
├── vitest.config.ts (or in vite.config.ts)
└── package.json
```

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run with UI
pnpm vitest --ui
```

### Unit Test Examples

#### Utility Function Test

```typescript
// src/utils/dateFormatter.test.ts
import { describe, it, expect } from "vitest";
import { toYYYYMMDD } from "./dateFormatter";

describe("dateFormatter", () => {
  describe("toYYYYMMDD", () => {
    it("should format date correctly", () => {
      const date = new Date(2026, 0, 19); // January 19, 2026
      expect(toYYYYMMDD(date)).toBe("2026-01-19");
    });

    it("should pad single digit months", () => {
      const date = new Date(2026, 0, 5);
      expect(toYYYYMMDD(date)).toBe("2026-01-05");
    });

    it("should pad single digit days", () => {
      const date = new Date(2026, 8, 3); // September 3, 2026
      expect(toYYYYMMDD(date)).toBe("2026-09-03");
    });

    it("should return empty string for null", () => {
      expect(toYYYYMMDD(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(toYYYYMMDD(undefined)).toBe("");
    });

    it("should handle leap year dates", () => {
      const date = new Date(2024, 1, 29); // February 29, 2024
      expect(toYYYYMMDD(date)).toBe("2024-02-29");
    });
  });
});
```

#### Validation Schema Test

```typescript
// src/validation/schemas/auth.schema.test.ts
import { describe, it, expect } from "vitest";
import { loginSchema } from "./auth.schema";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "user@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "user@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidData = {
        email: "user@example.com",
        password: "12345", // Less than 6 characters
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
```

#### Component Test

```typescript
// src/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<Button isLoading>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });
});
```

#### Hook Test

```typescript
// src/hooks/useDebounce.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });

    // Value should still be initial before timeout
    expect(result.current).toBe("initial");

    // Fast-forward timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe("updated");
  });
});
```

#### Store Test (Zustand)

```typescript
// src/stores/__tests__/useAuthStore.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthStore } from "../useAuthStore";

// Mock API
vi.mock("@/services/api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("should have initial state", () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should set user on successful login", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "STAFF",
    };

    const { authApi } = await import("@/services/api/authApi");
    (authApi.login as jest.Mock).mockResolvedValue({
      user: mockUser,
      accessToken: "token",
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login("test@example.com", "password");
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should clear user on logout", async () => {
    // Set initial authenticated state
    useAuthStore.setState({
      user: { id: 1, email: "test@example.com", name: "Test", role: "STAFF" },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## 🔗 E2E Testing (Cypress)

### E2E Test Structure

```
e2e/
├── cypress/
│   ├── e2e/
│   │   ├── auth/
│   │   │   └── login.cy.ts
│   │   ├── assets/
│   │   │   └── crud.cy.ts
│   │   └── requests/
│   │       └── workflow.cy.ts
│   ├── fixtures/
│   │   └── users.json
│   ├── support/
│   │   ├── commands.ts
│   │   └── e2e.ts
│   └── tsconfig.json
├── cypress.config.ts
└── package.json
```

### E2E Configuration

```typescript
// e2e/cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // Implement node event listeners
    },
  },
});
```

### E2E Test Example

```typescript
// e2e/cypress/e2e/auth/login.cy.ts
describe("Authentication", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should login with valid credentials", () => {
    cy.get('[data-testid="email-input"]').type("admin@triniti.com");
    cy.get('[data-testid="password-input"]').type("password123");
    cy.get('[data-testid="login-button"]').click();

    // Should redirect to dashboard
    cy.url().should("include", "/dashboard");
    cy.get('[data-testid="user-menu"]').should("contain", "Admin");
  });

  it("should show error for invalid credentials", () => {
    cy.get('[data-testid="email-input"]').type("invalid@example.com");
    cy.get('[data-testid="password-input"]').type("wrongpassword");
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Invalid credentials",
    );
  });

  it("should validate required fields", () => {
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="email-error"]').should("be.visible");
    cy.get('[data-testid="password-error"]').should("be.visible");
  });
});
```

---

## 🧰 Test Utilities

### Custom Render (Frontend)

```typescript
// test/utils/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Mock Factories

```typescript
// test/utils/factories.ts
import { faker } from "@faker-js/faker";

export const createMockUser = (overrides = {}) => ({
  id: faker.number.int(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: "STAFF",
  isActive: true,
  divisionId: 1,
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});

export const createMockAsset = (overrides = {}) => ({
  id: `AST-${new Date().getFullYear()}-${faker.string.numeric(4)}`,
  name: faker.commerce.productName(),
  brand: faker.company.name(),
  serialNumber: faker.string.alphanumeric(10).toUpperCase(),
  status: "IN_STORAGE",
  condition: "GOOD",
  quantity: 1,
  ...overrides,
});

export const createMockRequest = (overrides = {}) => ({
  id: faker.string.uuid(),
  requestNumber: `RO-${faker.string.numeric(8)}-${faker.string.numeric(4)}`,
  status: "DRAFT",
  requestedById: 1,
  divisionId: 1,
  notes: faker.lorem.sentence(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});
```

---

## 📊 Coverage Reports

### Viewing Coverage

```bash
# Backend coverage
cd backend
pnpm test:cov
# Open coverage/lcov-report/index.html

# Frontend coverage
cd frontend
pnpm test:coverage
# Open coverage/index.html
```

### Coverage in CI

Coverage reports are automatically generated in CI and can be viewed:

- In GitHub Actions artifacts
- Via Codecov integration (if configured)

---

## ✅ Best Practices

### General

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **One assertion per concept** - Keep tests focused
3. **Use descriptive test names** - `it('should throw NotFoundException when asset not found')`
4. **Arrange-Act-Assert pattern** - Structure tests clearly
5. **Mock external dependencies** - Isolate units under test

### Backend (NestJS)

1. Use `Test.createTestingModule()` for dependency injection
2. Mock `PrismaService` in unit tests
3. Use `jest.Mocked<T>` for type-safe mocks
4. Test error cases and edge conditions
5. Use `beforeEach` to reset mocks

### Frontend (React)

1. Use `data-testid` for test selectors
2. Test user interactions with `fireEvent` or `userEvent`
3. Wait for async operations with `waitFor`
4. Test loading and error states
5. Use `vi.mock()` for module mocking

---

## 📋 Quick Reference

| Task       | Backend Command   | Frontend Command            |
| ---------- | ----------------- | --------------------------- |
| Run tests  | `pnpm test`       | `pnpm test`                 |
| Watch mode | `pnpm test:watch` | `pnpm test:watch`           |
| Coverage   | `pnpm test:cov`   | `pnpm test:coverage`        |
| E2E        | `pnpm test:e2e`   | `pnpm test:e2e` (from e2e/) |

---

**© 2026 Trinity Asset Management System**
