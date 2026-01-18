# Fix Prisma Validation Errors

**Date**: 2026-01-19  
**Status**: Completed  
**Type**: Bug Fix

## Problem

Beberapa endpoint API mengembalikan error "Database validation error" ketika frontend mengirim request dengan nested objects atau extra fields yang tidak ada di Prisma schema.

### Root Cause

Frontend mengirim objek dengan nested relations atau computed fields seperti:

```json
{
  "id": 1,
  "name": "Networking Equipment",
  "types": [...],  // Nested array - tidak bisa langsung di-write ke Prisma
  "associatedDivisions": [],
  "createdAt": "...",  // Auto-generated field
  "updatedAt": "..."   // Auto-generated field
}
```

Backend services langsung meneruskan DTO ke `prisma.*.create()` atau `prisma.*.update()` tanpa sanitization, menyebabkan `Prisma.PrismaClientValidationError`.

### Error Stack Trace

```
ApiError: Database validation error
    at ApiClient.handleError (client.ts:186:13)
    at async Object.updateAll (master-data.api.ts:169:25)
    at async updateCategories (useAssetStore.ts:420:11)
```

## Solution

Menambahkan sanitization methods di setiap service untuk memfilter hanya field yang valid sebelum dikirim ke Prisma.

### Files Modified

1. **`backend/src/modules/categories/categories.service.ts`**
   - Added `sanitizeCategoryData()`, `sanitizeTypeData()`, `sanitizeModelData()`
   - Updated `createCategory()`, `updateCategory()`, `createType()`, `updateType()`, `createModel()`, `updateModel()`

2. **`backend/src/modules/customers/customers.service.ts`**
   - Added `sanitizeCustomerData()`
   - Updated `create()`, `update()`

3. **`backend/src/modules/users/users.service.ts`**
   - Added `sanitizeUserData()`
   - Updated `create()`, `update()`

4. **`backend/src/modules/assets/assets.service.ts`**
   - Added `sanitizeAssetData()`
   - Updated `create()`, `createBulk()`, `update()`

### Example Pattern

```typescript
/**
 * Strip unknown fields from DTO to prevent Prisma validation errors.
 */
private sanitizeCategoryData(dto: Partial<CreateCategoryDto>): Partial<CreateCategoryDto> {
  const { name, isCustomerInstallable, associatedDivisions } = dto as any;
  const sanitized: Partial<CreateCategoryDto> = {};

  if (name !== undefined) sanitized.name = name;
  if (isCustomerInstallable !== undefined) sanitized.isCustomerInstallable = isCustomerInstallable;
  if (associatedDivisions !== undefined) sanitized.associatedDivisions = associatedDivisions;

  return sanitized;
}

async createCategory(dto: CreateCategoryDto) {
  const sanitized = this.sanitizeCategoryData(dto);
  return this.prisma.assetCategory.create({
    data: sanitized as CreateCategoryDto,
  });
}
```

## Testing

1. Login sebagai Admin Logistik
2. Buka Kategori Management
3. Tambah kategori baru → Harus berhasil tanpa "Database validation error"
4. Edit kategori existing → Harus berhasil
5. Tambah/edit Type dan Model → Harus berhasil

## Prevention

Untuk mencegah masalah serupa di masa depan:

1. **Always sanitize DTOs** sebelum mengirim ke Prisma
2. **Use explicit field mapping** daripada spread operator
3. **Add validation tests** yang memverifikasi extra fields ditolak gracefully

## Related Issues

- Frontend mengirim nested `types[]` array saat update category
- Frontend mengirim `createdAt`, `updatedAt` timestamps yang seharusnya auto-generated
- Frontend type `AssetCategory` includes relational data yang tidak writable
