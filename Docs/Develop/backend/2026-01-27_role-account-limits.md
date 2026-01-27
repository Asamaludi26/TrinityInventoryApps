# Implementasi Batasan Jumlah Akun per Role

**Tanggal**: 27 Januari 2026  
**Modul**: Backend - User Management  
**File Utama**: `backend/src/modules/users/users.service.ts`

---

## 1. Ringkasan Fitur

Implementasi pembatasan jumlah akun berdasarkan role untuk mencegah pembuatan akun berlebihan pada role-role administratif yang sensitif.

### 1.1 Batasan Akun

| Role               | Batas Maksimal | Keterangan                       |
| ------------------ | -------------- | -------------------------------- |
| **SUPER_ADMIN**    | 1 akun         | Hanya boleh ada satu Super Admin |
| **ADMIN_LOGISTIK** | 3 akun         | Maksimal 3 Admin Logistik        |
| **ADMIN_PURCHASE** | 3 akun         | Maksimal 3 Admin Purchase        |
| STAFF              | Tidak dibatasi | -                                |
| LEADER             | Tidak dibatasi | -                                |
| TEKNISI            | Tidak dibatasi | -                                |

---

## 2. Perubahan Backend

### 2.1 Konstanta Baru (`app.constants.ts`)

```typescript
// Role Account Limits
export const ROLE_ACCOUNT_LIMITS: Record<string, number> = {
  SUPER_ADMIN: 1,
  ADMIN_LOGISTIK: 3,
  ADMIN_PURCHASE: 3,
  // STAFF, LEADER, TEKNISI tidak dibatasi
} as const;
```

### 2.2 Service Methods (`users.service.ts`)

#### Method Validasi Batas Akun

```typescript
private async validateRoleAccountLimit(role: string, excludeUserId?: number): Promise<void> {
  const limit = ROLE_ACCOUNT_LIMITS[role];

  // Jika role tidak ada batas, lewati validasi
  if (!limit) return;

  const whereClause: Prisma.UserWhereInput = {
    role: role as UserRole,
    isActive: true,
  };

  // Jika edit, kecualikan user yang sedang diedit
  if (excludeUserId) {
    whereClause.id = { not: excludeUserId };
  }

  const currentCount = await this.prisma.user.count({ where: whereClause });

  if (currentCount >= limit) {
    const roleDisplayName = this.getRoleDisplayName(role);
    throw new ConflictException(
      `Batas maksimal akun ${roleDisplayName} sudah tercapai (${limit} akun). ` +
      `Hapus atau nonaktifkan akun yang ada sebelum membuat yang baru.`
    );
  }
}
```

#### Method Informasi Batas Akun

```typescript
async getRoleAccountCounts(): Promise<{
  role: string;
  displayName: string;
  limit: number | null;
  current: number;
  available: number | null;
}[]> {
  // Returns current count and available slots for each limited role
}
```

### 2.3 Controller Endpoint (`users.controller.ts`)

```typescript
@Get('role-limits')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
getRoleLimits() {
  return this.usersService.getRoleAccountCounts();
}
```

---

## 3. Perubahan Frontend

### 3.1 API Method (`master-data.api.ts`)

```typescript
getRoleLimits: async (): Promise<{
  role: string;
  displayName: string;
  limit: number | null;
  current: number;
  available: number | null;
}[]> => {
  return apiClient.get("/users/role-limits");
},
```

### 3.2 UserFormPage.tsx

- Fetch role limits saat komponen mount
- Tampilkan warning jika mendekati atau melebihi batas
- Disable tombol submit jika batas terlampaui
- Styling dark mode untuk warning alerts

---

## 4. UI/UX

### 4.1 Warning States

1. **Batas Tercapai (Error)**
   - Background: `bg-red-50` / `dark:bg-red-900/30`
   - Pesan: "Batas maksimal akun [Role] sudah tercapai (X akun). Pilih role lain atau nonaktifkan akun yang ada."
   - Tombol submit: Disabled

2. **Slot Terakhir (Warning)**
   - Background: `bg-amber-50` / `dark:bg-amber-900/30`
   - Pesan: "Peringatan: Hanya tersisa 1 slot untuk role [Role]."
   - Tombol submit: Enabled

### 4.2 Dark Mode Improvements

| Element       | Light Mode        | Dark Mode              |
| ------------- | ----------------- | ---------------------- |
| Labels        | `text-gray-700`   | `dark:text-gray-300`   |
| Warning Alert | `bg-amber-50`     | `dark:bg-amber-900/30` |
| Error Alert   | `bg-red-50`       | `dark:bg-red-900/30`   |
| Cancel Button | `bg-white`        | `dark:bg-gray-700`     |
| Border        | `border-gray-300` | `dark:border-gray-600` |

---

## 5. Error Handling

### 5.1 Backend Response (HTTP 409 Conflict)

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Batas maksimal akun Super Admin sudah tercapai (1 akun). Hapus atau nonaktifkan akun yang ada sebelum membuat yang baru.",
  "error": "Conflict"
}
```

### 5.2 Frontend Handling

- Error message dari backend ditampilkan via notification toast
- Form tetap terbuka untuk user memperbaiki input

---

## 6. Testing

### 6.1 Test Cases

| No  | Skenario                                           | Expected Result           |
| --- | -------------------------------------------------- | ------------------------- |
| 1   | Create Super Admin ketika sudah ada 1              | Error 409: Batas tercapai |
| 2   | Create Admin Logistik ke-4                         | Error 409: Batas tercapai |
| 3   | Edit role ke Super Admin ketika sudah ada 1        | Error 409: Batas tercapai |
| 4   | Edit Super Admin yang sudah ada (tanpa ganti role) | Success                   |
| 5   | Create Staff                                       | Success (tidak ada batas) |

### 6.2 API Testing

```bash
# Get role limits
GET /api/v1/users/role-limits

# Response
[
  { "role": "SUPER_ADMIN", "displayName": "Super Admin", "limit": 1, "current": 1, "available": 0 },
  { "role": "ADMIN_LOGISTIK", "displayName": "Admin Logistik", "limit": 3, "current": 2, "available": 1 },
  { "role": "ADMIN_PURCHASE", "displayName": "Admin Purchase", "limit": 3, "current": 0, "available": 3 }
]
```

---

## 7. Checklist Implementasi

- [x] Tambah konstanta `ROLE_ACCOUNT_LIMITS`
- [x] Implementasi `validateRoleAccountLimit()` di service
- [x] Implementasi `getRoleAccountCounts()` di service
- [x] Tambah endpoint `GET /users/role-limits` di controller
- [x] Update `create()` untuk validasi batas akun
- [x] Update `update()` untuk validasi perubahan role
- [x] Tambah API method `getRoleLimits()` di frontend
- [x] Update `UserFormPage.tsx` untuk menampilkan warning
- [x] Perbaikan dark mode styling
- [x] Dokumentasi lengkap

---

## 8. File yang Diubah

| File                                            | Perubahan                       |
| ----------------------------------------------- | ------------------------------- |
| `backend/src/common/constants/app.constants.ts` | Tambah `ROLE_ACCOUNT_LIMITS`    |
| `backend/src/modules/users/users.service.ts`    | Tambah validasi dan method baru |
| `backend/src/modules/users/users.controller.ts` | Tambah endpoint `role-limits`   |
| `frontend/src/services/api/master-data.api.ts`  | Tambah `getRoleLimits()`        |
| `frontend/src/features/users/UserFormPage.tsx`  | UI warning dan dark mode        |

---

_Dokumentasi ini dibuat pada 27 Januari 2026_
