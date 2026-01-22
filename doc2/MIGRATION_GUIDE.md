# 🚀 Trinity Inventory - Setup & Deployment Guide

## 📋 Panduan Setup dan Deployment

Dokumentasi lengkap untuk setup development environment dan deployment Trinity Asset Management System ke production. Sistem ini menggunakan arsitektur decoupled dengan NestJS backend dan React/Vite frontend.

---

## 📊 Arsitektur Sistem

| Aspek         | Technology              | Port                   |
| ------------- | ----------------------- | ---------------------- |
| **Backend**   | NestJS + Prisma         | 3001                   |
| **Frontend**  | React + Vite            | 5173 (dev) / 80 (prod) |
| **Database**  | PostgreSQL 17           | 5432                   |
| **Container** | Docker + docker-compose | -                      |

---

## 🛠️ A. Development Setup

### A1. Prerequisites

```bash
# Required software
- Node.js 20 LTS atau lebih baru
- pnpm 9+ (package manager)
- Docker Desktop (untuk PostgreSQL)
- Git
- VSCode (recommended)
```

### A2. Clone Repository

```bash
git clone https://github.com/your-org/trinity-inventory.git
cd trinity-inventory
```

### A3. Start Database (Docker)

```bash
# Start PostgreSQL container
docker compose -f docker-compose.dev.yml up -d

# Verify database is running
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs postgres
```

### A4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Seed database with sample data
pnpm prisma:seed

# Start development server
pnpm start:dev
```

Backend akan berjalan di `http://localhost:3001`

### A5. Frontend Setup

```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Frontend akan berjalan di `http://localhost:5173`

### A6. Environment Variables

#### Backend (.env)

```bash
# backend/.env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trinity_assetflow"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"
JWT_REFRESH_EXPIRATION="7d"

# Application
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

#### Frontend (.env)

```bash
# frontend/.env
VITE_API_URL="http://localhost:3001/api"
VITE_USE_MOCK=false
```

---

## 🔧 B. Common Development Commands

### Backend Commands

```bash
cd backend

# Development
pnpm start:dev          # Start with hot reload
pnpm start:debug        # Start with debugging

# Database
pnpm prisma:generate    # Generate Prisma Client
pnpm prisma:migrate     # Run migrations
pnpm prisma:studio      # Open Prisma Studio GUI
pnpm prisma:reset       # Reset database (WARNING: deletes data)

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run E2E tests

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix ESLint errors
pnpm format             # Format with Prettier
pnpm typecheck          # TypeScript check

# Build
pnpm build              # Build for production
```

### Frontend Commands

```bash
cd frontend

# Development
pnpm dev                # Start dev server
pnpm preview            # Preview production build

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix ESLint errors
pnpm format             # Format with Prettier
pnpm typecheck          # TypeScript check

# Build
pnpm build              # Build for production
```

---

## 🐳 C. Docker Development

### Full Stack with Docker

```bash
# Start all services (from root directory)
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop all services
docker compose -f docker-compose.dev.yml down

# Reset (delete volumes)
docker compose -f docker-compose.dev.yml down -v
```

### Database Only (Recommended for Development)

```bash
# Start only PostgreSQL
docker compose -f docker-compose.dev.yml up -d postgres

# Connect to database
docker compose exec postgres psql -U postgres -d trinity_assetflow
```

---

## 🏭 D. Production Deployment

### D1. Build Docker Images

```bash
# Build backend image
cd backend
docker build -t trinity-backend:latest .

# Build frontend image
cd frontend
docker build -t trinity-frontend:latest .
```

### D2. Environment Configuration

Create `.env` file in production server:

```bash
# Production .env
# Database
DATABASE_URL="postgresql://trinity_admin:SECURE_PASSWORD@postgres:5432/trinity_inventory"
POSTGRES_USER=trinity_admin
POSTGRES_PASSWORD=SECURE_PASSWORD
POSTGRES_DB=trinity_inventory

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET="your-production-secret-64-characters-minimum"
JWT_EXPIRATION="15m"

# Application
NODE_ENV=production
CORS_ORIGIN="https://yourdomain.com"

# Ports
FRONTEND_PORT=80
BACKEND_PORT=3001
```

### D3. Deploy with Docker Compose

```bash
# Copy files to server
scp docker-compose.yml user@server:/opt/trinity/
scp .env user@server:/opt/trinity/

# SSH to server
ssh user@server

# Navigate to deployment directory
cd /opt/trinity

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### D4. Manual Production Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Build images
docker compose build

# 3. Run database migrations
docker compose exec backend npx prisma migrate deploy

# 4. Restart services
docker compose up -d

# 5. Verify health
curl http://localhost:3001/health
curl http://localhost/health
```

---

## 🔄 E. Database Migrations

### Development Workflow

```bash
# 1. Edit prisma/schema.prisma

# 2. Create migration
pnpm prisma:migrate

# Enter migration name when prompted:
# → add_new_field_to_asset

# 3. Apply migration (automatic in dev)
# Migration is automatically applied and Prisma Client regenerated
```

### Production Migration

```bash
# From production server
cd /opt/trinity

# Apply pending migrations
docker compose exec backend npx prisma migrate deploy
```

### Rollback (if needed)

```bash
# Check migration status
docker compose exec backend npx prisma migrate status

# Manual rollback requires SQL or restore from backup
```

---

## 📦 F. Backup & Restore

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U trinity_admin trinity_inventory > backup_$(date +%Y%m%d_%H%M%S).sql

# Or with gzip compression
docker compose exec postgres pg_dump -U trinity_admin trinity_inventory | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Database Restore

```bash
# Restore from backup
docker compose exec -T postgres psql -U trinity_admin trinity_inventory < backup_20260119.sql

# Or from gzip
gunzip -c backup_20260119.sql.gz | docker compose exec -T postgres psql -U trinity_admin trinity_inventory
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/mnt/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/trinity_$TIMESTAMP.sql.gz"

# Create backup
docker compose exec -T postgres pg_dump -U trinity_admin trinity_inventory | gzip > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "trinity_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Add to crontab for daily backups:

```bash
# Run daily at 2 AM
0 2 * * * /opt/trinity/backup.sh >> /var/log/trinity-backup.log 2>&1
```

---

## 🔍 G. Troubleshooting

### Common Issues

| Issue                       | Solution                                             |
| --------------------------- | ---------------------------------------------------- |
| Port already in use         | Change port in `.env` or stop conflicting service    |
| Database connection refused | Check if PostgreSQL container is running             |
| Prisma Client not generated | Run `pnpm prisma:generate`                           |
| Migration failed            | Check DATABASE_URL, run `pnpm prisma:migrate:status` |
| CORS error                  | Verify CORS_ORIGIN matches frontend URL              |
| JWT invalid                 | Check JWT_SECRET is set and consistent               |

### Debug Commands

```bash
# Check container logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Check container status
docker compose ps

# Access container shell
docker compose exec backend sh
docker compose exec postgres psql -U postgres

# Check network
docker network inspect trinity-network

# Check environment variables
docker compose exec backend env | grep -E "JWT|DATABASE|PORT"
```

### Reset Development Environment

```bash
# Stop all containers
docker compose -f docker-compose.dev.yml down

# Remove volumes (WARNING: deletes all data)
docker compose -f docker-compose.dev.yml down -v

# Remove node_modules and reinstall
cd backend && rm -rf node_modules && pnpm install
cd frontend && rm -rf node_modules && pnpm install

# Start fresh
docker compose -f docker-compose.dev.yml up -d
cd backend && pnpm prisma:migrate && pnpm prisma:seed
```

---

## 📊 H. Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health (via nginx)
curl http://localhost/health

# Database health
docker compose exec postgres pg_isready -U trinity_admin
```

### Container Stats

```bash
# View resource usage
docker stats trinity-backend trinity-frontend trinity-db

# View logs in real-time
docker compose logs -f --tail=100
```

### Application Logs

```bash
# Backend logs
docker compose logs -f backend

# With timestamp
docker compose logs -f --timestamps backend

# Last 100 lines
docker compose logs --tail=100 backend
```

---

## 🚀 I. Quick Start Summary

### First Time Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/trinity-inventory.git
cd trinity-inventory

# 2. Start database
docker compose -f docker-compose.dev.yml up -d postgres

# 3. Setup backend
cd backend
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev

# 4. Setup frontend (new terminal)
cd frontend
cp .env.example .env
pnpm install
pnpm dev

# 5. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
# Prisma Studio: pnpm prisma:studio (port 5555)
```

### Daily Development

```bash
# Start database if not running
docker compose -f docker-compose.dev.yml up -d postgres

# Terminal 1: Backend
cd backend && pnpm start:dev

# Terminal 2: Frontend
cd frontend && pnpm dev
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`pnpm test`)
- [ ] No lint errors (`pnpm lint`)
- [ ] Build successful (`pnpm build`)
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Docker images built

### Deployment

- [ ] Push to main branch
- [ ] CI pipeline passes
- [ ] Docker images pushed to registry
- [ ] Migrations run on production database
- [ ] Containers started
- [ ] Health checks passing

### Post-Deployment

- [ ] Application accessible
- [ ] Login working
- [ ] Basic functionality verified
- [ ] Logs checked for errors
- [ ] Monitoring alerts active

---

**© 2026 Trinity Asset Management System**
