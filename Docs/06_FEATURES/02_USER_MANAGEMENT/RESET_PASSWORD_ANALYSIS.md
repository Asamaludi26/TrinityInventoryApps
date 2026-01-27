# Analisa Fitur: Reset Password & Tambah Akun dengan Password Standar

**Tanggal**: 27 Januari 2026  
**Modul**: User Management  
**Status**: 📋 Analisis untuk Pengembangan

---

## 📌 Ringkasan Eksekutif

Dokumen ini berisi analisa mendalam mengenai:

1. **Fitur Reset Password oleh Admin** - Cara kerja saat ini dan rekomendasi perbaikan
2. **Fitur Tambah Akun Pengguna Baru** - Implementasi password standar/default

Tujuan: Memastikan flow yang aman dan user-friendly untuk manajemen password dalam sistem Trinity Asset Management.

---

## 📊 Bagian 1: Analisa Fitur Reset Password

### 1.1 Kondisi Saat Ini

#### Flow Reset Password (Existing)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLOW RESET PASSWORD SAAT INI                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. User lupa password → Klik "Lupa Password" di Login Page             │
│  2. User memasukkan email                                               │
│  3. Sistem membuat request ke Super Admin                               │
│  4. Super Admin melihat banner di UserDetailPage                        │
│  5. Super Admin klik "Reset Sekarang"                                   │
│  6. Sistem generate password random 12 karakter                         │
│  7. Password ditampilkan di modal (hanya sekali)                        │
│  8. Super Admin copy password dan bagikan ke user                       │
│  9. User login dengan password baru → Disarankan ganti segera           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Komponen Terkait

| Komponen            | File                                             | Fungsi                                              |
| ------------------- | ------------------------------------------------ | --------------------------------------------------- |
| UserDetailPage      | `frontend/src/features/users/UserDetailPage.tsx` | UI untuk admin melihat detail user & reset password |
| useMasterDataStore  | `frontend/src/stores/useMasterDataStore.ts`      | State management untuk update user                  |
| users.service.ts    | `backend/src/modules/users/users.service.ts`     | Backend service untuk reset password                |
| users.controller.ts | `backend/src/modules/users/users.controller.ts`  | Endpoint `PATCH /users/:id/reset-password`          |

#### Kode Frontend - Generate Password

```typescript
// frontend/src/features/users/UserDetailPage.tsx
const generateSecurePassword = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const length = 12;
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};
```

#### Kode Backend - Reset Password

```typescript
// backend/src/modules/users/users.service.ts
async resetPassword(id: number, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return this.prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      passwordResetRequested: false,
      passwordResetRequestDate: null,
    },
  });
}
```

### 1.2 Masalah yang Teridentifikasi

| #   | Masalah                                   | Severity  | Keterangan                                  |
| --- | ----------------------------------------- | --------- | ------------------------------------------- |
| 1   | Password di-generate di frontend          | 🔴 High   | Kurang aman - seharusnya di backend         |
| 2   | Tidak ada forced password change          | 🟡 Medium | User bisa terus pakai password sementara    |
| 3   | Tidak ada expiry untuk password sementara | 🟡 Medium | Password sementara berlaku selamanya        |
| 4   | Tidak ada audit log                       | 🟡 Medium | Tidak ada catatan siapa yang reset password |
| 5   | Komunikasi manual                         | 🟢 Low    | Admin harus manual kirim password ke user   |

### 1.3 Rekomendasi Perbaikan

#### A. Pindahkan Password Generation ke Backend

```typescript
// backend/src/modules/users/users.service.ts
import * as crypto from 'crypto';

async resetPassword(id: number): Promise<{ temporaryPassword: string }> {
  // Generate password di backend (lebih aman)
  const temporaryPassword = this.generateSecurePassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  await this.prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      passwordResetRequested: false,
      passwordResetRequestDate: null,
      mustChangePassword: true, // Flag untuk paksa ganti password
      temporaryPasswordExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
    },
  });

  // Log activity
  await this.activityLogService.log({
    action: 'PASSWORD_RESET',
    entityType: 'User',
    entityId: id,
    performedBy: currentUserId, // Dari JWT
    details: { method: 'admin_reset' },
  });

  return { temporaryPassword };
}

private generateSecurePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const length = 12;
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
```

#### B. Update Database Schema

```prisma
// backend/prisma/schema.prisma
model User {
  // ... existing fields
  mustChangePassword        Boolean   @default(false)
  temporaryPasswordExpiresAt DateTime?
}
```

#### C. Force Password Change pada Login

```typescript
// backend/src/modules/auth/auth.service.ts
async login(loginDto: LoginDto): Promise<AuthResponse> {
  const user = await this.validateUser(loginDto.email, loginDto.password);

  // Check if must change password
  if (user.mustChangePassword) {
    // Check if temporary password expired
    if (user.temporaryPasswordExpiresAt && new Date() > user.temporaryPasswordExpiresAt) {
      throw new UnauthorizedException('Kata sandi sementara sudah kadaluarsa. Silakan hubungi admin.');
    }

    return {
      ...this.generateTokens(user),
      mustChangePassword: true,
    };
  }

  return this.generateTokens(user);
}
```

---

## 📊 Bagian 2: Analisa Fitur Tambah Akun Pengguna Baru

### 2.1 Kondisi Saat Ini

#### Flow Saat Ini

```
┌─────────────────────────────────────────────────────────────────────────┐
│               FLOW TAMBAH AKUN PENGGUNA SAAT INI                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Admin buka halaman "Tambah Akun Pengguna Baru"                      │
│  2. Admin isi: Nama, Email, Role, Divisi                                │
│  3. Admin TIDAK perlu input password                                    │
│  4. Sistem menyimpan user TANPA password (atau password kosong?)        │
│  5. User tidak bisa login (tidak ada password)                          │
│                                                                         │
│  ⚠️ MASALAH: Tidak ada mekanisme untuk set password awal!               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Kode Frontend - UserFormPage

```typescript
// frontend/src/features/users/UserFormPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name || !email) {
    addNotification("Nama dan Email wajib diisi.", "error");
    return;
  }

  const userData = {
    name,
    email,
    role: selectedRole,
    divisionId:
      selectedRole === "Super Admin" ? null : parseInt(selectedDivisionId),
    permissions: cleanPermissions,
    // ⚠️ TIDAK ADA PASSWORD!
  };

  if (editingUser) {
    await updateUser(editingUser.id, userData);
  } else {
    await addUser(userData); // User baru tanpa password
  }
};
```

#### Kode Backend - CreateUserDto

```typescript
// backend/src/modules/users/dto/create-user.dto.ts
export class CreateUserDto {
  @IsEmail({}, { message: "Format email tidak valid" })
  @IsNotEmpty({ message: "Email wajib diisi" })
  email: string;

  @IsNotEmpty({ message: "Password wajib diisi" }) // ⚠️ Required tapi tidak dikirim!
  @MinLength(6, { message: "Password minimal 6 karakter" })
  password: string;

  // ... other fields
}
```

### 2.2 Masalah yang Teridentifikasi

| #   | Masalah                                         | Severity    | Keterangan                         |
| --- | ----------------------------------------------- | ----------- | ---------------------------------- |
| 1   | User baru tidak punya password                  | 🔴 Critical | User tidak bisa login              |
| 2   | DTO wajibkan password tapi frontend tidak kirim | 🔴 Critical | Request akan ditolak backend       |
| 3   | Tidak ada flow set password pertama kali        | 🔴 Critical | User baru tidak bisa aktivasi akun |

### 2.3 Rekomendasi: Implementasi Password Standar

#### Opsi A: Password Standar (Rekomendasi untuk MVP)

**Konsep**: Gunakan password default yang sama untuk semua user baru, dengan forced change pada login pertama.

**Password Standar yang Disarankan**: `Trinity@2026`

```
┌─────────────────────────────────────────────────────────────────────────┐
│               FLOW BARU DENGAN PASSWORD STANDAR                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Admin buka halaman "Tambah Akun Pengguna Baru"                      │
│  2. Admin isi: Nama, Email, Role, Divisi                                │
│  3. Sistem otomatis set password: "Trinity@2026"                        │
│  4. Sistem set flag: mustChangePassword = true                          │
│  5. Admin info ke user: "Password awal: Trinity@2026"                   │
│  6. User login dengan password standar                                  │
│  7. Sistem paksa user ke halaman ganti password                         │
│  8. User set password baru sesuai kriteria                              │
│  9. User bisa menggunakan sistem secara normal                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Implementasi Backend

```typescript
// backend/src/common/constants.ts
export const DEFAULT_PASSWORD = 'Trinity@2026';

// backend/src/modules/users/users.service.ts
async create(createUserDto: CreateUserDto) {
  // Validasi...

  // Gunakan password dari DTO atau default
  const password = createUserDto.password || DEFAULT_PASSWORD;
  const hashedPassword = await bcrypt.hash(password, 10);

  return this.prisma.user.create({
    data: {
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role || UserRole.STAFF,
      divisionId: createUserDto.divisionId,
      permissions: createUserDto.permissions,
      mustChangePassword: !createUserDto.password, // True jika pakai default
    },
    include: { division: true },
  });
}
```

#### Update DTO

```typescript
// backend/src/modules/users/dto/create-user.dto.ts
export class CreateUserDto {
  @IsEmail({}, { message: "Format email tidak valid" })
  @IsNotEmpty({ message: "Email wajib diisi" })
  email: string;

  @IsOptional() // Ubah dari @IsNotEmpty
  @MinLength(8, { message: "Password minimal 8 karakter" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password harus mengandung huruf besar, huruf kecil, dan angka",
  })
  password?: string; // Optional - akan pakai default jika kosong

  @IsNotEmpty({ message: "Nama wajib diisi" })
  name: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Role tidak valid" })
  role?: UserRole;

  @IsOptional()
  @IsInt({ message: "Division ID harus berupa angka" })
  divisionId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
```

#### Update Frontend - UserFormPage

```typescript
// frontend/src/features/users/UserFormPage.tsx

// Tambahkan info password standar di UI
{!editingUser && (
  <div className="p-4 bg-info-light border border-info rounded-lg flex items-start gap-3 text-info-text">
    <BsInfoCircle className="w-5 h-5 mt-0.5" />
    <div className="text-sm">
      <strong>Info Password Awal</strong>
      <p className="mt-1">
        Akun baru akan menggunakan password standar: <code className="font-mono bg-white px-2 py-0.5 rounded">Trinity@2026</code>
      </p>
      <p className="mt-1">
        User wajib mengganti password saat pertama kali login.
      </p>
    </div>
  </div>
)}
```

#### Opsi B: Generate Random Password (Lebih Aman)

**Konsep**: Generate password acak untuk setiap user baru dan tampilkan ke admin.

```
┌─────────────────────────────────────────────────────────────────────────┐
│               FLOW DENGAN RANDOM PASSWORD                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Admin buka halaman "Tambah Akun Pengguna Baru"                      │
│  2. Admin isi: Nama, Email, Role, Divisi                                │
│  3. Admin klik "Simpan"                                                 │
│  4. Backend generate password random: "xK7#mP2@qL9n"                    │
│  5. Modal muncul menampilkan password (SEKALI SAJA)                     │
│  6. Admin copy password dan bagikan ke user                             │
│  7. User login → Paksa ganti password                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Perbandingan Opsi

| Aspek            | Opsi A: Password Standar       | Opsi B: Random Password     |
| ---------------- | ------------------------------ | --------------------------- |
| **Keamanan**     | 🟡 Sedang (password diketahui) | 🟢 Tinggi                   |
| **Kemudahan**    | 🟢 Sangat mudah                | 🟡 Sedang                   |
| **Risiko**       | User lupa ganti password       | Admin lupa bagikan password |
| **Implementasi** | 🟢 Sederhana                   | 🟡 Perlu UI modal           |
| **UX Admin**     | Tidak perlu copy password      | Perlu copy-paste            |
| **UX User**      | Mudah diingat awal             | Perlu bantuan admin         |

---

## 🎯 Rekomendasi Implementasi

### Fase 1 (Immediate - MVP)

1. **Implementasi Password Standar** `Trinity@2026`
2. **Tambah field `mustChangePassword`** di database
3. **Update CreateUserDto** - password optional
4. **Update UserFormPage** - tampilkan info password standar
5. **Validasi di Login** - check mustChangePassword flag

### Fase 2 (Future Enhancement)

1. **Force Password Change UI** - redirect ke halaman ganti password
2. **Password Expiry** - temporary password expire dalam 24 jam
3. **Activity Logging** - catat semua operasi password
4. **Email Notification** - kirim email dengan password ke user baru

---

## 🔐 Pertimbangan Keamanan

### Password Standar Aman Jika:

1. ✅ Ada flag `mustChangePassword` yang dipaksa
2. ✅ Password standar tidak terlalu simpel
3. ✅ Ada monitoring login attempts
4. ✅ Admin ditraining untuk segera info user

### Risiko yang Harus Dimitigasi:

1. User tidak segera ganti password
2. Password standar bocor ke pihak luar
3. Brute force attack dengan password standar

### Mitigasi:

1. Force redirect ke halaman ganti password
2. Password standar cukup kompleks
3. Rate limiting pada login endpoint
4. Temporary password expiry (24 jam)

---

## 📁 File yang Perlu Dimodifikasi

### Backend

1. `backend/prisma/schema.prisma` - Tambah field mustChangePassword
2. `backend/src/common/constants.ts` - Konstanta DEFAULT_PASSWORD
3. `backend/src/modules/users/dto/create-user.dto.ts` - Password optional
4. `backend/src/modules/users/users.service.ts` - Logic default password
5. `backend/src/modules/auth/auth.service.ts` - Check mustChangePassword

### Frontend

1. `frontend/src/features/users/UserFormPage.tsx` - Info password standar
2. `frontend/src/features/auth/LoginPage.tsx` - Handle mustChangePassword response
3. `frontend/src/features/users/ForceChangePasswordPage.tsx` - Halaman baru (opsional)

---

## 📝 Checklist Implementasi

- [ ] Update Prisma schema dengan field `mustChangePassword`
- [ ] Run migration: `pnpm prisma:migrate`
- [ ] Update CreateUserDto - password optional
- [ ] Update UsersService.create() - default password logic
- [ ] Update AuthService.login() - check mustChangePassword
- [ ] Update UserFormPage - tampilkan info password standar
- [ ] Testing: Create user baru → Login → Force change password
- [ ] Update dokumentasi API

---

_Dokumen analisa ini dibuat pada 27 Januari 2026 untuk perencanaan pengembangan fitur._
