# 📚 Documentation Reference Index

> **Quick Navigation Hub untuk Dokumentasi Trinity Asset Flow**

Dokumen ini berfungsi sebagai peta navigasi dan referensi cepat untuk seluruh dokumentasi proyek. Gunakan sebagai titik awal untuk menemukan informasi yang Anda butuhkan.

---

## 🎯 Quick Links by Role

### 👨‍💻 Developer Baru (Onboarding)

1. [Getting Started](02_DEVELOPMENT_GUIDES/GETTING_STARTED.md) - Setup environment
2. [Frontend Guide](02_DEVELOPMENT_GUIDES/FRONTEND_GUIDE.md) - Arsitektur frontend
3. [Coding Standards](03_STANDARDS_AND_PROCEDURES/CODING_STANDARDS.md) - Konvensi kode
4. [Contributing](03_STANDARDS_AND_PROCEDURES/CONTRIBUTING.md) - Alur kerja PR

### 🏗️ Backend Developer

1. [Backend Guide](02_DEVELOPMENT_GUIDES/BACKEND_GUIDE.md) - Arsitektur NestJS
2. [API Reference](02_DEVELOPMENT_GUIDES/API_REFERENCE.md) - Endpoint specifications
3. [Database Schema](01_CONCEPT_AND_ARCHITECTURE/DATABASE_SCHEMA.md) - ERD & relasi
4. [Backend Integration Blueprint](02_DEVELOPMENT_GUIDES/BACKEND_INTEGRATION_BLUEPRINT.md) - Panduan integrasi

### 🎨 Frontend Developer

1. [Frontend Guide](02_DEVELOPMENT_GUIDES/FRONTEND_GUIDE.md) - Struktur & patterns
2. [State Management Guide](02_DEVELOPMENT_GUIDES/STATE_MANAGEMENT_GUIDE.md) - Zustand stores
3. [Design System](03_STANDARDS_AND_PROCEDURES/DESIGN_SYSTEM.md) - UI components
4. [Design Tokens](03_STANDARDS_AND_PROCEDURES/DESIGN_TOKENS.md) - Variabel desain
5. [Frontend-Backend Integration Plan](02_DEVELOPMENT_GUIDES/FRONTEND_BACKEND_INTEGRATION_PLAN.md) - 🆕 Roadmap integrasi

### 🔧 DevOps / SysAdmin

1. [DevOps Pipeline](04_OPERATIONS/DEVOPS_PIPELINE.md) - 🆕 CI/CD workflow lengkap
2. [Git Workflow](03_STANDARDS_AND_PROCEDURES/GIT_WORKFLOW.md) - Branching strategy & CI/CD
3. [Deployment Guide](04_OPERATIONS/DEPLOYMENT.md) - Deployment steps
4. [Debian 13 Guide](07_DEPLOYMENT/DEBIAN_13_GUIDE.md) - Server setup
5. [Infrastructure Guide](04_OPERATIONS/INFRASTRUCTURE_AND_DEPLOYMENT.md) - Arsitektur infra
6. [Backup & Recovery](04_OPERATIONS/BACKUP_AND_RECOVERY.md) - Prosedur backup

### 📋 Product Manager / Business Analyst

1. [Product Requirements](01_CONCEPT_AND_ARCHITECTURE/PRODUCT_REQUIREMENTS.md) - PRD
2. [Business Logic Flows](01_CONCEPT_AND_ARCHITECTURE/BUSINESS_LOGIC_FLOWS.md) - Alur bisnis
3. [User Guide](05_USER_DOCUMENTATION/USER_GUIDE.md) - Panduan pengguna
4. [RBAC Matrix](03_STANDARDS_AND_PROCEDURES/RBAC_MATRIX.md) - Permission matrix

---

## 📁 Documentation Structure

```
Docs/
├── 📋 FINAL_REPORT.md              # Executive summary & rekomendasi
├── 📖 GLOSARIUM.md                 # Terminologi & definisi
├── 📚 DOCUMENTATION_INDEX.md       # [Anda di sini]
│
├── 01_CONCEPT_AND_ARCHITECTURE/    # Arsitektur & Konsep
│   ├── ARCHITECTURE.md             # C4 diagrams, system overview
│   ├── BUSINESS_LOGIC_FLOWS.md     # Alur bisnis detail
│   ├── DATABASE_SCHEMA.md          # ERD, tabel, relasi
│   ├── PRODUCT_REQUIREMENTS.md     # PRD lengkap
│   ├── SYSTEM_DIAGRAMS.md          # Sequence & flow diagrams
│   ├── TECHNICAL_BLUEPRINT.md      # Technical specifications
│   ├── TECHNOLOGY_STACK.md         # Tech stack & justifikasi
│   └── ADR/                        # Architecture Decision Records
│       ├── 001-use-nestjs-for-backend.md
│       ├── 002-use-zustand-for-state-management.md
│       ├── 003-feature-based-folder-architecture.md
│       ├── 004-mock-first-development.md
│       ├── 005-rbac-with-granular-permissions.md
│       ├── 006-use-prisma-for-orm.md
│       ├── 007-use-tailwind-css.md
│       └── 008-monorepo-strategy.md
│
├── 02_DEVELOPMENT_GUIDES/          # Panduan Pengembangan
│   ├── GETTING_STARTED.md          # Quick start guide
│   ├── FRONTEND_GUIDE.md           # React/Vite development
│   ├── BACKEND_GUIDE.md            # NestJS development
│   ├── BACKEND_INTEGRATION_BLUEPRINT.md # Integration checklist
│   ├── BACKEND_IMPLEMENTATION_PROMPT.md # AI prompts for backend
│   ├── FRONTEND_BACKEND_INTEGRATION_PLAN.md # 🆕 Integration roadmap
│   ├── DESIGN_TOKEN_MIGRATION.md   # Color system migration guide
│   ├── API_REFERENCE.md            # REST API documentation
│   ├── API_ERROR_CODES.md          # Error code catalog
│   ├── STATE_MANAGEMENT_GUIDE.md   # Zustand store patterns
│   ├── PERFORMANCE_GUIDE.md        # Optimization techniques
│   ├── TESTING_GUIDE.md            # Testing strategies
│   └── TROUBLESHOOTING.md          # Common issues & solutions
│
├── 03_STANDARDS_AND_PROCEDURES/    # Standar & Prosedur
│   ├── CODING_STANDARDS.md         # Code conventions
│   ├── CONTRIBUTING.md             # PR workflow
│   ├── COMPONENT_API_SPEC.md       # Component specifications
│   ├── DESIGN_SYSTEM.md            # UI/UX guidelines
│   ├── DESIGN_TOKENS.md            # Design variables
│   ├── RBAC_MATRIX.md              # Role-permission mapping
│   ├── SECURITY_GUIDE.md           # Security best practices
│   ├── ERROR_HANDLING.md           # Error handling patterns
│   ├── VALIDATION_RULES.md         # Data validation
│   ├── LOGGING_STANDARDS.md        # Logging conventions
│   ├── ACCESSIBILITY_CHECKLIST.md  # A11y requirements
│   └── GIT_WORKFLOW.md             # Branching & CI/CD pipeline
│
├── 04_OPERATIONS/                  # Operasional
│   ├── DEPLOYMENT.md               # Deployment procedures
│   ├── DEVOPS_PIPELINE.md          # 🆕 CI/CD & DevOps workflow
│   ├── INFRASTRUCTURE_AND_DEPLOYMENT.md # Infra architecture
│   ├── BACKUP_AND_RECOVERY.md      # DR procedures
│   ├── MONITORING_AND_LOGGING.md   # Observability
│   └── INTEGRATIONS.md             # External integrations
│
├── 05_USER_DOCUMENTATION/          # Dokumentasi Pengguna
│   └── USER_GUIDE.md               # End-user manual
│
├── 06_FEATURES/                    # Dokumentasi per Fitur
│   ├── README.md                   # Feature overview
│   ├── 01_AUTHENTICATION/
│   ├── 02_DASHBOARD/
│   ├── 03_REQUESTS/
│   ├── 04_ASSET_REGISTRATION/
│   ├── 05_STOCK_MANAGEMENT/
│   ├── 06_HANDOVER/
│   ├── 07_REPAIR/
│   ├── 08_CUSTOMERS/
│   ├── 09_USER_MANAGEMENT/
│   └── 10_CATEGORIES/
│
├── 07_DEPLOYMENT/                  # Deployment Scripts
│   ├── DEBIAN_13_GUIDE.md
│   └── scripts/
│
├── Business/                       # Dokumen Bisnis
│   ├── perjanjian.md
│   └── quotation.md
│
└── CHANGELOG/                      # Version History
    ├── CHANGELOG.md
    └── releases/
```

---

## 🔗 Cross-Reference Matrix

### Topik → Dokumen Terkait

| Topik                | Dokumen Utama                                                                      | Dokumen Pendukung                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autentikasi**      | [01_AUTHENTICATION/OVERVIEW.md](06_FEATURES/01_AUTHENTICATION/OVERVIEW.md)         | [SECURITY_GUIDE.md](03_STANDARDS_AND_PROCEDURES/SECURITY_GUIDE.md), [RBAC_MATRIX.md](03_STANDARDS_AND_PROCEDURES/RBAC_MATRIX.md)                     |
| **Asset Management** | [04_ASSET_REGISTRATION/OVERVIEW.md](06_FEATURES/04_ASSET_REGISTRATION/OVERVIEW.md) | [DATABASE_SCHEMA.md](01_CONCEPT_AND_ARCHITECTURE/DATABASE_SCHEMA.md), [BUSINESS_LOGIC_FLOWS.md](01_CONCEPT_AND_ARCHITECTURE/BUSINESS_LOGIC_FLOWS.md) |
| **Request Workflow** | [03_REQUESTS/OVERVIEW.md](06_FEATURES/03_REQUESTS/OVERVIEW.md)                     | [STATE_MANAGEMENT_GUIDE.md](02_DEVELOPMENT_GUIDES/STATE_MANAGEMENT_GUIDE.md)                                                                         |
| **API Development**  | [API_REFERENCE.md](02_DEVELOPMENT_GUIDES/API_REFERENCE.md)                         | [API_ERROR_CODES.md](02_DEVELOPMENT_GUIDES/API_ERROR_CODES.md), [VALIDATION_RULES.md](03_STANDARDS_AND_PROCEDURES/VALIDATION_RULES.md)               |
| **State Management** | [STATE_MANAGEMENT_GUIDE.md](02_DEVELOPMENT_GUIDES/STATE_MANAGEMENT_GUIDE.md)       | [ADR-002](01_CONCEPT_AND_ARCHITECTURE/ADR/002-use-zustand-for-state-management.md)                                                                   |
| **Deployment**       | [GIT_WORKFLOW.md](03_STANDARDS_AND_PROCEDURES/GIT_WORKFLOW.md)                     | [DEPLOYMENT.md](04_OPERATIONS/DEPLOYMENT.md), [DEBIAN_13_GUIDE.md](07_DEPLOYMENT/DEBIAN_13_GUIDE.md)                                                 |
| **Testing**          | [TESTING_GUIDE.md](02_DEVELOPMENT_GUIDES/TESTING_GUIDE.md)                         | [CODING_STANDARDS.md](03_STANDARDS_AND_PROCEDURES/CODING_STANDARDS.md)                                                                               |
| **UI Components**    | [DESIGN_SYSTEM.md](03_STANDARDS_AND_PROCEDURES/DESIGN_SYSTEM.md)                   | [DESIGN_TOKENS.md](03_STANDARDS_AND_PROCEDURES/DESIGN_TOKENS.md), [COMPONENT_API_SPEC.md](03_STANDARDS_AND_PROCEDURES/COMPONENT_API_SPEC.md)         |

---

## 📊 Source Code Reference

### Stores (State Management)

| Store                  | Lokasi                               | Deskripsi                    |
| ---------------------- | ------------------------------------ | ---------------------------- |
| `useAuthStore`         | `src/stores/useAuthStore.ts`         | Autentikasi & session        |
| `useAssetStore`        | `src/stores/useAssetStore.ts`        | Assets, kategori, stok       |
| `useRequestStore`      | `src/stores/useRequestStore.ts`      | Procurement & loan           |
| `useTransactionStore`  | `src/stores/useTransactionStore.ts`  | Handover, instalasi, repair  |
| `useMasterDataStore`   | `src/stores/useMasterDataStore.ts`   | Users, divisions, customers  |
| `useUIStore`           | `src/stores/useUIStore.ts`           | Navigasi, modal states       |
| `useNotificationStore` | `src/stores/useNotificationStore.ts` | Toast & system notifications |

### Utilities

| Utility                      | Lokasi                                 | Fungsi                   |
| ---------------------------- | -------------------------------------- | ------------------------ |
| `permissions.ts`             | `src/utils/permissions.ts`             | RBAC permission checks   |
| `dateFormatter.ts`           | `src/utils/dateFormatter.ts`           | Format tanggal Indonesia |
| `documentNumberGenerator.ts` | `src/utils/documentNumberGenerator.ts` | Generate nomor dokumen   |
| `statusUtils.ts`             | `src/utils/statusUtils.ts`             | Status color mappings    |
| `csvExporter.ts`             | `src/utils/csvExporter.ts`             | Export data ke CSV       |
| `depreciation.ts`            | `src/utils/depreciation.ts`            | Kalkulasi penyusutan     |
| `uuid.ts`                    | `src/utils/uuid.ts`                    | Generate unique IDs      |

### Custom Hooks

| Hook                 | Lokasi                            | Kegunaan               |
| -------------------- | --------------------------------- | ---------------------- |
| `useGenericFilter`   | `src/hooks/useGenericFilter.ts`   | Reusable filter logic  |
| `useSortableData`    | `src/hooks/useSortableData.ts`    | Table sorting          |
| `useActionableItems` | `src/hooks/useActionableItems.ts` | Action item management |
| `useFileAttachment`  | `src/hooks/useFileAttachment.ts`  | File upload handling   |
| `useLongPress`       | `src/hooks/useLongPress.ts`       | Long press detection   |

### UI Components

| Kategori   | Lokasi                   | Komponen                                   |
| ---------- | ------------------------ | ------------------------------------------ |
| **Atomic** | `src/components/ui/`     | Button, Modal, Input, Badge, Tooltip, etc. |
| **Layout** | `src/components/layout/` | Sidebar, MainLayout, DetailPageLayout      |
| **Icons**  | `src/components/icons/`  | Custom SVG icons                           |

### Features

| Feature    | Lokasi                            | Halaman Utama          |
| ---------- | --------------------------------- | ---------------------- |
| Auth       | `src/features/auth/`              | LoginPage              |
| Dashboard  | `src/features/dashboard/`         | DashboardPage          |
| Assets     | `src/features/assetRegistration/` | RegistrationPage       |
| Requests   | `src/features/requests/`          | RequestHubPage         |
| Handover   | `src/features/handover/`          | HandoverPage           |
| Customers  | `src/features/customers/`         | CustomerPage           |
| Users      | `src/features/users/`             | UserManagementPage     |
| Categories | `src/features/categories/`        | CategoryManagementPage |
| Stock      | `src/features/stock/`             | StockPage              |
| Repair     | `src/features/repair/`            | RepairPage             |

---

## 🔄 Update Log

| Tanggal    | Perubahan                                                                  | Author |
| ---------- | -------------------------------------------------------------------------- | ------ |
| 2026-01-17 | Initial documentation index created                                        | System |
| 2026-01-17 | Added ADR documents 002-007                                                | System |
| 2026-01-17 | Added comprehensive guides (Error, Validation, Logging, Performance, A11y) | System |
| 2026-01-17 | Added GIT_WORKFLOW.md with CI/CD pipeline documentation                    | System |
| 2026-01-17 | Created GitHub Actions workflows (ci.yml, deploy-production.yml)           | System |
| 2026-01-17 | Added Docker configuration files and VM setup scripts                      | System |

---

## 📝 Notes for Maintainers

### Keeping Documentation Updated

1. **Setiap PR** yang mengubah fitur harus menyertakan update dokumentasi terkait
2. **ADR baru** harus dibuat untuk keputusan arsitektur signifikan
3. **CHANGELOG** harus diupdate untuk setiap release
4. **Cross-references** harus diverifikasi saat dokumen di-rename/delete

### Documentation Quality Checklist

- [ ] Dokumen memiliki heading yang jelas
- [ ] Code examples up-to-date dengan implementasi
- [ ] Links tidak broken
- [ ] Terminologi konsisten dengan GLOSARIUM.md
- [ ] Diagram masih akurat
