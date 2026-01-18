# Referensi API Backend

Dokumen ini menyediakan referensi teknis untuk setiap endpoint REST API.

## 1. Sumber Daya: `Assets` (Inventori)

### `GET /api/assets`

- **Deskripsi**: Mengambil daftar aset (mendukung filter status, lokasi, user).

### `POST /api/assets`

- **Deskripsi**: Registrasi aset baru (mendukung batch create).

### `PATCH /api/assets/:id`

- **Deskripsi**: Update data aset (termasuk update saldo/balance untuk measurement item).

### `POST /api/assets/consume`

- **Deskripsi**: Mengurangi stok material (bulk/measurement) untuk keperluan instalasi/maintenance.
  ```json
  {
    "items": [
      {
        "itemName": "Dropcore",
        "brand": "Fiberhome",
        "quantity": 150,
        "unit": "Meter"
      }
    ],
    "context": { "customerId": "CUST-001", "technician": "Budi" }
  }
  ```

---

## 2. Sumber Daya: `Requests` (Permintaan Baru)

### `GET /api/requests`

### `POST /api/requests`

### `PATCH /api/requests/:id/approve`

- **Payload**: `itemStatuses` (approved qty per item).

### `POST /api/requests/:id/register-assets`

- **Deskripsi**: Mengkonversi item request yang sudah tiba menjadi data aset di sistem.

---

## 3. Sumber Daya: `LoanRequests` (Peminjaman)

### `GET /api/loan-requests`

- Mengambil daftar peminjaman.

### `POST /api/loan-requests`

- Membuat pengajuan pinjaman baru.

### `PATCH /api/loan-requests/:id/approve`

- **Deskripsi**: Menyetujui pinjaman dan menetapkan ID aset (assignment).
  ```json
  {
    "approver": "Siti Logistik",
    "assignedAssetIds": { "itemId_1": ["AST-001", "AST-002"] }
  }
  ```

### `POST /api/loan-requests/:id/return`

- **Deskripsi**: Memproses pengembalian aset.

---

## 4. Sumber Daya: `Transactions` (Operasional)

### `GET /api/transactions/handovers`

- List berita acara serah terima.

### `POST /api/transactions/handovers`

- Membuat handover baru. **Penting**: Backend harus memvalidasi kepemilikan aset pengirim sebelum memindahkan ke penerima.

### `GET /api/transactions/installations`

### `POST /api/transactions/installations`

- Submit laporan instalasi. Backend otomatis mengupdate status aset terkait menjadi `IN_USE` dengan `currentUser` = ID Pelanggan.

### `GET /api/transactions/maintenances`

### `POST /api/transactions/maintenances`

- Submit laporan perbaikan. Mendukung penggantian perangkat (_swap_) dan penggunaan material.

### `GET /api/transactions/dismantles`

### `POST /api/transactions/dismantles`

- Submit laporan penarikan aset.

### `PATCH /api/transactions/dismantles/:id/complete`

- Konfirmasi penerimaan barang dismantle di gudang. Aset kembali ke `IN_STORAGE` (atau `DAMAGED` sesuai kondisi).

---

## 5. Sumber Daya: `MasterData`

### `GET /api/customers`

### `GET /api/users`

### `GET /api/divisions`

### `GET /api/categories`

---

## 6. Sumber Daya: `Dashboard` (Statistik)

> ✅ **Status: IMPLEMENTED** (v2.0.0)

### `GET /api/dashboard/summary`

- **Deskripsi**: Mendapatkan ringkasan dashboard dengan semua metrik utama.
- **Response**: `{ assets, requests, loans, customers, recentActivities }`

### `GET /api/dashboard/stock-summary`

- **Deskripsi**: Mendapatkan ringkasan stok berdasarkan model.
- **Response**: Array of `{ modelId, modelName, brand, totalStock, inStorage, inUse, onLoan }`

### `GET /api/dashboard/trends`

- **Deskripsi**: Mendapatkan tren bulanan 6 bulan terakhir.
- **Response**: Array of `{ month, requests, handovers, installations }`

### `GET /api/dashboard/low-stock-alerts`

- **Query Params**: `threshold` (default: 5)
- **Deskripsi**: Mendapatkan item dengan stok di bawah threshold.

### `GET /api/dashboard/upcoming-returns`

- **Query Params**: `days` (default: 7)
- **Deskripsi**: Mendapatkan pinjaman yang akan jatuh tempo dalam N hari.

---

## 7. Sumber Daya: `Notifications`

> ✅ **Status: IMPLEMENTED** (v2.0.0)

### `GET /api/notifications`

- **Query Params**: `page`, `limit`, `unreadOnly`
- **Deskripsi**: Mendapatkan notifikasi untuk user yang sedang login.

### `GET /api/notifications/unread-count`

- **Deskripsi**: Mendapatkan jumlah notifikasi yang belum dibaca.
- **Response**: `{ count: number }`

### `PATCH /api/notifications/:id/read`

- **Deskripsi**: Menandai notifikasi sebagai sudah dibaca.

### `POST /api/notifications/mark-all-read`

- **Deskripsi**: Menandai semua notifikasi sebagai sudah dibaca.

### `DELETE /api/notifications/:id`

- **Deskripsi**: Menghapus notifikasi.

---

## 8. Sumber Daya: `Activity Logs` (Audit Trail)

> ✅ **Status: IMPLEMENTED** (v2.0.0)

### `GET /api/activity-logs`

- **Query Params**: `entityType`, `entityId`, `action`, `performedBy`, `startDate`, `endDate`, `page`, `limit`
- **Deskripsi**: Mendapatkan log aktivitas dengan filter (Admin only).
- **Authorization**: `SUPER_ADMIN`, `ADMIN_LOGISTIK`

### `GET /api/activity-logs/entity`

- **Query Params**: `type`, `id`
- **Deskripsi**: Mendapatkan log aktivitas untuk entitas tertentu.

### `GET /api/activity-logs/recent`

- **Query Params**: `limit` (default: 10)
- **Deskripsi**: Mendapatkan aktivitas terbaru untuk dashboard.

---

## 9. Sumber Daya: `Reports`

> ✅ **Status: IMPLEMENTED** (v2.0.0)

### `GET /api/reports/assets/inventory`

- **Query Params**: `status`, `condition`, `categoryId`, `typeId`, `modelId`, `startDate`, `endDate`
- **Deskripsi**: Laporan inventori aset dengan filter.
- **Authorization**: `SUPER_ADMIN`, `ADMIN_LOGISTIK`, `ADMIN_PURCHASE`

### `GET /api/reports/assets/movements`

- **Query Params**: `startDate`, `endDate` (required)
- **Deskripsi**: Laporan pergerakan stok dalam periode tertentu.

### `GET /api/reports/requests`

- **Query Params**: `status`, `requestedBy`, `startDate`, `endDate`
- **Deskripsi**: Laporan ringkasan permintaan.

### `GET /api/reports/loans`

- **Query Params**: `startDate`, `endDate`
- **Deskripsi**: Laporan status peminjaman.

### `GET /api/reports/customers`

- **Query Params**: `customerId`
- **Deskripsi**: Laporan pelanggan dengan jumlah aset terinstal.

### `GET /api/reports/maintenances`

- **Query Params**: `startDate`, `endDate`
- **Deskripsi**: Laporan riwayat maintenance dengan total biaya.
