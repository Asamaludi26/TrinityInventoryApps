# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan dalam file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id-ID/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Implementasi backend NestJS dengan PostgreSQL
- Modul depresiasi aset otomatis
- Integrasi WhatsApp untuk notifikasi
- Aplikasi mobile untuk teknisi lapangan

---

## [2.0.0] - 2025-01-XX

### 🎉 Backend Implementation Release

Implementasi lengkap backend NestJS dengan Prisma ORM dan PostgreSQL.

> **Dokumentasi lengkap**: Lihat [backend-v1.0.0.md](releases/backend-v1.0.0.md)

### Added

#### Core Infrastructure

- NestJS Framework dengan CORS, ValidationPipe, global prefix `/api`
- Prisma ORM v7.2.0 dengan PostgreSQL adapter
- Database schema 20+ models (sesuai DATABASE_SCHEMA.md)
- JWT Authentication dengan Passport.js

#### API Modules

- **Auth** (`/api/auth`) - Login, register, token verification
- **Users** (`/api/users`, `/api/divisions`) - User & division management
- **Assets** (`/api/assets`) - CRUD, bulk create, stock consume, availability check
- **Requests** (`/api/requests`) - Multi-item requests, partial approval, asset registration
- **Loans** (`/api/loan-requests`, `/api/returns`) - Loan tracking, batch return processing
- **Transactions** (`/api/transactions`) - Handovers, installations, dismantles, maintenances
- **Customers** (`/api/customers`) - Customer management
- **Categories** (`/api/categories`) - 3-tier hierarchy (category → type → model)
- **Dashboard** (`/api/dashboard`) - Statistics, stock summary, trends, low-stock alerts
- **Notifications** (`/api/notifications`) - User notifications with read/unread tracking
- **Activity Logs** (`/api/activity-logs`) - Audit trail for all entity changes
- **Reports** (`/api/reports`) - Asset inventory, movements, requests, loans, maintenances

#### Database Seed

- 4 Divisions, 5 Users, 3 Categories, 3 Types, 3 Models
- Sample assets dan customers

### Technical Changes

- Prisma 7 adapter-based configuration
- JWT numeric seconds expiry (dari string)
- Proper Prisma nested write untuk request items

### Problems Resolved

- Prisma 7 breaking changes (datasource url)
- Missing @types/pg declarations
- @nestjs/mapped-types module not found
- JWT signOptions type mismatch
- UpdateUserDto password property missing
- RequestStatus include type narrowing
- Prisma nested update type mismatch

---

## [1.2.0] - 2025-01-20

### 📦 Frontend Dependencies & Code Quality Release

Rilis yang fokus pada instalasi dependensi produksi dan perbaikan kualitas kode untuk persiapan integrasi backend.

### Added

#### Dependencies Baru

- **jspdf** (v4.0.0): Library untuk generate PDF documents dari frontend
- **html2canvas** (v1.4.1): Library untuk capture HTML elements sebagai canvas/image
- **html5-qrcode** (v2.3.8): Library untuk QR code dan barcode scanning via kamera
- **qrcode.react** (v4.2.0): React component untuk generate QR code
- **recharts** (v3.6.0): Library charting untuk dashboard analytics

### Changed

#### Code Quality Improvements

- **PDF Export**: Refactored dari window globals ke proper ES module imports
  - `ReturnRequestDetailPage.tsx`: Removed `(window as any).jspdf` usage
  - `LoanRequestDetailPage.tsx`: Removed `(window as any).jspdf` usage
  - `InstallationDetailPage.tsx`: Removed `(window as any).jspdf` usage
  - `AssetPreview.tsx`: Removed `declare var html2canvas` usage
- **QR Scanner**: Refactored dari window globals ke proper ES module imports
  - `GlobalScannerModal.tsx`: Removed `declare var Html5Qrcode` usage
  - Now uses proper typed imports from `html5-qrcode` package

### Technical Notes

- Build output: 550 modules transformed
- TypeScript check: 0 errors
- Bundle size: ~1.9MB main chunk (consider code-splitting for production)
- All dependencies are latest stable versions as of January 2025

---

## [1.1.0] - 2026-01-17

### 🔧 Code Quality & UX Improvements Release

Rilis yang fokus pada perbaikan bug, peningkatan kualitas kode, dan konsistensi UI/UX.

### Fixed

#### Bug Fixes

- **useFileAttachment**: Fixed memory leak pada blob URL cleanup dengan proper ref tracking
- **useSortableData**: Fixed missing date string sorting yang menyebabkan tanggal tidak ter-sort dengan benar
- **StatusBadge**: Fixed missing status mapping untuk `IN_CUSTODY`, `CONSUMED`, dan beberapa status baru
- **CustomSelect**: Fixed missing keyboard navigation (Arrow keys, Enter, Escape)
- **useGenericFilter**: Fixed handling untuk array-type filter values yang tidak bekerja

#### UI/UX Fixes

- **StatusBadge**: Added support untuk size `lg` dan improved truncation handling
- **CustomSelect**: Added proper ARIA attributes untuk accessibility
- **CustomSelect**: Added highlight state saat keyboard navigation

### Added

#### Komponen Baru

- **ErrorBoundary**: Komponen untuk graceful error handling dengan development-only error details
- **withErrorBoundary**: HOC untuk wrapping komponen dengan error boundary
- **EmptyState**: Komponen unified untuk empty state displays dengan multiple variants
- **SearchEmptyState**: Komponen khusus untuk hasil pencarian kosong
- **TableEmptyState**: Komponen khusus untuk tabel kosong
- **ConfirmDialog**: Modal konfirmasi untuk aksi berbahaya dengan optional text confirmation

#### Utility Enhancements

- **statusUtils**: Added `getLoanRequestStatusClass` untuk status loan request
- **statusUtils**: Added `getReturnStatusClass` untuk status pengembalian aset
- **statusUtils**: Added `getStatusLabel` helper untuk label user-friendly
- **useGenericFilter**: Added `setFilters` untuk batch filter update
- **useGenericFilter**: Added `resetAll` untuk reset filters dan search
- **useGenericFilter**: Added `hasActiveFilters` boolean helper
- **useSortableData**: Added `resetSort` function
- **useFileAttachment**: Added `isProcessing` state untuk tracking async operations

### Changed

#### Code Quality Improvements

- **useFileAttachment**: Refactored dengan useRef untuk prevent stale closure di cleanup
- **useFileAttachment**: Added proper initialization handling untuk initial files
- **useSortableData**: Enhanced dengan locale-aware sorting untuk Indonesian
- **useSortableData**: Added proper Date object dan ISO string detection
- **useGenericFilter**: Improved dengan useCallback untuk better performance
- **useGenericFilter**: Added empty array handling di filter logic
- **CustomSelect**: Refactored dengan useCallback untuk handler functions
- **StatusBadge**: Enhanced matching logic untuk lebih banyak status variations
- **statusUtils**: Added complete status coverage untuk semua enum values

### Documentation

- Created detailed feature documentation for code review findings
- Updated component JSDoc comments dengan usage examples

---

## [1.0.0] - 2026-01-17

### 🎉 Initial Production Release

Rilis pertama dari Aplikasi Inventori Aset PT. Triniti Media Indonesia sebagai **Prototipe Frontend Fungsional Penuh**.

### Added

#### Modul Autentikasi & Otorisasi

- Sistem login dengan validasi email/password
- Role-Based Access Control (RBAC) dengan 5 peran: Super Admin, Admin Logistik, Admin Purchase, Leader, Staff
- Permission system granular dengan 50+ izin
- Session management dengan auto-logout
- Request password reset workflow

#### Modul Dashboard

- Dashboard eksekutif untuk Admin dengan metrik makro
- Dashboard personal untuk Staff dengan aset yang dipegang
- Widget actionable items (tugas pending)
- Grafik status aset (donut chart)
- Grafik tren pengeluaran bulanan
- Leaderboard teknisi
- Alert stok rendah & peringatan garansi

#### Modul Request Pengadaan

- Form request barang dengan item standar
- Tiga tipe order: Regular Stock, Urgent, Project Based
- Alur persetujuan multi-level (Logistik → Purchase → CEO)
- Approval dengan revisi kuantitas
- Pelacakan status pembelian hingga barang tiba
- Export daftar request ke CSV

#### Modul Request Peminjaman (Loan)

- Form peminjaman aset dari gudang
- Penugasan aset spesifik oleh Admin
- Pelacakan status peminjaman aktif
- Fitur pengembalian aset dengan verifikasi kondisi
- Deteksi keterlambatan pengembalian

#### Modul Registrasi Aset

- Pencatatan aset individual dengan ID unik
- Pencatatan aset bulk (count & measurement)
- Import dari request yang sudah tiba
- Generate & print QR Code label
- Edit data aset existing
- Pelacakan riwayat perubahan (activity log)

#### Modul Stok & Gudang

- Overview stok global per kategori/brand
- Stok personal (aset yang dipegang user)
- Threshold stok minimum dengan alert
- Riwayat pergerakan stok (stock movement)
- Filter multi-kriteria
- Export data stok ke CSV

#### Modul Serah Terima (Handover)

- Form Berita Acara Serah Terima (BAST)
- Handover dari gudang ke user
- Handover dari request/peminjaman yang disetujui
- Status tracking handover
- Preview & cetak dokumen handover

#### Modul Perbaikan (Repair)

- Pelaporan kerusakan dengan foto
- Alur perbaikan: Report → Start Repair → Complete/Decommission
- Tracking perbaikan internal vs eksternal
- Progress update dengan timeline
- Pencatatan hasil perbaikan

#### Modul Pelanggan & Instalasi

- Manajemen data pelanggan
- Form instalasi aset di lokasi pelanggan
- Form maintenance/pemeliharaan
- Form dismantle (penarikan aset)
- Pelacakan aset terpasang per pelanggan
- Riwayat aktivitas per pelanggan

#### Modul Manajemen Pengguna

- CRUD user dengan validasi
- Manajemen divisi perusahaan
- Penugasan izin custom per user
- Request password reset oleh admin

#### Modul Kategori & Master Data

- Hierarki: Kategori → Tipe → Model/Brand
- Konfigurasi tracking method (individual/bulk)
- Konfigurasi unit pengukuran
- Asosiasi kategori dengan divisi

#### Fitur Umum

- Responsive design (mobile-friendly)
- Dark mode support ready
- Global search dengan QR scanner
- Sistem notifikasi real-time (mock)
- Preview modal untuk detail cepat
- Skeleton loading states
- Form validation

### Technical

- React 18 dengan TypeScript
- Zustand untuk state management
- Tailwind CSS untuk styling
- Mock API layer dengan localStorage
- Arsitektur berbasis fitur (feature-based)

### Documentation

- Product Requirements Document (PRD)
- Database Schema (ERD)
- API Reference Blueprint
- Frontend Development Guide
- Backend Development Guide
- Deployment Guide
- User Guide

---

## [0.9.0] - 2025-12-15

### Added

- Beta version dengan fitur inti

### Changed

- Refactoring major pada struktur folder

---

## [0.1.0] - 2025-10-01

### Added

- Project initialization
- Basic UI components
- Initial mock data structure

---

[Unreleased]: https://github.com/trinitimedia/inventory-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/trinitimedia/inventory-app/releases/tag/v1.0.0
[0.9.0]: https://github.com/trinitimedia/inventory-app/releases/tag/v0.9.0
[0.1.0]: https://github.com/trinitimedia/inventory-app/releases/tag/v0.1.0
