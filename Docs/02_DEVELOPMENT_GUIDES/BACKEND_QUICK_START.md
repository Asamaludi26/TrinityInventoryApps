# Trinity Backend

Backend API untuk sistem manajemen inventori aset PT. Triniti Media, dibangun dengan NestJS, Prisma, dan PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14
- Docker (optional, untuk database development)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database (optional)
pnpm prisma:seed

# Start development server
pnpm start:dev
```

## 📁 Project Structure

```
backend/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma          # Prisma schema definition
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Migration history
├── src/
│   ├── common/                # Shared utilities & infrastructure
│   │   ├── constants/         # Application constants
│   │   ├── decorators/        # Custom decorators
│   │   ├── dto/               # Shared DTOs
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth guards
│   │   ├── health/            # Health check endpoints
│   │   ├── interceptors/      # Request/response interceptors
│   │   ├── pipes/             # Validation pipes
│   │   ├── prisma/            # Database service
│   │   └── utils/             # Helper functions
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── assets/            # Asset management
│   │   ├── requests/          # Request & procurement
│   │   ├── loans/             # Loan management
│   │   ├── transactions/      # Transaction handling
│   │   ├── customers/         # Customer management
│   │   ├── categories/        # Category management
│   │   ├── dashboard/         # Dashboard statistics
│   │   ├── notifications/     # Notification service
│   │   ├── activity-logs/     # Activity logging
│   │   └── reports/           # Report generation
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── test/                      # E2E tests
└── package.json
```

## 🛠 Available Scripts

```bash
# Development
pnpm start:dev          # Start with hot-reload
pnpm start:debug        # Start with debugger

# Production
pnpm build              # Build for production
pnpm start:prod         # Run production build

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run migrations (dev)
pnpm prisma:migrate:prod # Run migrations (prod)
pnpm prisma:studio      # Open Prisma Studio
pnpm prisma:seed        # Seed database
pnpm prisma:reset       # Reset database

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run E2E tests

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix ESLint errors
pnpm format             # Format with Prettier
pnpm typecheck          # TypeScript type checking
```

## 🔒 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Rate Limiting** - Protection against brute force attacks
- **Helmet** - Security headers
- **CORS** - Configurable cross-origin policy
- **Input Validation** - DTO validation with class-validator
- **Password Hashing** - bcrypt with configurable salt rounds
- **Role-Based Access Control** - Granular permissions

## 📡 API Documentation

Swagger documentation available at `/api/docs` in development mode.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/assets` | List assets |
| POST | `/api/assets` | Create asset |
| GET | `/api/requests` | List requests |
| POST | `/api/requests` | Create request |
| GET | `/api/health` | Health check |

## 🏗 Architecture

This backend follows clean architecture principles:

1. **Controllers** - Handle HTTP requests/responses
2. **Services** - Business logic
3. **DTOs** - Data transfer objects for validation
4. **Prisma** - Database ORM

### Module Structure

Each feature module follows this pattern:
```
module-name/
├── dto/                  # Request/Response DTOs
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.module.ts
└── module-name.service.spec.ts
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Coverage report
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3001 |
| DATABASE_URL | PostgreSQL connection | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | Token expiry | 7d |
| CORS_ORIGIN | Allowed origins | http://localhost:5173 |

## 📄 License

MIT License - see LICENSE file for details.
