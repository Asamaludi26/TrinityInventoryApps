# Database Security Guidelines

## 1. Overview

Dokumen ini menjelaskan standar keamanan database untuk aplikasi Trinity AssetFlow. Semua praktik keamanan harus diikuti untuk melindungi data sensitif.

## 2. Credential Management

### 2.1 Password Requirements

| Environment | Requirement                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| Development | Minimal 16 karakter, campuran huruf besar/kecil, angka, dan karakter spesial |
| Staging     | Minimal 24 karakter, generated secara random                                 |
| Production  | Minimal 32 karakter, generated secara random, rotasi setiap 90 hari          |

### 2.2 Generate Strong Password

```bash
# Generate 32 character random password
node -e "console.log(require('crypto').randomBytes(24).toString('base64').replace(/[+/=]/g, '').slice(0,32))"

# atau gunakan OpenSSL
openssl rand -base64 32 | tr -d '/+=' | head -c 32
```

### 2.3 Development Credentials (Current)

```
Host: localhost
Port: 5432
User: trinity_admin
Password: [See .env file - DO NOT commit to repository]
Database: trinity_assetflow
```

### 2.4 Environment Variable Pattern

```env
# Pattern yang benar (dengan URL encoding untuk karakter spesial)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Karakter yang perlu di-encode dalam URL:
# @ → %40
# : → %3A
# / → %2F
# $ → %24 (hindari menggunakan $ dalam password docker-compose)
```

## 3. Docker Security

### 3.1 Password dalam docker-compose.yml

- **JANGAN** gunakan karakter `$` dalam password karena akan diinterpretasi sebagai variable
- Gunakan single quotes untuk password dengan karakter spesial
- Untuk production, gunakan Docker Secrets atau environment file eksternal

```yaml
# ✅ Benar
environment:
  POSTGRES_PASSWORD: 'MyP4ss_With@Special!'

# ❌ Salah - $ akan diinterpretasi sebagai variable
environment:
  POSTGRES_PASSWORD: MyP4ss$Variable
```

### 3.2 Docker Secrets (Production)

```yaml
services:
  db:
    image: postgres:16-alpine
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    external: true
```

## 4. Network Security

### 4.1 Port Binding

- Development: Bind ke `localhost:5432` saja
- Production: Tidak expose port ke host, gunakan internal Docker network

```yaml
# Development
ports:
  - "127.0.0.1:5432:5432"

# Production - no port binding, internal network only
networks:
  - internal
```

### 4.2 PostgreSQL Authentication

- Selalu gunakan `scram-sha-256` untuk production
- Update `pg_hba.conf` untuk membatasi akses

```
# pg_hba.conf
# TYPE  DATABASE    USER          ADDRESS         METHOD
host    all         all           127.0.0.1/32    scram-sha-256
host    all         all           ::1/128         scram-sha-256
```

## 5. Application Security

### 5.1 Connection Pooling

```typescript
// Prisma dengan connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000,
});
```

### 5.2 SQL Injection Prevention

- Selalu gunakan Prisma ORM untuk query
- JANGAN pernah gunakan string interpolation untuk query

```typescript
// ✅ Benar - menggunakan Prisma
const users = await prisma.user.findMany({
  where: { email: userInput },
});

// ❌ Salah - vulnerable to SQL injection
const result = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${userInput}'`,
);
```

## 6. Backup & Recovery

### 6.1 Automated Backups

```bash
# Daily backup script
pg_dump -U trinity_admin -h localhost trinity_assetflow | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 6.2 Encryption at Rest

- Production database harus menggunakan encrypted volumes
- Backup harus di-encrypt dengan GPG atau AES-256

## 7. Monitoring & Audit

### 7.1 Enable Logging

```sql
-- postgresql.conf
log_statement = 'ddl'
log_connections = on
log_disconnections = on
```

### 7.2 Activity Logging

Aplikasi mencatat semua perubahan data melalui model `ActivityLog`:

```prisma
model ActivityLog {
  id          Int      @id @default(autoincrement())
  entityType  String   // "Asset", "Request", "User", etc.
  entityId    String
  action      String   // "CREATE", "UPDATE", "DELETE"
  changes     Json?
  performedBy String
  createdAt   DateTime @default(now())
}
```

## 8. Checklist Deployment

- [ ] Password database sudah di-generate dengan minimum 32 karakter random
- [ ] Environment variables tidak di-commit ke repository
- [ ] Docker secrets digunakan untuk credential management
- [ ] Database tidak expose port ke public network
- [ ] SSL/TLS enabled untuk koneksi database
- [ ] Backup otomatis sudah dikonfigurasi
- [ ] Log audit sudah diaktifkan
- [ ] User database memiliki privilege minimum yang diperlukan

## 9. Credential Rotation

### Schedule

| Environment | Rotation Interval                           |
| ----------- | ------------------------------------------- |
| Development | Per milestone/release                       |
| Staging     | Setiap 30 hari                              |
| Production  | Setiap 90 hari atau segera setelah incident |

### Rotation Steps

1. Generate password baru
2. Update database user password
3. Update environment variables
4. Restart aplikasi
5. Verify koneksi berhasil
6. Invalidate password lama
7. Update dokumentasi internal

---

_Last Updated: January 2026_
_Version: 1.0.0_
