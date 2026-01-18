# Database Error Documentation

Dokumentasi error dan bug fixes untuk database (PostgreSQL, Prisma).

## 📋 Daftar Error

| Tanggal    | Severity | Status   | File                           | Deskripsi                                     |
| ---------- | -------- | -------- | ------------------------------ | --------------------------------------------- |
| 2026-01-18 | CRITICAL | RESOLVED | prisma.config.ts, .env, docker | Prisma 7 config error & authentication failed |

## 📊 Statistik

- **Total Error**: 1
- **Resolved**: 1
- **Open**: 0

---

## 🔧 Resolved Issues

### 2026-01-18: Prisma 7 Configuration & Database Authentication

**Severity**: CRITICAL  
**Status**: ✅ RESOLVED

#### Problem

1. Prisma CLI error: `The datasource.url property is required in your Prisma config file`
2. Database authentication failed: `P1000: Authentication failed against database server`

#### Root Cause Analysis

1. **Prisma 7 Breaking Change**: Property `datasourceUrl` tidak valid. Prisma 7.x menggunakan struktur `datasource: { url: string }` bukan `datasourceUrl: string`
2. **Environment Variable Cache**: PowerShell session menyimpan `DATABASE_URL` lama yang override file `.env`
3. **Docker Volume Persistence**: Volume PostgreSQL menyimpan credential lama yang berbeda dengan konfigurasi baru

#### Solution

**1. Prisma Config (prisma.config.ts)**

```typescript
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"), // Gunakan datasource.url, bukan datasourceUrl
  },
});
```

**2. Environment Variables (.env)**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trinity_assetflow?schema=public"
```

**3. Docker Compose (docker-compose.dev.yml)**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: trinity-db-dev
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres # Harus sama dengan .env
      POSTGRES_DB: trinity_assetflow
```

**4. Reset Commands**

```bash
# Hapus container & volume lama
docker compose -f docker-compose.dev.yml down -v

# Jalankan ulang dengan config baru
docker compose -f docker-compose.dev.yml up -d

# Set environment variable di terminal (jika masih cached)
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/trinity_assetflow?schema=public"

# Push schema
npx prisma db push
```

#### Prevention

- Selalu gunakan kredensial yang konsisten antara `.env`, `docker-compose.yml`, dan `prisma.config.ts`
- Hapus volume Docker saat mengubah password database
- Buka terminal baru jika environment variable tidak update
