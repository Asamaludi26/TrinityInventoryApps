# 🐳 Docker Complete Guide - Containerization & Deployment

## 📋 Dokumentasi Lengkap Docker Setup dan Deployment

Panduan komprehensif untuk containerization, Docker Compose configuration, dan deployment Trinity Asset Management menggunakan Docker.

---

## 📊 Informasi Teknis

| Aspek               | Detail                                              |
| ------------------- | --------------------------------------------------- |
| **Docker Engine**   | 24.0+                                               |
| **Docker Compose**  | 2.20+                                               |
| **Base Images**     | node:20-alpine, postgres:16-alpine, nginx:alpine    |
| **Container Count** | 3-4 (frontend, backend, postgres, optional pgadmin) |
| **Network**         | bridge (trinity-network)                            |
| **Volumes**         | postgres_data, uploads                              |

---

## 🛠️ A. Prerequisites

### A1. Install Docker

#### Windows

```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop

# Or using Winget
winget install Docker.DockerDesktop

# Verify installation
docker --version
docker compose version
```

#### macOS

```bash
# Using Homebrew
brew install --cask docker

# Start Docker Desktop from Applications

# Verify installation
docker --version
docker compose version
```

#### Linux (Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### A2. Verify Docker Setup

```bash
# Check Docker daemon
docker info

# Test with hello-world
docker run hello-world

# Check Docker Compose
docker compose version
```

---

## 📁 B. Docker Files Overview

### B1. Project Docker Files

```
TrinityInventoryApps/
├── docker-compose.yml           # Production configuration
├── docker-compose.dev.yml       # Root development config
├── backend/
│   ├── Dockerfile               # Backend image build
│   └── docker-compose.dev.yml   # Backend-specific dev config
├── frontend/
│   ├── Dockerfile               # Frontend image build
│   └── nginx.conf               # Nginx configuration
└── init-scripts/                # Database initialization scripts
```

---

## 🔧 C. Backend Dockerfile

### C1. Multi-Stage Build

```dockerfile
# =============================================================================
# Backend Dockerfile
# Trinity Asset Flow - NestJS API Server
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

### C2. Build Backend Image

```bash
cd backend

# Build image
docker build -t trinity-backend:latest .

# Build with no cache
docker build --no-cache -t trinity-backend:latest .

# Build with specific tag
docker build -t trinity-backend:v1.0.0 .
```

---

## ⚛️ D. Frontend Dockerfile

### D1. Multi-Stage Build with Nginx

```dockerfile
# =============================================================================
# Frontend Dockerfile
# Trinity Asset Flow - React SPA with Nginx
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

### D2. Nginx Configuration

```nginx
# frontend/nginx.conf
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

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
}
```

### D3. Build Frontend Image

```bash
cd frontend

# Build image
docker build -t trinity-frontend:latest .

# Build with specific tag
docker build -t trinity-frontend:v1.0.0 .
```

---

## 📦 E. Docker Compose - Development

### E1. Development Configuration

```yaml
# backend/docker-compose.dev.yml
services:
  db:
    image: postgres:16-alpine
    container_name: trinity-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: trinity_admin
      POSTGRES_PASSWORD: "Tr1n1ty_Db@2026_SecureP4ss!"
      POSTGRES_DB: trinity_assetflow
    ports:
      - "5432:5432"
    volumes:
      - trinity_postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trinity_admin -d trinity_assetflow"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: trinity-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@trinity.local
      PGADMIN_DEFAULT_PASSWORD: admin
      PGADMIN_CONFIG_SERVER_MODE: "False"
    ports:
      - "5050:80"
    volumes:
      - trinity_pgadmin_data:/var/lib/pgadmin
    depends_on:
      - db

volumes:
  trinity_postgres_data:
  trinity_pgadmin_data:
```

### E2. Development Commands

```bash
# Navigate to backend directory
cd backend

# Start database only
docker compose -f docker-compose.dev.yml up -d db

# Start database + pgAdmin
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: deletes data)
docker compose -f docker-compose.dev.yml down -v
```

### E3. Access Services (Development)

| Service    | URL                     | Credentials                                 |
| ---------- | ----------------------- | ------------------------------------------- |
| PostgreSQL | `localhost:5432`        | trinity_admin / Tr1n1ty_Db@2026_SecureP4ss! |
| pgAdmin    | `http://localhost:5050` | admin@trinity.local / admin                 |

---

## 🏭 F. Docker Compose - Production

### F1. Production Configuration

```yaml
# docker-compose.yml (root directory)
version: "3.8"

services:
  # Frontend - React SPA served by Nginx
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

  # Backend - NestJS API Server
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

  # PostgreSQL Database
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

networks:
  trinity-network:
    driver: bridge
    name: trinity-network

volumes:
  postgres_data:
    name: trinity-postgres-data
```

### F2. Environment File for Production

```bash
# .env (production)

# Database
DATABASE_URL="postgresql://trinity_admin:SECURE_PASSWORD@postgres:5432/trinity_inventory"
POSTGRES_USER=trinity_admin
POSTGRES_PASSWORD=SECURE_PASSWORD
POSTGRES_DB=trinity_inventory

# JWT (generate with: openssl rand -hex 64)
JWT_SECRET="your-production-secret-64-characters-minimum-generate-with-openssl"
JWT_EXPIRATION=15m

# Application
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Ports
FRONTEND_PORT=80
BACKEND_PORT=3001
```

### F3. Production Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/trinity-inventory.git
cd trinity-inventory

# 2. Create .env file
cp .env.example .env
nano .env  # Edit with production values

# 3. Build images
docker compose build

# 4. Start all services
docker compose up -d

# 5. Check status
docker compose ps

# 6. View logs
docker compose logs -f

# 7. Run database migrations
docker compose exec backend npx prisma migrate deploy
```

---

## 🔧 G. Common Docker Commands

### G1. Container Management

```bash
# List running containers
docker compose ps

# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# Restart specific service
docker compose restart backend
```

### G2. Logs

```bash
# View all logs
docker compose logs

# Follow logs
docker compose logs -f

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# View last 100 lines
docker compose logs --tail=100 backend
```

### G3. Shell Access

```bash
# Access backend container
docker compose exec backend sh

# Access database
docker compose exec postgres psql -U trinity_admin -d trinity_assetflow

# Run command in container
docker compose exec backend npx prisma studio
```

### G4. Image Management

```bash
# Build images
docker compose build

# Build specific service
docker compose build backend

# Build without cache
docker compose build --no-cache

# Pull latest images
docker compose pull
```

### G5. Cleanup

```bash
# Remove stopped containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Prune unused images
docker image prune -a

# Prune everything (WARNING)
docker system prune -a --volumes
```

---

## 📊 H. Monitoring & Health Checks

### H1. Health Check Endpoints

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health
curl http://localhost/health

# Database health
docker compose exec postgres pg_isready -U trinity_admin
```

### H2. Container Stats

```bash
# View resource usage
docker stats

# View specific containers
docker stats trinity-backend trinity-frontend trinity-db
```

### H3. Inspect Container

```bash
# Inspect container configuration
docker inspect trinity-backend

# Inspect network
docker network inspect trinity-network

# Inspect volume
docker volume inspect trinity-postgres-data
```

---

## 🔒 I. Security Best Practices

### I1. Non-Root Users

Semua Dockerfile sudah menggunakan non-root user:

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S trinity && \
    adduser -S trinity -u 1001 -G trinity

# Switch to non-root user
USER trinity
```

### I2. Secrets Management

```bash
# Use Docker secrets (Swarm mode)
echo "my-secret-password" | docker secret create db_password -

# Or use environment files
# Never commit .env to git
echo ".env" >> .gitignore
```

### I3. Network Security

```yaml
# Limit network exposure
services:
  postgres:
    # Don't expose port to host in production
    # ports:
    #   - "5432:5432"  # Comment out
    networks:
      - trinity-network # Only internal network
```

### I4. Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "0.5"
          memory: 512M
```

---

## 💾 J. Backup & Restore

### J1. Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U trinity_admin trinity_assetflow > backup_$(date +%Y%m%d).sql

# Create compressed backup
docker compose exec postgres pg_dump -U trinity_admin trinity_assetflow | gzip > backup_$(date +%Y%m%d).sql.gz
```

### J2. Database Restore

```bash
# Restore from backup
docker compose exec -T postgres psql -U trinity_admin trinity_assetflow < backup_20260122.sql

# Restore from compressed
gunzip -c backup_20260122.sql.gz | docker compose exec -T postgres psql -U trinity_admin trinity_assetflow
```

### J3. Volume Backup

```bash
# Backup volume to tar
docker run --rm -v trinity-postgres-data:/data -v $(pwd):/backup alpine tar cvf /backup/postgres-backup.tar /data

# Restore volume from tar
docker run --rm -v trinity-postgres-data:/data -v $(pwd):/backup alpine tar xvf /backup/postgres-backup.tar -C /
```

---

## 🚀 K. Deployment Scenarios

### K1. Single Server Deployment

```bash
# 1. SSH to server
ssh user@server

# 2. Clone repository
git clone https://github.com/your-org/trinity.git
cd trinity

# 3. Configure environment
cp .env.example .env
nano .env

# 4. Build and start
docker compose up -d --build

# 5. Check status
docker compose ps
```

### K2. Update Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build new images
docker compose build

# 3. Apply database migrations
docker compose exec backend npx prisma migrate deploy

# 4. Restart services
docker compose up -d

# 5. Verify
docker compose ps
curl http://localhost:3001/health
```

### K3. Zero-Downtime Deployment

```bash
# 1. Build new images
docker compose build

# 2. Start new containers (old still running)
docker compose up -d --no-deps --scale backend=2 backend

# 3. Wait for new container to be healthy
sleep 30

# 4. Remove old container
docker compose up -d --no-deps --scale backend=1 backend
```

---

## 🔍 L. Troubleshooting

### L1. Common Issues

| Issue                       | Cause                      | Solution                                        |
| --------------------------- | -------------------------- | ----------------------------------------------- |
| Container exits immediately | Error in startup           | Check logs: `docker compose logs backend`       |
| Cannot connect to database  | Network issue              | Check network: `docker network inspect`         |
| Port already in use         | Another service using port | Change port in .env or stop conflicting service |
| Build fails                 | Missing dependencies       | Check Dockerfile, run with `--no-cache`         |
| Health check failing        | Service not ready          | Increase `start_period` in healthcheck          |

### L2. Debug Commands

```bash
# Check container status
docker compose ps

# View detailed container info
docker inspect trinity-backend

# Check container logs
docker compose logs --tail=100 backend

# Access container shell
docker compose exec backend sh

# Check network connectivity
docker compose exec backend ping postgres

# Check environment variables
docker compose exec backend env
```

### L3. Reset Everything

```bash
# Stop all containers
docker compose down

# Remove all volumes
docker compose down -v

# Remove all images
docker compose down --rmi all

# Prune system
docker system prune -a --volumes

# Start fresh
docker compose up -d --build
```

---

## 📚 M. Additional Resources

### M1. Related Documentation

- [Backend Setup Guide](BACKEND_SETUP.md) - NestJS configuration
- [Frontend Setup Guide](FRONTEND_SETUP.md) - React/Vite configuration
- [Database Setup Guide](DATABASE_SETUP.md) - PostgreSQL & Prisma
- [Environment Configuration](ENVIRONMENT_CONFIG.md) - All environment variables

### M2. External Links

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file)
- [Nginx Documentation](https://nginx.org/en/docs)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

---

**© 2026 Trinity Asset Management System**
