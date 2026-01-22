# 🐳 Trinity Inventory - Docker Setup

## 📋 Overview

Dokumentasi lengkap untuk containerization dan deployment Trinity Asset Management System menggunakan Docker. Sistem ini menggunakan arsitektur decoupled dengan:

- **Backend:** NestJS API Server (Port 3001)
- **Frontend:** React SPA + Nginx (Port 80)
- **Database:** PostgreSQL 17

---

## 🏗️ Arsitektur Container

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                  (trinity-network)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐      ┌─────────────────┐               │
│  │    Frontend     │      │    Backend      │               │
│  │   (Nginx + SPA) │ ───► │   (NestJS)      │               │
│  │     :80/:443    │      │     :3001       │               │
│  └─────────────────┘      └────────┬────────┘               │
│                                     │                        │
│                                     ▼                        │
│                           ┌─────────────────┐               │
│                           │   PostgreSQL    │               │
│                           │     :5432       │               │
│                           └─────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 A. Backend Dockerfile

### File: `backend/Dockerfile`

```dockerfile
# =============================================================================
# Backend Dockerfile
# Trinity Asset Flow - NestJS API Server
# =============================================================================
# Build: docker build -t trinity-backend -f Dockerfile .
# Run:   docker run -d -p 3001:3001 trinity-backend
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm and build tools
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN pnpm prisma generate

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Remove devDependencies
RUN pnpm prune --prod

# Stage 2: Production
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S trinity && \
    adduser -S trinity -u 1001 -G trinity

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=builder --chown=trinity:trinity /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=trinity:trinity /app/dist ./dist

# Copy Prisma files
COPY --from=builder --chown=trinity:trinity /app/prisma ./prisma

# Copy package.json for version info
COPY --from=builder --chown=trinity:trinity /app/package.json ./

# Switch to non-root user
USER trinity

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

### Build Commands

```bash
# Build backend image
cd backend
docker build -t trinity-backend:latest .

# Run standalone
docker run -d \
  --name trinity-backend \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/trinity_inventory" \
  -e JWT_SECRET="your-secret" \
  trinity-backend:latest
```

---

## 🎨 B. Frontend Dockerfile

### File: `frontend/Dockerfile`

```dockerfile
# =============================================================================
# Frontend Dockerfile
# Trinity Asset Flow - React SPA with Nginx
# =============================================================================
# Build: docker build -t trinity-frontend -f Dockerfile .
# Run:   docker run -d -p 80:80 trinity-frontend
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Stage 2: Production
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S trinity && \
    adduser -S trinity -u 1001 -G trinity && \
    chown -R trinity:trinity /usr/share/nginx/html && \
    chown -R trinity:trinity /var/cache/nginx && \
    chown -R trinity:trinity /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R trinity:trinity /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Build Commands

```bash
# Build frontend image
cd frontend
docker build -t trinity-frontend:latest .

# Run standalone
docker run -d \
  --name trinity-frontend \
  -p 80:80 \
  trinity-frontend:latest
```

---

## 🔧 C. Nginx Configuration

### File: `frontend/nginx.conf`

```nginx
# =============================================================================
# Nginx Configuration for React SPA
# Trinity Asset Flow
# =============================================================================

server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/rss+xml application/atom+xml image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Health check endpoint
    location /health {
        access_log off;
        add_header Content-Type text/plain;
        return 200 "OK";
    }

    # API proxy to backend
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;

        # Don't cache index.html
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## 🐘 D. Docker Compose - Development

### File: `docker-compose.dev.yml`

```yaml
# =============================================================================
# Development Docker Compose Configuration
# Trinity Asset Flow Application
# =============================================================================
#
# Usage:
#   docker compose -f docker-compose.dev.yml up -d
#
# =============================================================================

services:
  # ===========================================================================
  # PostgreSQL Database (Development)
  # ===========================================================================
  postgres:
    image: postgres:16-alpine
    container_name: trinity-db-dev
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: trinity_assetflow
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - trinity-dev-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d trinity_assetflow"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

# =============================================================================
# Networks
# =============================================================================
networks:
  trinity-dev-network:
    driver: bridge
    name: trinity-dev-network

# =============================================================================
# Volumes
# =============================================================================
volumes:
  postgres_dev_data:
    name: trinity_postgres_dev_data
```

### Development Workflow

```bash
# Start PostgreSQL only (backend & frontend run locally)
docker compose -f docker-compose.dev.yml up -d

# Check status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f postgres

# Stop
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker compose -f docker-compose.dev.yml down -v
```

---

## 🏭 E. Docker Compose - Production

### File: `docker-compose.yml`

```yaml
# =============================================================================
# Production Docker Compose Configuration
# Trinity Asset Flow Application
# =============================================================================
#
# Usage:
#   1. Copy .env.example to .env and configure secrets
#   2. Run: docker compose up -d
#   3. Check status: docker compose ps
#   4. View logs: docker compose logs -f
#
# =============================================================================

version: "3.8"

services:
  # ===========================================================================
  # Frontend - React SPA served by Nginx
  # ===========================================================================
  frontend:
    image: trinity-frontend:latest
    build:
      context: ./frontend
    container_name: trinity-frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-80}:80"
    networks:
      - trinity-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ===========================================================================
  # Backend - NestJS API Server
  # ===========================================================================
  backend:
    image: trinity-backend:latest
    build:
      context: ./backend
    container_name: trinity-backend
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT:-3001}:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=${JWT_EXPIRATION:-7d}
      - CORS_ORIGIN=${CORS_ORIGIN:-http://localhost}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - trinity-network
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"

  # ===========================================================================
  # PostgreSQL Database
  # ===========================================================================
  postgres:
    image: postgres:16-alpine
    container_name: trinity-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-trinity_admin}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB:-trinity_inventory}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    ports:
      - "5432:5432"
    networks:
      - trinity-network
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U ${POSTGRES_USER:-trinity_admin} -d ${POSTGRES_DB:-trinity_inventory}",
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "3"

# =============================================================================
# Networks
# =============================================================================
networks:
  trinity-network:
    driver: bridge
    name: trinity-network

# =============================================================================
# Volumes
# =============================================================================
volumes:
  postgres_data:
    name: trinity-postgres-data
```

---

## 🔐 F. Environment Variables

### File: `.env.example`

```bash
# =============================================================================
# Trinity Asset Flow - Environment Variables
# =============================================================================

# Database Configuration
POSTGRES_USER=trinity_admin
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=trinity_inventory
DATABASE_URL=postgresql://trinity_admin:your_secure_password_here@postgres:5432/trinity_inventory

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRATION=7d

# Application Ports
FRONTEND_PORT=80
BACKEND_PORT=3001

# CORS Configuration
CORS_ORIGIN=http://localhost

# Optional: Nginx Proxy Configuration
# NGINX_PORT=443
```

### Security Best Practices

```bash
# Generate secure secrets
# JWT Secret (64 characters)
openssl rand -hex 32

# Database Password
openssl rand -base64 24
```

---

## 🚀 G. Deployment Commands

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-org/trinity-inventory.git
cd trinity-inventory

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your secrets
nano .env

# 4. Build and start containers
docker compose up -d --build

# 5. Check status
docker compose ps

# 6. View logs
docker compose logs -f
```

### Common Operations

```bash
# Stop all containers
docker compose down

# Restart services
docker compose restart

# Rebuild specific service
docker compose up -d --build backend

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Execute command in container
docker compose exec backend sh
docker compose exec postgres psql -U trinity_admin -d trinity_inventory

# Run database migrations manually
docker compose exec backend npx prisma migrate deploy

# Database backup
docker compose exec postgres pg_dump -U trinity_admin trinity_inventory > backup.sql

# Database restore
docker compose exec -T postgres psql -U trinity_admin trinity_inventory < backup.sql
```

### Scaling (for Docker Swarm)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml trinity

# Scale backend
docker service scale trinity_backend=3

# View services
docker service ls
```

---

## 🔍 H. Health Checks

### Backend Health Endpoint

```typescript
// GET /health
{
  "status": "ok",
  "timestamp": "2026-01-19T10:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Frontend Health Endpoint

```nginx
# /health returns "OK" with 200 status
location /health {
    access_log off;
    add_header Content-Type text/plain;
    return 200 "OK";
}
```

### Docker Health Check Status

```bash
# View container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Output:
# NAMES              STATUS
# trinity-frontend   Up 5 minutes (healthy)
# trinity-backend    Up 5 minutes (healthy)
# trinity-db         Up 5 minutes (healthy)
```

---

## 📊 I. Monitoring & Logging

### Log Configuration

```yaml
# JSON file logging with rotation
logging:
  driver: "json-file"
  options:
    max-size: "50m" # Max file size
    max-file: "5" # Number of files to keep
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service with timestamps
docker compose logs -f --timestamps backend

# Last 100 lines
docker compose logs --tail=100 backend

# Since specific time
docker compose logs --since="2024-01-19T10:00:00" backend
```

### Resource Usage

```bash
# View container stats
docker stats

# Output:
# CONTAINER        CPU %    MEM USAGE / LIMIT     MEM %
# trinity-backend  0.50%    256MiB / 2GiB         12.50%
# trinity-frontend 0.10%    32MiB / 512MiB        6.25%
# trinity-db       1.20%    128MiB / 1GiB         12.50%
```

---

## 🛡️ J. Security Hardening

### Container Security

```dockerfile
# Run as non-root user
RUN addgroup -g 1001 -S trinity && \
    adduser -S trinity -u 1001 -G trinity
USER trinity

# Read-only filesystem (where possible)
# Use dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
```

### Network Security

```yaml
# Isolate containers in dedicated network
networks:
  trinity-network:
    driver: bridge
    internal: false # Set to true to disable internet access

# Don't expose database port in production
postgres:
  # Remove or comment out:
  # ports:
  #   - "5432:5432"
```

### Secrets Management

```bash
# Docker Secrets (Swarm mode)
echo "your_password" | docker secret create postgres_password -

# Reference in compose
services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password

secrets:
  postgres_password:
    external: true
```

---

## 🔄 K. CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Images

on:
  push:
    branches: [main]
    tags: ["v*"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/${{ github.repository }}/frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 📋 L. Troubleshooting

### Common Issues

| Issue                       | Solution                                          |
| --------------------------- | ------------------------------------------------- |
| Container exits immediately | Check logs: `docker compose logs backend`         |
| Database connection refused | Wait for postgres healthcheck to pass             |
| Port already in use         | Change port in `.env` or stop conflicting service |
| Build fails at npm install  | Clear Docker cache: `docker builder prune`        |
| Permission denied           | Check user/group settings in Dockerfile           |

### Debug Commands

```bash
# Interactive shell in container
docker compose exec backend sh

# Check container processes
docker compose top

# Inspect container
docker inspect trinity-backend

# Check network
docker network inspect trinity-network

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a
```

---

## 📚 Quick Reference

| Command                          | Description             |
| -------------------------------- | ----------------------- |
| `docker compose up -d`           | Start all services      |
| `docker compose down`            | Stop all services       |
| `docker compose down -v`         | Stop and remove volumes |
| `docker compose logs -f`         | View live logs          |
| `docker compose ps`              | List running services   |
| `docker compose exec backend sh` | Shell into backend      |
| `docker compose restart backend` | Restart backend         |
| `docker compose up -d --build`   | Rebuild and start       |

---

**© 2026 Trinity Asset Management System**
