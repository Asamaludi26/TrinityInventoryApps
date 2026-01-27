# Dokumentasi: Implementasi Password Standar untuk Akun Baru

**Tanggal**: 27 Januari 2026  
**Modul**: User Management  
**Versi**: 1.0.0

---

## 📋 Ringkasan

Implementasi fitur password standar untuk mengatasi masalah pembuatan akun pengguna baru yang sebelumnya gagal karena field password tidak disertakan. Dengan fitur ini:

1. Admin dapat membuat akun baru **tanpa harus memasukkan password**
2. Sistem secara otomatis menggunakan password standar: `Trinity@2026`
3. User **wajib mengganti password** saat pertama kali login untuk keamanan

---

## 🎯 Masalah yang Diselesaikan

### Sebelum (Masalah)

```
Frontend (UserFormPage)          Backend (CreateUserDto)
┌──────────────────────┐        ┌──────────────────────┐
│ Form tanpa field     │  ───>  │ @IsNotEmpty()        │
│ password             │        │ password: string     │
└──────────────────────┘        └──────────────────────┘
                                         │
                                         ▼
                                 ❌ ValidationError:
                                 "Password wajib diisi"
```

### Sesudah (Solusi)

```
Frontend (UserFormPage)          Backend (CreateUserDto)
┌──────────────────────┐        ┌──────────────────────┐
│ Form tanpa password  │  ───>  │ @IsOptional()        │
│ + Info default pass  │        │ password?: string    │
└──────────────────────┘        └──────────────────────┘
                                         │
                                         ▼
                                 UsersService.create()
                                         │
                                         ▼
                         ┌───────────────────────────────┐
                         │ if (!password)                │
                         │   password = "Trinity@2026"   │
                         │   mustChangePassword = true   │
                         └───────────────────────────────┘
                                         │
                                         ▼
                                 ✅ User Created!
```

---

## 📁 File yang Dimodifikasi

### Backend

| File                                       | Perubahan                                                  |
| ------------------------------------------ | ---------------------------------------------------------- |
| `prisma/schema.prisma`                     | Tambah field `mustChangePassword Boolean @default(false)`  |
| `src/common/constants/app.constants.ts`    | Tambah konstanta `DEFAULT_USER_PASSWORD = 'Trinity@2026'`  |
| `src/modules/users/dto/create-user.dto.ts` | Password jadi `@IsOptional()` dengan validasi kompleksitas |
| `src/modules/users/users.service.ts`       | Logic default password dan set `mustChangePassword` flag   |
| `src/modules/auth/auth.service.ts`         | Sertakan `mustChangePassword` dalam response login         |

### Frontend

| File                                  | Perubahan                                                 |
| ------------------------------------- | --------------------------------------------------------- |
| `src/types/index.ts`                  | Tambah `mustChangePassword?: boolean` di interface `User` |
| `src/features/users/UserFormPage.tsx` | Info box password standar dengan styling dark mode        |

### Database Migration

```sql
-- 20260127130123_add_must_change_password/migration.sql
ALTER TABLE "users" ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false;
```

---

## 🔧 Detail Implementasi

### 1. Konstanta Password Standar

```typescript
// backend/src/common/constants/app.constants.ts
export const DEFAULT_USER_PASSWORD = "Trinity@2026";
```

Password ini memenuhi kriteria:

- ✅ Minimal 8 karakter (12 karakter)
- ✅ Huruf besar (T)
- ✅ Huruf kecil (rinity)
- ✅ Angka (2026)
- ✅ Simbol (@)

### 2. DTO dengan Password Opsional

```typescript
// backend/src/modules/users/dto/create-user.dto.ts
@IsOptional()
@MinLength(8, { message: 'Password minimal 8 karakter' })
@MaxLength(128, { message: 'Password maksimal 128 karakter' })
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
})
password?: string;
```

### 3. Service Logic

```typescript
// backend/src/modules/users/users.service.ts
async create(createUserDto: CreateUserDto) {
  // Gunakan default password jika tidak disediakan
  const useDefaultPassword = !createUserDto.password;
  const passwordToHash = createUserDto.password || DEFAULT_USER_PASSWORD;
  const hashedPassword = await bcrypt.hash(passwordToHash, 10);

  const createData = {
    // ... other fields
    password: hashedPassword,
    mustChangePassword: useDefaultPassword, // true jika pakai default
  };

  return this.prisma.user.create({ data: createData });
}
```

### 4. Auth Response

```typescript
// backend/src/modules/auth/auth.service.ts
return {
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    division: user.division?.name,
    permissions: user.permissions,
    mustChangePassword: user.mustChangePassword, // Flag untuk frontend
  },
  token,
};
```

### 5. Frontend Info Box

```tsx
// frontend/src/features/users/UserFormPage.tsx
{
  !editingUser && (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg ...">
      <BsInfoCircle className="w-5 h-5" />
      <div className="text-sm">
        <strong>Informasi Password Awal</strong>
        <p>
          Akun baru akan menggunakan password standar: <code>Trinity@2026</code>
        </p>
        <p>
          Pengguna <strong>wajib mengganti password</strong>
          saat pertama kali login untuk keamanan.
        </p>
      </div>
    </div>
  );
}
```

---

## 🔒 Alur Keamanan

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLOW AKUN BARU DENGAN PASSWORD STANDAR               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Admin buka halaman "Tambah Akun Pengguna Baru"                      │
│  2. Info box menampilkan password standar: Trinity@2026                 │
│  3. Admin isi: Nama, Email, Role, Divisi (tanpa password)               │
│  4. Admin klik "Simpan Akun"                                            │
│  5. Backend:                                                            │
│     - Gunakan password standar: Trinity@2026                            │
│     - Set mustChangePassword = true                                     │
│  6. Admin info ke user: "Password awal: Trinity@2026"                   │
│  7. User login dengan password standar                                  │
│  8. Frontend menerima response dengan mustChangePassword = true         │
│  9. [FUTURE] Redirect user ke halaman ganti password                    │
│ 10. User set password baru sesuai kriteria                              │
│ 11. mustChangePassword = false setelah ganti password                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Case 1: Buat Akun Tanpa Password

```bash
# POST /api/users
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@trinitimedia.com",
    "role": "STAFF",
    "divisionId": 1
  }'

# Expected Response:
{
  "id": 10,
  "name": "John Doe",
  "email": "john@trinitimedia.com",
  "role": "STAFF",
  "mustChangePassword": true,
  ...
}
```

### Test Case 2: Login dengan Password Standar

```bash
# POST /api/auth/login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@trinitimedia.com",
    "password": "Trinity@2026"
  }'

# Expected Response:
{
  "user": {
    "id": 10,
    "email": "john@trinitimedia.com",
    "mustChangePassword": true,
    ...
  },
  "token": "..."
}
```

### Test Case 3: Ganti Password

```bash
# PATCH /api/users/10/change-password
curl -X PATCH http://localhost:3001/api/users/10/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Trinity@2026",
    "newPassword": "NewSecureP@ss123"
  }'

# After this, mustChangePassword becomes false
```

---

## 📋 Checklist Implementasi

- [x] Update Prisma schema dengan field `mustChangePassword`
- [x] Tambah konstanta `DEFAULT_USER_PASSWORD`
- [x] Update `CreateUserDto` - password optional
- [x] Update `UsersService.create()` - logic default password
- [x] Update `UsersService.changePassword()` - reset flag
- [x] Update `AuthService.login()` - sertakan flag dalam response
- [x] Update frontend `User` interface
- [x] Update `UserFormPage` - info box password standar
- [x] Run database migration
- [x] Generate Prisma client
- [ ] [FUTURE] Implementasi force redirect ke halaman ganti password

---

## 🚀 Pengembangan Lanjutan (Future)

1. **Force Redirect**: Implementasi redirect otomatis ke halaman "Kelola Akun Saya" jika `mustChangePassword = true`

2. **Password Expiry**: Tambah `temporaryPasswordExpiresAt` untuk membatasi waktu password standar berlaku

3. **Email Notification**: Kirim email ke user baru dengan informasi login awal

4. **Audit Log**: Catat siapa yang membuat akun dan kapan

---

## ✅ Hasil Testing (27 Januari 2026)

### Test 1: Create User Without Password - **PASSED ✅**

```json
// Request
POST /api/v1/users
{
  "name": "Test User Default",
  "email": "testuser@trinity.com",
  "role": "STAFF",
  "divisionId": 1
}

// Response
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Test User Default",
    "email": "testuser@trinity.com",
    "password": "$2b$10$bQ5pF9PiTd0QQgV2iDom3.ehKrTkqM18uPibmXtNUHUhMLIaD.tMG",
    "role": "STAFF",
    "mustChangePassword": true,  // ✅ Flag correctly set
    "divisionId": 1,
    ...
  }
}
```

### Test 2: Login with Default Password - **PASSED ✅**

```json
// Request
POST /api/v1/auth/login
{
  "email": "testuser@trinity.com",
  "password": "Trinity@2026"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "testuser@trinity.com",
      "name": "Test User Default",
      "role": "STAFF",
      "division": "Logistik",
      "permissions": [],
      "mustChangePassword": true  // ✅ Flag available for frontend
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Summary

| Test Case                      | Status    |
| ------------------------------ | --------- |
| Create user without password   | ✅ PASSED |
| Password hashed correctly      | ✅ PASSED |
| mustChangePassword flag set    | ✅ PASSED |
| Login with default password    | ✅ PASSED |
| Flag included in auth response | ✅ PASSED |

---

## 📚 Referensi

- [RESET_PASSWORD_ANALYSIS.md](RESET_PASSWORD_ANALYSIS.md) - Analisa lengkap fitur reset password
- [MANAGE_ACCOUNT_REFACTOR.md](MANAGE_ACCOUNT_REFACTOR.md) - Dokumentasi refaktor kelola akun
- [API Reference](../../../doc2/api.md) - Dokumentasi API lengkap

---

_Dokumentasi ini dibuat pada 27 Januari 2026_
_Terakhir diupdate: 27 Januari 2026 - Ditambahkan hasil testing_
