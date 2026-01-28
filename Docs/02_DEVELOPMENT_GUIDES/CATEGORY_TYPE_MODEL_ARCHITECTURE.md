# Arsitektur Kategori, Tipe, dan Model Aset

## Ringkasan

Sistem Trinity Asset Management menggunakan hierarki 3 tingkat untuk mengklasifikasikan aset:

```
AssetCategory (Kategori)
└── AssetType (Tipe)
    └── StandardItem (Model)
```

## Database Schema

### 1. AssetCategory (Tabel: `asset_categories`)

Kategori adalah level tertinggi dalam hierarki. Contoh: "Jaringan", "Komputer", "Kabel".

| Field                     | Type         | Keterangan                        |
| ------------------------- | ------------ | --------------------------------- |
| `id`                      | INT          | Primary key                       |
| `name`                    | VARCHAR(255) | Nama kategori (unique)            |
| `is_customer_installable` | BOOLEAN      | Apakah bisa dipasang ke pelanggan |
| `created_at`              | TIMESTAMP    | Waktu pembuatan                   |
| `updated_at`              | TIMESTAMP    | Waktu update terakhir             |

**Relasi:**

- Many-to-Many dengan `Division` (kategori terkait divisi mana)
- One-to-Many dengan `AssetType`

---

### 2. AssetType (Tabel: `asset_types`)

Tipe mendefinisikan karakteristik pelacakan aset dalam kategori.

| Field             | Type         | Keterangan                |
| ----------------- | ------------ | ------------------------- |
| `id`              | INT          | Primary key               |
| `category_id`     | INT          | FK ke AssetCategory       |
| `name`            | VARCHAR(255) | Nama tipe                 |
| `classification`  | ENUM         | `ASSET` atau `MATERIAL`   |
| `tracking_method` | ENUM         | `INDIVIDUAL` atau `BULK`  |
| `unit_of_measure` | VARCHAR(50)  | Satuan default (opsional) |
| `created_at`      | TIMESTAMP    | Waktu pembuatan           |
| `updated_at`      | TIMESTAMP    | Waktu update terakhir     |

**Enum Values:**

```prisma
enum ItemClassification {
  ASSET      // Aset tetap (fixed asset) - dilacak sebagai inventaris
  MATERIAL   // Bahan habis pakai (consumables)
}

enum TrackingMethod {
  INDIVIDUAL // Dilacak per unit dengan Serial Number/MAC Address
  BULK       // Dilacak secara kuantitas (jumlah atau ukuran)
}
```

**Aturan Bisnis:**

- `ASSET` + `INDIVIDUAL` → Aset dengan serial number (contoh: Laptop, Router)
- `ASSET` + `BULK` → Aset tanpa serial, dilacak jumlah (contoh: Kursi, Meja)
- `MATERIAL` + `BULK` → Bahan habis pakai (contoh: Kabel, Connector)
- `MATERIAL` + `INDIVIDUAL` → Jarang digunakan, tapi valid

---

### 3. StandardItem / Model (Tabel: `standard_items`)

Model adalah spesifikasi detail dari suatu tipe, termasuk brand dan konfigurasi pelacakan bulk.

| Field                  | Type         | Keterangan                                    |
| ---------------------- | ------------ | --------------------------------------------- |
| `id`                   | INT          | Primary key                                   |
| `type_id`              | INT          | FK ke AssetType                               |
| `name`                 | VARCHAR(255) | Nama model                                    |
| `brand`                | VARCHAR(255) | Merek/brand                                   |
| `bulk_type`            | ENUM         | `COUNT` atau `MEASUREMENT` (untuk bulk items) |
| `unit_of_measure`      | VARCHAR(50)  | Satuan utama (Pcs, Roll, Meter, dll)          |
| `base_unit_of_measure` | VARCHAR(50)  | Satuan dasar untuk measurement                |
| `quantity_per_unit`    | INT          | Konversi (misal: 1 Roll = 100 Meter)          |
| `created_at`           | TIMESTAMP    | Waktu pembuatan                               |

**Enum Values:**

```prisma
enum BulkTrackingMode {
  COUNT       // Dilacak berdasarkan jumlah unit (Pcs, Box, Roll)
  MEASUREMENT // Dilacak berdasarkan ukuran (Meter, Liter, Kg)
}
```

**Unique Constraint:** `[type_id, name, brand]` - Kombinasi harus unik

---

## Alur Data Frontend → Backend → Database

### 1. Menambah Model Baru

**Frontend (ModelManagementModal.tsx):**

```typescript
const modelPayload = {
  typeId: type.id, // ID parent AssetType
  name: "UTP Cat6", // Nama model
  brand: "AMP", // Brand
  // Jika parent type adalah BULK:
  bulkType: "MEASUREMENT", // COUNT atau MEASUREMENT
  unitOfMeasure: "Roll", // Satuan utama
  baseUnitOfMeasure: "Meter", // Satuan dasar (untuk MEASUREMENT)
  quantityPerUnit: 305, // 1 Roll = 305 Meter
};

await createModel(modelPayload);
```

**Backend API:** `POST /api/v1/categories/models`

**Controller (categories.controller.ts):**

```typescript
@Post('models')
createModel(@Body() dto: CreateModelDto) {
  return this.categoriesService.createModel(dto);
}
```

**Service (categories.service.ts):**

```typescript
async createModel(dto: CreateModelDto) {
  return this.prisma.standardItem.create({
    data: dto,
    include: { type: { include: { category: true } } },
  });
}
```

**Database Result:**

```sql
INSERT INTO standard_items (type_id, name, brand, bulk_type, unit_of_measure, base_unit_of_measure, quantity_per_unit)
VALUES (5, 'UTP Cat6', 'AMP', 'MEASUREMENT', 'Roll', 'Meter', 305);
```

---

## Logika Cerdas Pelacakan

### Individual Tracking (Serial Number Based)

Untuk tipe dengan `tracking_method = INDIVIDUAL`:

- Setiap unit aset memiliki ID unik
- Wajib memiliki Serial Number atau MAC Address
- Dilacak status per unit (Di Gudang, Digunakan, Rusak, dll)

**Contoh:**

- Router Mikrotik RB750Gr3 - SN: A1B2C3D4
- Laptop ThinkPad X1 Carbon - SN: PF2X9Y8Z

### Bulk Tracking - COUNT Mode

Untuk tipe dengan `tracking_method = BULK` dan model dengan `bulk_type = COUNT`:

- Dilacak berdasarkan jumlah unit
- Tidak ada serial number individual
- Satu record asset = satu batch dengan quantity

**Contoh:**

- Connector RJ45 - Brand: AMP - Qty: 500 Pcs
- Kabel Tie - Brand: KSS - Qty: 1000 Pcs

### Bulk Tracking - MEASUREMENT Mode

Untuk tipe dengan `tracking_method = BULK` dan model dengan `bulk_type = MEASUREMENT`:

- Dilacak berdasarkan ukuran/volume
- Konversi antara satuan container dan satuan dasar
- `initial_balance` dan `current_balance` di tabel Asset

**Contoh:**

- Kabel UTP Cat6 - Brand: AMP - 1 Roll (305 Meter)
  - `initial_balance`: 305
  - `current_balance`: 280 (sudah terpakai 25 meter)

---

## Integrasi dengan Asset Registration

Saat mendaftarkan aset baru, sistem akan:

1. **Ambil informasi dari Model:**

   ```typescript
   const model = await getModel(selectedModelId);
   const type = model.type;
   const category = type.category;
   ```

2. **Tentukan field yang diperlukan:**

   ```typescript
   if (type.trackingMethod === "INDIVIDUAL") {
     // Wajib isi: serialNumber atau macAddress
     // quantity = 1 (default)
   } else if (type.trackingMethod === "BULK") {
     if (model.bulkType === "COUNT") {
       // Wajib isi: quantity
       // Tidak perlu serial number
     } else if (model.bulkType === "MEASUREMENT") {
       // Wajib isi: initialBalance
       // currentBalance = initialBalance (saat pertama kali)
     }
   }
   ```

3. **Simpan ke database dengan kalkulasi otomatis**

---

## API Endpoints

### Categories

| Method | Endpoint          | Deskripsi                                 |
| ------ | ----------------- | ----------------------------------------- |
| GET    | `/categories`     | List semua kategori dengan types & models |
| POST   | `/categories`     | Buat kategori baru                        |
| PATCH  | `/categories/:id` | Update kategori                           |
| DELETE | `/categories/:id` | Hapus kategori                            |

### Types

| Method | Endpoint                         | Deskripsi              |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/categories/types`              | List semua tipe        |
| GET    | `/categories/types?categoryId=1` | List tipe per kategori |
| POST   | `/categories/types`              | Buat tipe baru         |
| PATCH  | `/categories/types/:id`          | Update tipe            |
| DELETE | `/categories/types/:id`          | Hapus tipe             |

### Models (StandardItems)

| Method | Endpoint                      | Deskripsi           |
| ------ | ----------------------------- | ------------------- |
| GET    | `/categories/models`          | List semua model    |
| GET    | `/categories/models?typeId=1` | List model per tipe |
| POST   | `/categories/models`          | Buat model baru     |
| PATCH  | `/categories/models/:id`      | Update model        |
| DELETE | `/categories/models/:id`      | Hapus model         |

---

## Frontend Store (useAssetStore)

### Actions yang tersedia:

```typescript
// Category Actions
createCategory(data);
updateCategoryDetails(id, data);
deleteCategory(id);

// Type Actions
createType(data);
updateTypeDetails(id, data);
deleteType(id, categoryId);

// Model Actions
createModel(data);
updateModelDetails(id, data);
deleteModel(id, typeId);
```

### Normalisasi Data

Backend mengembalikan enum dalam UPPERCASE, frontend menormalisasi ke lowercase:

```typescript
// Backend response
{ classification: "ASSET", trackingMethod: "BULK", bulkType: "MEASUREMENT" }

// Frontend normalized
{ classification: "asset", trackingMethod: "bulk", bulkType: "measurement" }
```

---

## Validasi di Backend (DTO)

### CreateModelDto

```typescript
export class CreateModelDto {
  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @IsNotEmpty({ message: "Nama model wajib diisi" })
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Brand wajib diisi" })
  @IsString()
  brand: string;

  @IsOptional()
  @IsEnum(BulkTrackingMode)
  bulkType?: BulkTrackingMode;

  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @IsOptional()
  @IsString()
  baseUnitOfMeasure?: string;

  @IsOptional()
  @IsNumber()
  quantityPerUnit?: number;
}
```

---

## Best Practices

1. **Konsistensi Penamaan:**
   - Kategori: Singular, PascalCase (Jaringan, Komputer)
   - Tipe: Deskriptif (Router, Switch, Kabel UTP)
   - Model: Spesifik dengan brand (Mikrotik RB750Gr3, AMP Cat6)

2. **Pilih Classification dengan Benar:**
   - ASSET = Aset tetap yang dicatat sebagai inventaris perusahaan
   - MATERIAL = Bahan yang habis terpakai atau dikonsumsi

3. **Pilih Tracking Method dengan Benar:**
   - INDIVIDUAL = Setiap unit unik dan bisa dilacak
   - BULK = Unit-unit identik, dilacak secara agregat

4. **Untuk Bulk Items:**
   - COUNT = Barang diskrit (Pcs, Box, Pack)
   - MEASUREMENT = Barang kontinu (Meter, Liter, Kg)

---

## Contoh Kasus Penggunaan

### Kasus 1: Router Mikrotik (Individual Asset)

```
Kategori: Jaringan
├── Tipe: Router (classification: ASSET, tracking: INDIVIDUAL)
    └── Model: Mikrotik RB750Gr3 (brand: Mikrotik)
        └── Asset: SN-A1B2C3D4 (status: Di Gudang)
```

### Kasus 2: Kabel UTP (Bulk Material - Measurement)

```
Kategori: Kabel & Connector
├── Tipe: Kabel UTP (classification: MATERIAL, tracking: BULK)
    └── Model: Cat6 (brand: AMP, bulkType: MEASUREMENT, 1 Roll = 305m)
        └── Asset: Roll #1 (initialBalance: 305m, currentBalance: 280m)
```

### Kasus 3: Connector RJ45 (Bulk Material - Count)

```
Kategori: Kabel & Connector
├── Tipe: Connector (classification: MATERIAL, tracking: BULK)
    └── Model: RJ45 (brand: AMP, bulkType: COUNT, unit: Pcs)
        └── Asset: Batch #1 (quantity: 500 Pcs)
```

---

_Terakhir diperbarui: 28 Januari 2026_
