# ⚙️ Environment Configuration Guide

## 📋 Dokumentasi Lengkap Konfigurasi Environment Variables

Panduan komprehensif untuk semua environment variables yang digunakan di Trinity Asset Management untuk backend dan frontend.

---

## 📊 Overview

| Component    | Config File           | Template                |
| ------------ | --------------------- | ----------------------- |
| **Backend**  | `backend/.env`        | `backend/.env.example`  |
| **Frontend** | `frontend/.env.local` | `frontend/.env.example` |
| **Docker**   | `.env` (root)         | -                       |

---

## 🔧 A. Backend Environment Variables

### A1. Complete Backend Configuration

```dotenv
# =============================================================================
# Trinity Backend Environment Configuration
# File: backend/.env
# Copy from: backend/.env.example
# =============================================================================

# -----------------------------------------------------------------------------
# APPLICATION SETTINGS
# -----------------------------------------------------------------------------

# Environment mode: development | production | test
NODE_ENV=development

# Application port
PORT=3001

# API prefix (used for all routes)
API_PREFIX=api

# -----------------------------------------------------------------------------
# DATABASE (PostgreSQL)
# -----------------------------------------------------------------------------

# Connection string format:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
#
# Components:
#   USER     - Database username
#   PASSWORD - Database password (URL-encoded if contains special chars)
#   HOST     - Database host (localhost for local, container name for Docker)
#   PORT     - Database port (default: 5432)
#   DATABASE - Database name
#   SCHEMA   - Schema name (default: public)
#
# Examples:
#   Local:  postgresql://trinity_admin:password@localhost:5432/trinity_assetflow
#   Docker: postgresql://trinity_admin:password@postgres:5432/trinity_inventory
#
DATABASE_URL="postgresql://trinity_admin:YOUR_STRONG_PASSWORD@localhost:5432/trinity_assetflow?schema=public"

# -----------------------------------------------------------------------------
# JWT AUTHENTICATION
# -----------------------------------------------------------------------------

# JWT secret key for signing tokens
# IMPORTANT: Generate a strong secret for production!
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Minimum: 32 characters, Recommended: 64+ characters
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-64-chars

# Access token expiration
# Format: number + unit (s=seconds, m=minutes, h=hours, d=days)
# Examples: 15m, 1h, 7d
# Development: 7d (more convenient)
# Production: 15m (more secure)
JWT_EXPIRES_IN=7d

# Refresh token expiration
# Should be longer than access token
JWT_REFRESH_EXPIRES_IN=30d

# -----------------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing)
# -----------------------------------------------------------------------------

# Allowed origins for CORS
# Development: http://localhost:5173 (Vite default)
# Production: https://yourdomain.com
# Multiple origins: comma-separated
# Example: https://app.example.com,https://admin.example.com
CORS_ORIGIN=http://localhost:5173

# -----------------------------------------------------------------------------
# RATE LIMITING
# -----------------------------------------------------------------------------

# Time window for rate limiting (in milliseconds)
# Default: 60000 (1 minute)
THROTTLE_TTL=60000

# Maximum requests per time window
# Default: 100 requests per minute
THROTTLE_LIMIT=100

# Login-specific rate limit (stricter to prevent brute force)
# Default: 5 attempts per minute
THROTTLE_LOGIN_LIMIT=5

# -----------------------------------------------------------------------------
# SECURITY
# -----------------------------------------------------------------------------

# bcrypt salt rounds for password hashing
# Higher = more secure but slower
# Recommended: 10-12 for production
BCRYPT_SALT_ROUNDS=12

# Minimum password length requirement
PASSWORD_MIN_LENGTH=8

# -----------------------------------------------------------------------------
# LOGGING
# -----------------------------------------------------------------------------

# Log level: error | warn | log | debug | verbose
# Development: debug
# Production: log or warn
LOG_LEVEL=debug

# -----------------------------------------------------------------------------
# WHATSAPP GATEWAY (Optional)
# -----------------------------------------------------------------------------

# Enable/disable WhatsApp integration
WA_ENABLED=false

# WhatsApp provider (e.g., watzap, fonnte)
WA_PROVIDER=watzap

# API credentials
WA_API_KEY=your-api-key
WA_API_URL=https://api.watzap.id/v1

# Group IDs for notifications
WA_GROUP_LOGISTIC_ID=
WA_GROUP_PURCHASE_ID=
WA_GROUP_MANAGEMENT_ID=

# -----------------------------------------------------------------------------
# FILE UPLOAD (Optional)
# -----------------------------------------------------------------------------

# Maximum file size in bytes (default: 10MB)
UPLOAD_MAX_SIZE=10485760

# Upload destination directory
UPLOAD_DEST=./uploads

# -----------------------------------------------------------------------------
# REDIS CACHE (Optional, for future scaling)
# -----------------------------------------------------------------------------

# Redis connection URL
# REDIS_URL=redis://localhost:6379

# -----------------------------------------------------------------------------
# OPTIONAL INTEGRATIONS
# -----------------------------------------------------------------------------

# Email SMTP Configuration
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=noreply@example.com
# SMTP_PASS=email-password
# SMTP_FROM=Trinity Asset <noreply@example.com>
```

### A2. Backend Environment Variables Reference

| Variable                 | Required | Default                 | Description                  |
| ------------------------ | -------- | ----------------------- | ---------------------------- |
| `NODE_ENV`               | Yes      | `development`           | Environment mode             |
| `PORT`                   | Yes      | `3001`                  | Application port             |
| `API_PREFIX`             | No       | `api`                   | API URL prefix               |
| `DATABASE_URL`           | Yes      | -                       | PostgreSQL connection string |
| `JWT_SECRET`             | Yes      | -                       | Secret for JWT signing       |
| `JWT_EXPIRES_IN`         | No       | `7d`                    | Access token expiration      |
| `JWT_REFRESH_EXPIRES_IN` | No       | `30d`                   | Refresh token expiration     |
| `CORS_ORIGIN`            | Yes      | `http://localhost:5173` | Allowed CORS origins         |
| `THROTTLE_TTL`           | No       | `60000`                 | Rate limit window (ms)       |
| `THROTTLE_LIMIT`         | No       | `100`                   | Max requests per window      |
| `THROTTLE_LOGIN_LIMIT`   | No       | `5`                     | Max login attempts           |
| `BCRYPT_SALT_ROUNDS`     | No       | `12`                    | Password hashing rounds      |
| `PASSWORD_MIN_LENGTH`    | No       | `8`                     | Min password length          |
| `LOG_LEVEL`              | No       | `debug`                 | Logging verbosity            |
| `WA_ENABLED`             | No       | `false`                 | WhatsApp integration         |
| `UPLOAD_MAX_SIZE`        | No       | `10485760`              | Max upload size (bytes)      |
| `UPLOAD_DEST`            | No       | `./uploads`             | Upload directory             |

---

## ⚛️ B. Frontend Environment Variables

### B1. Complete Frontend Configuration

```dotenv
# =============================================================================
# Trinity Frontend Environment Configuration
# File: frontend/.env.local
# Copy from: frontend/.env.example
# =============================================================================

# -----------------------------------------------------------------------------
# API CONFIGURATION
# -----------------------------------------------------------------------------

# Backend API base URL
# Development: http://localhost:3001/api/v1
# Production: https://api.yourdomain.com/api/v1 or /api/v1 (relative)
#
# Note: Include /api/v1 for versioned API endpoints
VITE_API_URL=http://localhost:3001/api/v1

# Enable mock mode (use fake data instead of real API)
# true  = Use mock data (no backend needed)
# false = Use real API (backend must be running)
VITE_USE_MOCK=false

# -----------------------------------------------------------------------------
# APP CONFIGURATION
# -----------------------------------------------------------------------------

# Application name (displayed in UI)
VITE_APP_NAME=Trinity Asset Flow

# Application version
VITE_APP_VERSION=1.3.0

# -----------------------------------------------------------------------------
# FEATURE FLAGS
# -----------------------------------------------------------------------------

# Enable debug mode (extra logging, dev tools)
VITE_ENABLE_DEBUG=false

# Enable analytics tracking
VITE_ENABLE_ANALYTICS=false

# Enable experimental features
VITE_ENABLE_EXPERIMENTAL=false

# -----------------------------------------------------------------------------
# OPTIONAL CONFIGURATIONS
# -----------------------------------------------------------------------------

# Public URL (for assets, links)
# VITE_PUBLIC_URL=https://app.example.com

# API timeout in milliseconds
# VITE_API_TIMEOUT=30000

# Enable PWA features
# VITE_ENABLE_PWA=false

# Sentry DSN for error tracking
# VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### B2. Frontend Environment Variables Reference

| Variable                | Required | Default              | Description          |
| ----------------------- | -------- | -------------------- | -------------------- |
| `VITE_API_URL`          | Yes      | -                    | Backend API base URL |
| `VITE_USE_MOCK`         | No       | `false`              | Enable mock mode     |
| `VITE_APP_NAME`         | No       | `Trinity Asset Flow` | Application name     |
| `VITE_APP_VERSION`      | No       | -                    | Application version  |
| `VITE_ENABLE_DEBUG`     | No       | `false`              | Debug mode           |
| `VITE_ENABLE_ANALYTICS` | No       | `false`              | Analytics tracking   |

### B3. Accessing Environment Variables in Frontend

```typescript
// In React/TypeScript code
const apiUrl = import.meta.env.VITE_API_URL;
const useMock = import.meta.env.VITE_USE_MOCK === "true";
const appName = import.meta.env.VITE_APP_NAME;
const isDebug = import.meta.env.VITE_ENABLE_DEBUG === "true";

// Example usage in API client
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

// Type-safe environment variables (optional)
// Create src/vite-env.d.ts:
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 🐳 C. Docker Environment Variables

### C1. Docker Compose Production Configuration

```dotenv
# =============================================================================
# Docker Production Environment Configuration
# File: .env (root directory)
# =============================================================================

# -----------------------------------------------------------------------------
# DATABASE
# -----------------------------------------------------------------------------

# PostgreSQL credentials
POSTGRES_USER=trinity_admin
POSTGRES_PASSWORD=YOUR_SECURE_PRODUCTION_PASSWORD
POSTGRES_DB=trinity_inventory

# Full database URL for backend
# Note: Use 'postgres' as host (container name)
DATABASE_URL="postgresql://trinity_admin:YOUR_SECURE_PRODUCTION_PASSWORD@postgres:5432/trinity_inventory"

# -----------------------------------------------------------------------------
# JWT
# -----------------------------------------------------------------------------

# Generate with: openssl rand -hex 64
JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET_MINIMUM_64_CHARACTERS_LONG_GENERATE_WITH_OPENSSL
JWT_EXPIRATION=15m

# -----------------------------------------------------------------------------
# APPLICATION
# -----------------------------------------------------------------------------

NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# -----------------------------------------------------------------------------
# PORTS
# -----------------------------------------------------------------------------

# External ports (host:container)
FRONTEND_PORT=80
BACKEND_PORT=3001

# -----------------------------------------------------------------------------
# OPTIONAL: SSL/HTTPS
# -----------------------------------------------------------------------------

# SSL_CERT_PATH=/etc/ssl/certs/trinity.crt
# SSL_KEY_PATH=/etc/ssl/private/trinity.key
```

### C2. Docker-Specific Variables

| Variable            | Used In            | Description            |
| ------------------- | ------------------ | ---------------------- |
| `POSTGRES_USER`     | postgres container | Database username      |
| `POSTGRES_PASSWORD` | postgres container | Database password      |
| `POSTGRES_DB`       | postgres container | Database name          |
| `DATABASE_URL`      | backend container  | Full connection string |
| `FRONTEND_PORT`     | docker-compose     | Frontend exposed port  |
| `BACKEND_PORT`      | docker-compose     | Backend exposed port   |

---

## 🔒 D. Security Guidelines

### D1. Secret Generation

```bash
# Generate JWT secret (64+ characters recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64

# Generate strong password
openssl rand -base64 32
```

### D2. Password Requirements

For `POSTGRES_PASSWORD` and other secrets:

| Requirement        | Minimum       |
| ------------------ | ------------- |
| Length             | 16 characters |
| Uppercase          | 1+            |
| Lowercase          | 1+            |
| Numbers            | 1+            |
| Special Characters | 1+            |

### D3. Environment File Security

```bash
# NEVER commit .env files to git
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Set appropriate file permissions
chmod 600 .env
chmod 600 backend/.env
chmod 600 frontend/.env.local
```

### D4. Production Checklist

- [ ] `JWT_SECRET` is unique and 64+ characters
- [ ] `POSTGRES_PASSWORD` is strong (16+ chars, mixed)
- [ ] `NODE_ENV` is set to `production`
- [ ] `JWT_EXPIRES_IN` is short (15m recommended)
- [ ] `CORS_ORIGIN` matches your domain exactly
- [ ] Database port is not exposed publicly
- [ ] `.env` files are not committed to git
- [ ] Secrets are not logged

---

## 📁 E. Environment by Deployment Stage

### E1. Local Development

```dotenv
# backend/.env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://trinity_admin:local_password@localhost:5432/trinity_assetflow"
JWT_SECRET=development-secret-key-not-for-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

```dotenv
# frontend/.env.local
VITE_API_URL=http://localhost:3001/api/v1
VITE_USE_MOCK=false
VITE_ENABLE_DEBUG=true
```

### E2. Staging Environment

```dotenv
# backend/.env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://trinity_staging:STAGING_PASSWORD@db-staging.example.com:5432/trinity_staging"
JWT_SECRET=staging-secret-still-not-production-but-closer
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://staging.example.com
LOG_LEVEL=log
```

```dotenv
# frontend/.env.staging
VITE_API_URL=https://api-staging.example.com/api/v1
VITE_USE_MOCK=false
VITE_ENABLE_DEBUG=false
```

### E3. Production Environment

```dotenv
# backend/.env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://trinity_prod:SUPER_SECURE_PROD_PASSWORD@db.example.com:5432/trinity_prod?sslmode=require"
JWT_SECRET=PRODUCTION_SECRET_64_CHARS_GENERATED_WITH_OPENSSL_OR_CRYPTO
JWT_EXPIRES_IN=15m
CORS_ORIGIN=https://app.example.com
LOG_LEVEL=warn
BCRYPT_SALT_ROUNDS=12
```

```dotenv
# frontend/.env.production
VITE_API_URL=https://api.example.com/api/v1
VITE_USE_MOCK=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

---

## 🔧 F. Troubleshooting

### F1. Common Issues

| Issue                         | Cause                 | Solution                               |
| ----------------------------- | --------------------- | -------------------------------------- |
| `DATABASE_URL is not defined` | Missing .env file     | Copy .env.example to .env              |
| `CORS error`                  | Origin mismatch       | Check CORS_ORIGIN matches frontend URL |
| `JWT malformed`               | Invalid JWT_SECRET    | Regenerate and ensure consistency      |
| `Cannot connect to database`  | Wrong DATABASE_URL    | Check host, port, credentials          |
| `API returns undefined`       | Missing VITE\_ prefix | Frontend vars must start with VITE\_   |

### F2. Debugging Environment

```bash
# Check loaded environment (backend)
docker compose exec backend env | grep -E "NODE_ENV|DATABASE|JWT|CORS"

# Check frontend build-time variables
cat frontend/dist/index.html | grep -o 'VITE_[A-Z_]*'

# Verify .env is loaded
cd backend && node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### F3. Environment Variable Priority

**Backend (NestJS/Node.js):**

1. Process environment (system/Docker)
2. `.env.local` (if exists)
3. `.env`

**Frontend (Vite):**

1. `.env.local` (local overrides, git-ignored)
2. `.env.[mode]` (e.g., `.env.production`)
3. `.env`

---

## 📚 G. Quick Setup Scripts

### G1. Setup Script for Development

```bash
#!/bin/bash
# setup-dev-env.sh

echo "Setting up development environment..."

# Backend
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created backend/.env from template"
fi

# Frontend
cd ../frontend
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created frontend/.env.local from template"
fi

echo "Environment files created. Edit them with your settings."
```

### G2. Validate Environment Script

```bash
#!/bin/bash
# validate-env.sh

echo "Validating environment configuration..."

# Check required backend variables
REQUIRED_BACKEND="DATABASE_URL JWT_SECRET"
for var in $REQUIRED_BACKEND; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var is not set in backend/.env"
    exit 1
  fi
done

# Check required frontend variables
if [ -z "$VITE_API_URL" ]; then
  echo "WARNING: VITE_API_URL is not set in frontend/.env.local"
fi

echo "Environment validation passed!"
```

---

## 📚 H. Additional Resources

### H1. Related Documentation

- [Backend Setup Guide](BACKEND_SETUP.md) - NestJS configuration
- [Frontend Setup Guide](FRONTEND_SETUP.md) - React/Vite configuration
- [Database Setup Guide](DATABASE_SETUP.md) - PostgreSQL & Prisma
- [Docker Setup Guide](DOCKER_COMPLETE.md) - Container configuration

### H2. External Links

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [12-Factor App - Config](https://12factor.net/config)

---

**© 2026 Trinity Asset Management System**
