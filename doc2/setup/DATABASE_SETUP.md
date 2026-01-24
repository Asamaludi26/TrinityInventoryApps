# 🗄️ Database Setup Guide - PostgreSQL & Prisma

## 📋 Dokumentasi Lengkap Setup dan Konfigurasi Database

Panduan komprehensif untuk setup, konfigurasi, dan manajemen database PostgreSQL dengan Prisma ORM untuk Trinity Asset Management.

---

## 📊 Informasi Teknis

| Aspek               | Detail                            |
| ------------------- | --------------------------------- |
| **Database**        | PostgreSQL 16/17 Alpine           |
| **ORM**             | Prisma 7.2.0                      |
| **Prisma Client**   | Generated to `./generated/prisma` |
| **Schema Location** | `backend/prisma/schema.prisma`    |
| **Total Models**    | 27+ tables                        |
| **Total Enums**     | 15 enums                          |
| **Port**            | 5432                              |

---

## 🛠️ A. PostgreSQL Setup

### A1. Menggunakan Docker (Recommended)

```bash
# Navigate to backend directory
cd backend

# Start PostgreSQL container
docker compose -f docker-compose.dev.yml up -d db

# Verify container running
docker compose -f docker-compose.dev.yml ps

# Expected output:
# NAME              STATUS         PORTS
# trinity-postgres  Up (healthy)   0.0.0.0:5432->5432/tcp
```

### A2. Docker Compose Configuration

```yaml
# backend/docker-compose.dev.yml
services:
  db:
    image: postgres:16-alpine
    container_name: trinity-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: trinity_admin
      POSTGRES_PASSWORD: "Tr1n1ty_Db2026_SecureP4ss"
      POSTGRES_DB: trinity_inventory_db
    ports:
      - "5432:5432"
    volumes:
      - trinity_postgres_db_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trinity_admin -d trinity_inventory_db"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  trinity_postgres_db_data:
```

### A3. Instalasi PostgreSQL Native (Alternative)

#### Windows

```bash
# Download PostgreSQL dari https://www.postgresql.org/download/windows/
# Atau menggunakan Chocolatey:
choco install postgresql

# Start service
net start postgresql-x64-17
```

#### macOS

```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16
```

#### Linux (Debian/Ubuntu)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### A4. Create Database & User

```sql
-- Connect to PostgreSQL
\backend> docker exec -it trinity-postgres psql -U trinity_admin

-- Create user
CREATE USER trinity_admin WITH PASSWORD 'Tr1n1ty_Db@2026_SecureP4ss';

-- Create database
CREATE DATABASE trinity_inventory_db OWNER trinity_admin;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE trinity_inventory_db TO trinity_admin;

-- Connect to database
\c trinity_inventory_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO trinity_admin;
```

### A5. Common psql Commands

Dalam lingkungan terminal PostgreSQL (psql), terdapat dua jenis perintah yang bekerja secara berbeda:

Meta-Commands (Slash Commands): Dimulai dengan garis miring terbalik (\). Ini adalah perintah navigasi internal psql (bukan bahasa SQL standar). Perintah ini tidak memerlukan titik koma (;) di akhir.

SQL Commands: Bahasa database standar (SELECT, CREATE, dll). Perintah ini wajib diakhiri dengan titik koma (;).

-- Perintah,Deskripsi & Kegunaan
\l,List Databases. Menampilkan daftar semua database yang ada di server ini. Berguna untuk memastikan apakah database yang Anda buat (trinity_inventory) benar-benar sudah terbentuk.
\c <nama_db>,Connect. Berpindah masuk ke database lain. Contoh: \c trinity_inventory. Prompt Anda akan berubah sesuai nama database tujuan.
\dn,"List Schemas. Menampilkan daftar skema. Secara default PostgreSQL menggunakan skema public, namun dalam aplikasi kompleks, Anda mungkin memisahkan tabel ke dalam skema berbeda."
\du,"List Users/Roles. Menampilkan daftar user yang terdaftar beserta hak aksesnya (Superuser, Create DB, dll). Gunakan ini untuk memverifikasi apakah user trinity_admin Anda sudah memiliki atribut yang benar."

-- Perintah,Deskripsi & Kegunaan

\dt,"List Tables. Menampilkan daftar semua tabel dalam database saat ini. Jika migrasi Prisma sukses, Anda akan melihat tabel User, Inventory, dll di sini."
\d <nama_tabel>,"Describe Table. Menampilkan struktur detail dari sebuah tabel (nama kolom, tipe data, primary key, foreign key, dan index). Contoh: \d User. Ini sangat krusial untuk debugging jika tipe data di Prisma tidak sesuai dengan di database."
\di,List Indexes. Menampilkan daftar index yang ada. Berguna untuk optimasi performa query.

-- Utilitas & Tampilan

Perintah,Deskripsi & Kegunaan
\x,"Expanded Display (Toggle). Mengubah tampilan output dari horizontal (tabel biasa) menjadi vertikal (kartu). Sangat berguna jika tabel Anda memiliki banyak kolom sehingga tampilannya pecah/berantakan di terminal. Ketik \x sekali untuk menyalakan, dan ketik lagi untuk mematikan."
\q,Quit. Keluar dari terminal psql dan kembali ke shell Docker/Windows.
\?,Help. Menampilkan daftar lengkap semua perintah slash (\) yang tersedia.
\h <perintah>,SQL Help. Menampilkan sintaks bantuan untuk perintah SQL tertentu. Contoh: \h CREATE TABLE.

-- Melihat data
SELECT \* FROM "User";

### A6. Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA

# Development
DATABASE_URL="postgresql://trinity_admin:Tr1n1ty_Db2026_SecureP4ss@localhost:5432/trinity_inventory_db?schema=public"

# Production (example)
DATABASE_URL="postgresql://trinity_admin:PRODUCTION_PASSWORD@db.example.com:5432/trinity_inventory_db?schema=public"
```

---

## 🔷 B. Prisma Setup

### B1. Prisma Installation

```bash
cd backend

  # Install Prisma CLI (dev dependency)
  pnpm add -D prisma

  # Install Prisma Client (runtime dependency)
  pnpm add @prisma/client
```

### B2. Initialize Prisma (First Time Only)

```bash
# Initialize Prisma in project
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env (with DATABASE_URL placeholder)
```

### B3. Generate Prisma Client

```bash
# Generate client from schema
pnpm prisma:generate

# Or directly
npx prisma generate

# Output:
# ✔ Generated Prisma Client (v7.2.0) to ./generated/prisma
```

### B4. Prisma Schema Structure

```prisma
// prisma/schema.prisma

// Generator configuration
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

// Database connection
datasource db {
  provider = "postgresql"
}

// Models defined below...
```

---

## 📦 C. Database Schema Overview

### C1. Entity Relationship Diagram (Simplified)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Division   │────<│    User     │────<│ UserPreference│
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Request   │   │ LoanRequest │   │    Asset    │
└─────────────┘   └─────────────┘   └─────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ RequestItem │   │  LoanItem   │   │ StockMovement│
└─────────────┘   └─────────────┘   └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Customer   │────<│Installation │     │ Maintenance │
└─────────────┘     └─────────────┘     └─────────────┘
```

### C2. Model Categories

| Category             | Models                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Master Data**      | Division, User, UserPreference                                                                                                       |
| **Asset Hierarchy**  | AssetCategory, AssetType, StandardItem                                                                                               |
| **Core Assets**      | Asset, StockThreshold, StockMovement                                                                                                 |
| **Requests**         | Request, RequestItem, RequestActivity                                                                                                |
| **Loans**            | LoanRequest, LoanItem, LoanAssetAssignment, AssetReturn, AssetReturnItem                                                             |
| **Handover**         | Handover, HandoverItem                                                                                                               |
| **Field Operations** | Customer, Installation, InstallationMaterial, Maintenance, MaintenanceMaterial, MaintenanceReplacement, Dismantle, InstalledMaterial |
| **System**           | Notification, ActivityLog, Attachment, WhatsAppLog, SystemConfig                                                                     |

### C3. Key Enums

```prisma
// User Roles
enum UserRole {
  SUPER_ADMIN    @map("Super Admin")
  ADMIN_LOGISTIK @map("Admin Logistik")
  ADMIN_PURCHASE @map("Admin Purchase")
  LEADER         @map("Leader")
  STAFF          @map("Staff")
}

// Asset Status
enum AssetStatus {
  IN_STORAGE      @map("Di Gudang")
  IN_USE          @map("Digunakan")
  IN_CUSTODY      @map("Dipegang (Custody)")
  UNDER_REPAIR    @map("Dalam Perbaikan")
  OUT_FOR_REPAIR  @map("Keluar (Service)")
  DAMAGED         @map("Rusak")
  DECOMMISSIONED  @map("Diberhentikan")
  AWAITING_RETURN @map("Menunggu Pengembalian")
  CONSUMED        @map("Habis Terpakai")
}

// Asset Condition
enum AssetCondition {
  BRAND_NEW    @map("Baru")
  GOOD         @map("Baik")
  USED_OKAY    @map("Bekas Layak Pakai")
  MINOR_DAMAGE @map("Rusak Ringan")
  MAJOR_DAMAGE @map("Rusak Berat")
  FOR_PARTS    @map("Kanibal")
}

// Item Status (Request/Handover)
enum ItemStatus {
  PENDING               @map("Menunggu")
  LOGISTIC_APPROVED     @map("Disetujui Logistik")
  AWAITING_CEO_APPROVAL @map("Menunggu CEO")
  APPROVED              @map("Disetujui")
  PURCHASING            @map("Proses Pembelian")
  IN_DELIVERY           @map("Dalam Pengiriman")
  ARRIVED               @map("Tiba")
  COMPLETED             @map("Selesai")
  REJECTED              @map("Ditolak")
  CANCELLED             @map("Dibatalkan")
  AWAITING_HANDOVER     @map("Siap Serah Terima")
  IN_PROGRESS           @map("Dalam Proses")
}
```

---

## 📝 D. Database Migrations

### D1. Create Migration (Development)

```bash
# Create and apply migration
pnpm prisma:migrate

# Enter migration name when prompted:
# → add_customer_table
# → update_asset_fields
# → add_notification_system
```

### D2. Apply Migration (Production)

```bash
# Apply pending migrations to production database
pnpm prisma:migrate:prod

# Or directly
npx prisma migrate deploy
```

### D3. Migration Commands

```bash
# Create migration without applying
npx prisma migrate dev --create-only --name migration_name

# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
pnpm prisma:reset
# Or
npx prisma migrate reset --force
```

### D4. Migration Files Structure

```
prisma/
├── schema.prisma          # Main schema file
├── migrations/
│   ├── 20260101000000_initial/
│   │   └── migration.sql
│   ├── 20260115000000_add_customer/
│   │   └── migration.sql
│   └── migration_lock.toml
└── seed.ts                # Database seeding script
```

### D5. Example Migration SQL

```sql
-- prisma/migrations/20260115000000_add_customer/migration.sql

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" "customer_status" NOT NULL,
    "installation_date" DATE NOT NULL,
    "service_package" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");
CREATE INDEX "customers_name_address_idx" ON "customers"("name", "address");
```

---

## 🌱 E. Database Seeding

### E1. Seed Script

// 1. Load Environment Variables (WAJIB agar DATABASE_URL terbaca)
import 'dotenv/config';

// 2. Import dari library standar, BUKAN dari generated folder
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// 3. Import Driver Adapter (Sama seperti di prisma.service.ts)
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 4. Inisialisasi Prisma dengan Adapter
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
console.log('🌱 Start seeding...');

// Create divisions
const divisionLogistik = await prisma.division.upsert({
where: { name: 'Logistik' },
update: {},
create: { name: 'Logistik' },
});

const divisionPurchase = await prisma.division.upsert({
where: { name: 'Purchase' },
update: {},
create: { name: 'Purchase' },
});

// Create admin user
// (Menggunakan 10 rounds sudah cukup aman dan lebih cepat daripada 12 untuk dev)
const hashedPassword = await bcrypt.hash('admin123', 10);

const admin = await prisma.user.upsert({
where: { email: 'admin@trinity.com' }, // Pastikan ini sesuai dengan logic login Anda
update: {
password: hashedPassword, // Paksa update password
isActive: true, // Sekalian pastikan aktif
},
create: {
name: 'Super Admin',
email: 'admin@trinity.com',
password: hashedPassword,
role: 'SUPER_ADMIN', // PERHATIKAN: Pastikan value ini ada di ENUM Role Anda di schema.prisma
divisionId: divisionLogistik.id,
isActive: true,
// permissions: ['*'], // Hapus baris ini jika kolom permissions tidak ada di schema User
},
});

console.log('👤 Admin created:', admin.email);

// Create asset categories
const categories = [
{ name: 'Network Equipment', isCustomerInstallable: true },
{ name: 'Computer Hardware', isCustomerInstallable: false },
{ name: 'Office Equipment', isCustomerInstallable: false },
{ name: 'Cable & Accessories', isCustomerInstallable: true },
];

for (const cat of categories) {
await prisma.assetCategory.upsert({
where: { name: cat.name },
update: {},
create: cat,
});
}

console.log('✅ Seeding completed.');
}

main()
.catch(e => {
console.error('❌ Seeding failed:', e);
process.exit(1);
})
.finally(async () => {
// Tutup koneksi dengan benar
await prisma.$disconnect();
});

### E2. Run Seed

```bash
# Run seeding script
pnpm prisma:seed

# Or directly
npx prisma db seed
```

### E3. Configure Seed in package.json

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 🔧 F. Prisma Studio

### F1. Open Prisma Studio

```bash
# Start Prisma Studio GUI
pnpm prisma:studio

# Or directly
npx prisma studio

# Opens at http://localhost:5555
```

### F2. Prisma Studio Features

- Browse all tables and records
- Add, edit, delete records
- Filter and search data
- View relations between tables
- Export data

---

## 💾 G. Backup & Restore

### G1. Database Backup

#### G1.1 Using pg_dump

    ```bash
    # Using pg_dump via Docker
    docker compose exec db pg_dump -U trinity_admin trinity_inventory_db > backup_$(date +%Y%m%d_%H%M%S).sql

    # With compression
    docker compose exec db pg_dump -U trinity_admin trinity_inventory_db | gzip > backup_$(date +%Y%m%d).sql.gz

    # Native pg_dump
    pg_dump -h localhost -U trinity_admin -d trinity_inventory_db -F c -f backup.dump
    ```

#### G1.2 Using Windows Script

    Directly run the PowerShell script provided in `scripts/backup-db.ps1`:

    # Run the backup script

    .\scripts\backup-db.ps1

### G2. Database Restore

#### G2.1 Using psql and pg_restore

    ```bash
    # From SQL file
    docker compose exec -T db psql -U trinity_admin trinity_inventory_db < backup_20260122.sql

    # From compressed file
    gunzip -c backup_20260122.sql.gz | docker compose exec -T db psql -U trinity_admin trinity_inventory_db

    # From custom format dump
    pg_restore -h localhost -U trinity_admin -d trinity_inventory_db -c backup.dump
    ```

#### G2.2 Using Windows Script

    Directly run the PowerShell script provided in `scripts/restore-db.ps1`:

    # Run the restore script
    .\scripts\restore-db.ps1 -BackupFilePath "..\backups\backupfile.sql"

    #Example:
    .\scripts\restore-db.ps1 -BackupFilePath "..\backups\backup_20260122.sql"
    ```

### G3. Automated Backup Script

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/mnt/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/trinity_$TIMESTAMP.sql.gz"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create backup
docker compose exec -T db pg_dump -U trinity_admin trinity_inventory_db | gzip > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "trinity_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Add to crontab:

```bash
# Run daily at 2 AM
0 2 * * * /opt/trinity/backup-database.sh >> /var/log/trinity-backup.log 2>&1
```

---

## ⚡ H. Performance Optimization

### H1. Indexing Strategy

```prisma
// Already defined indexes in schema
model Asset {
  // ...fields...

  @@index([status, categoryId])     // Filter by status and category
  @@index([serialNumber])            // Search by serial number
  @@index([macAddress])              // Search by MAC address
  @@index([currentUserId])           // Filter by user
  @@index([brand, name])             // Search by brand and name
  @@index([name, brand, notes])      // Full-text-like search
}

model Request {
  // ...fields...

  @@index([status, requestDate])     // Filter by status and date
  @@index([requesterId, divisionId]) // Filter by requester
  @@index([docNumber])               // Search by document number
  @@index([isRegistered])            // Filter by registration status
}
```

### H2. Query Optimization Tips

```typescript
// Use select to reduce data transfer
const assets = await prisma.asset.findMany({
  select: {
    id: true,
    name: true,
    brand: true,
    status: true,
  },
});

// Use include sparingly
const asset = await prisma.asset.findUnique({
  where: { id: assetId },
  include: {
    category: true,
    type: true,
    // Don't include heavy relations if not needed
  },
});

// Pagination
const assets = await prisma.asset.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" },
});
```

### H3. Connection Pooling

```typescript
// In NestJS Prisma Service
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ["error", "warn"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

---

## 🔒 I. Security Best Practices

### I1. Environment Variables

```bash
# Never commit .env to git
# Use strong passwords
DATABASE_URL="postgresql://trinity_admin:YOUR_STRONG_PASSWORD@localhost:5432/trinity_inventory_db"

# Password requirements:
# - Minimum 16 characters
# - Mix of uppercase, lowercase, numbers, special characters
```

### I2. User Privileges (Production)

```sql
-- Create read-only user for reporting
CREATE USER trinity_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE trinity_inventory_db TO trinity_readonly;
GRANT USAGE ON SCHEMA public TO trinity_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO trinity_readonly;

-- Create application user with limited privileges
CREATE USER trinity_app WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE trinity_inventory_db TO trinity_app;
GRANT USAGE ON SCHEMA public TO trinity_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO trinity_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO trinity_app;
```

### I3. SSL Connection (Production)

```
# Enable SSL in connection string
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# SSL modes:
# - disable: No SSL
# - allow: Try SSL, fallback to non-SSL
# - prefer: Try SSL, fallback to non-SSL (default)
# - require: Require SSL
# - verify-ca: Require SSL + verify server certificate
# - verify-full: Require SSL + verify server certificate + hostname
```

---

## 🔍 J. Troubleshooting

### J1. Common Issues

| Issue                     | Cause                  | Solution                           |
| ------------------------- | ---------------------- | ---------------------------------- |
| `Connection refused`      | PostgreSQL not running | Start PostgreSQL container/service |
| `Authentication failed`   | Wrong credentials      | Check DATABASE_URL in .env         |
| `Database does not exist` | DB not created         | Create database manually           |
| `Migration failed`        | Schema conflicts       | Reset DB or fix schema             |
| `Prisma Client not found` | Not generated          | Run `pnpm prisma:generate`         |

### J2. Debug Commands

```bash
# Check PostgreSQL container logs
docker compose logs db

# Connect to database directly
docker compose exec db psql -U trinity_admin -d trinity_inventory_db

# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

### J3. Reset Database (Development Only)

```bash
# Reset database and apply all migrations
npx prisma migrate reset --force

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Run seed (if configured)
```

### J4. Common SQL Commands

```sql
-- List all tables
\dt

-- Describe table structure
\d assets

-- List all users
SELECT id, email, role FROM users;

-- Check table sizes
SELECT
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'trinity_inventory_db';
```

---

## 📊 K. Database Schema Reference

### K1. Complete Model List

| Model                  | Table Name                 | Description                    |
| ---------------------- | -------------------------- | ------------------------------ |
| Division               | `divisions`                | Organizational divisions       |
| User                   | `users`                    | User accounts                  |
| UserPreference         | `user_preferences`         | User settings                  |
| AssetCategory          | `asset_categories`         | Asset categories               |
| AssetType              | `asset_types`              | Asset types under categories   |
| StandardItem           | `standard_items`           | Standard item definitions      |
| Asset                  | `assets`                   | Core asset records             |
| StockThreshold         | `stock_thresholds`         | Low stock alerts               |
| StockMovement          | `stock_movements`          | Stock in/out tracking          |
| Request                | `requests`                 | Procurement requests           |
| RequestItem            | `request_items`            | Items in requests              |
| RequestActivity        | `request_activities`       | Request timeline               |
| LoanRequest            | `loan_requests`            | Loan requests                  |
| LoanItem               | `loan_items`               | Items in loan requests         |
| LoanAssetAssignment    | `loan_asset_assignments`   | Asset-to-loan mapping          |
| AssetReturn            | `asset_returns`            | Return records                 |
| AssetReturnItem        | `asset_return_items`       | Items in returns               |
| Handover               | `handovers`                | Handover documents             |
| HandoverItem           | `handover_items`           | Items in handovers             |
| Customer               | `customers`                | Customer records               |
| Installation           | `installations`            | Installation records           |
| InstallationMaterial   | `installation_materials`   | Materials used in installation |
| InstalledMaterial      | `installed_materials`      | Materials at customer site     |
| Maintenance            | `maintenances`             | Maintenance records            |
| MaintenanceMaterial    | `maintenance_materials`    | Materials used in maintenance  |
| MaintenanceReplacement | `maintenance_replacements` | Asset replacements             |
| Dismantle              | `dismantles`               | Dismantle records              |
| Notification           | `notifications`            | User notifications             |
| ActivityLog            | `activity_logs`            | System activity log            |
| Attachment             | `attachments`              | File attachments               |
| WhatsAppLog            | `whatsapp_logs`            | WhatsApp message logs          |
| SystemConfig           | `system_configs`           | System configuration           |

---

## 📚 L. Additional Resources

### L1. Related Documentation

- [Backend Setup Guide](BACKEND_SETUP.md) - NestJS configuration
- [Docker Setup Guide](DOCKER_COMPLETE.md) - Container setup
- [Environment Configuration](ENVIRONMENT_CONFIG.md) - All environment variables

### L2. External Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**© 2026 Trinity Asset Management System**
