# Session Update: Model CRUD & Database Integration

**Tanggal**: 28 Januari 2026  
**Developer**: AI Assistant  
**Fokus**: Integrasi Model Aset dengan Database

---

## Ringkasan

Sesi ini fokus pada penyelesaian integrasi Model Aset (StandardItem) dengan database. User bertanya dimana data model disimpan - jawabannya adalah di tabel `standard_items` yang sudah ada di schema Prisma.

## Perubahan yang Dilakukan

### 1. Frontend Store (useAssetStore.ts)

Menambahkan Model CRUD actions:

```typescript
// Interface
createModel: (data: any) => Promise<void>;
updateModelDetails: (id: number, data: any) => Promise<void>;
deleteModel: (id: number, typeId: number) => Promise<void>;

// Implementation
createModel: async (data) => {
  const newModelResponse = await categoriesApi.createModel(data);
  // Update state dengan model baru di type yang sesuai
},

updateModelDetails: async (id, data) => {
  const updatedModelResponse = await categoriesApi.updateModel(id, data);
  // Update state
},

deleteModel: async (id, typeId) => {
  await categoriesApi.deleteModel(id);
  // Remove dari state
}
```

### 2. ModelManagementModal.tsx

Refaktor dari bulk update ke dedicated Store actions:

**Sebelum:**

```typescript
// Menggunakan updateCategories (bulk update) yang bermasalah
const updatedCategories = assetCategories.map(cat => {...});
await updateCategories(updatedCategories);
```

**Sesudah:**

```typescript
// Menggunakan dedicated actions
await createModel(modelPayload);
// atau
await updateModelDetails(editingId, modelPayload);
// atau
await deleteModel(modelToDelete.id, type.id);
```

### 3. Type Definitions (types/index.ts)

Menambahkan `typeId` ke StandardItem interface:

```typescript
export interface StandardItem {
  id: number;
  typeId?: number; // FK to AssetType - returned by backend
  name: string;
  brand: string;
  bulkType?: BulkTrackingMode;
  unitOfMeasure?: string;
  baseUnitOfMeasure?: string;
  quantityPerUnit?: number;
}
```

### 4. Dokumentasi

Membuat dokumentasi komprehensif:

- `Docs/02_DEVELOPMENT_GUIDES/CATEGORY_TYPE_MODEL_ARCHITECTURE.md`

## Database Schema Explanation

```
AssetCategory (asset_categories)
├── id, name, is_customer_installable
│
└── AssetType (asset_types)
    ├── id, category_id, name
    ├── classification: ASSET | MATERIAL
    ├── tracking_method: INDIVIDUAL | BULK
    │
    └── StandardItem (standard_items)  ← INI TABEL UNTUK MODEL
        ├── id, type_id, name, brand
        ├── bulk_type: COUNT | MEASUREMENT
        ├── unit_of_measure: "Roll", "Pcs", "Meter"
        ├── base_unit_of_measure: "Meter", "Pcs" (untuk MEASUREMENT)
        └── quantity_per_unit: 305 (1 Roll = 305 Meter)
```

## Alur Data

```
Frontend Form → Store Action → API Client → Backend Controller → Service → Prisma → PostgreSQL
       ↓              ↓            ↓              ↓                ↓         ↓
    modelPayload   createModel  POST /models   createModel()    create()  INSERT INTO standard_items
```

## Payload yang Dikirim ke Backend

```typescript
{
  typeId: 5,
  name: "UTP Cat6",
  brand: "AMP",
  bulkType: "MEASUREMENT",      // Uppercase untuk backend
  unitOfMeasure: "Roll",
  baseUnitOfMeasure: "Meter",
  quantityPerUnit: 305
}
```

## Response dari Backend

```typescript
{
  id: 1,
  typeId: 5,
  name: "UTP Cat6",
  brand: "AMP",
  bulkType: "MEASUREMENT",
  unitOfMeasure: "Roll",
  baseUnitOfMeasure: "Meter",
  quantityPerUnit: 305,
  createdAt: "2026-01-28T...",
  type: {
    id: 5,
    name: "Kabel UTP",
    classification: "MATERIAL",
    trackingMethod: "BULK",
    category: { ... }
  }
}
```

## Files Modified

| File                                                             | Perubahan                 |
| ---------------------------------------------------------------- | ------------------------- |
| `frontend/src/stores/useAssetStore.ts`                           | +Model CRUD actions       |
| `frontend/src/components/ui/ModelManagementModal.tsx`            | Refaktor ke Store actions |
| `frontend/src/types/index.ts`                                    | +typeId ke StandardItem   |
| `Docs/02_DEVELOPMENT_GUIDES/CATEGORY_TYPE_MODEL_ARCHITECTURE.md` | Dokumentasi baru          |
| `Docs/DOCUMENTATION_INDEX.md`                                    | Link ke dokumentasi baru  |
| `Docs/CHANGELOG/CHANGELOG.md`                                    | Entry changelog           |

## Testing Checklist

- [ ] Tambah model baru → Cek tabel `standard_items` di database
- [ ] Edit model → Cek data terupdate
- [ ] Hapus model → Cek data terhapus
- [ ] Model bulk COUNT → `bulk_type` = 'COUNT'
- [ ] Model bulk MEASUREMENT → `bulk_type` = 'MEASUREMENT', `quantity_per_unit` terisi
- [ ] Model di tab Asset → hanya muncul di tipe dengan classification ASSET
- [ ] Model di tab Material → hanya muncul di tipe dengan classification MATERIAL

## Related Documentation

- [CATEGORY_TYPE_MODEL_ARCHITECTURE.md](../02_DEVELOPMENT_GUIDES/CATEGORY_TYPE_MODEL_ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](../01_CONCEPT_AND_ARCHITECTURE/DATABASE_SCHEMA.md)
- [API_REFERENCE.md](../02_DEVELOPMENT_GUIDES/API_REFERENCE.md)

---

_Session completed at 28 January 2026_
