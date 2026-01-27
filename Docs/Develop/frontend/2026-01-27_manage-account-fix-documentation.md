# Dokumentasi Perbaikan Fitur "Kelola Akun Saya"

**Tanggal**: 27 Januari 2026  
**Modul**: Frontend - User Management  
**File Utama**: `frontend/src/features/users/ManageAccountPage.tsx`

---

## 1. Ringkasan Masalah

### 1.1 Masalah Awal

Fitur validasi kata sandi saat ini pada halaman "Kelola Akun Saya" tidak berfungsi. Spinner validasi terus berputar tanpa henti meskipun backend sudah mengembalikan response yang benar (HTTP 201).

### 1.2 Investigasi

- Backend endpoint `POST /api/v1/users/:id/verify-password` **sudah berfungsi dengan benar** (terkonfirmasi dari log terminal)
- Masalah terletak di **frontend** - handler tidak terpanggil dengan benar
- Implementasi sebelumnya menggunakan `useCallback` dengan dependency kompleks dan caching yang menyebabkan closure stale

---

## 2. Solusi yang Diterapkan

### 2.1 Rewrite Hook `useManageAccountLogic.ts`

**Pendekatan Baru**: Menggunakan `useEffect` dengan debounce sederhana, bukan `useCallback` dengan refs kompleks.

```typescript
// SEBELUM (Tidak berfungsi)
const handleCurrentPasswordChange = useCallback(
  (password) => {
    // Debounce manual dengan setTimeout di dalam useCallback
    // Menyebabkan closure stale
  },
  [executePasswordVerification],
);

// SESUDAH (Berfungsi)
useEffect(() => {
  if (!currentPassword || currentPassword.length < 3) {
    // Reset state
    return;
  }

  setPasswordValidation((prev) => ({
    ...prev,
    currentPasswordVerifying: true,
  }));

  const timer = setTimeout(() => {
    usersApi
      .verifyPassword(currentUser.id, currentPassword)
      .then((result) => {
        // Update state dengan hasil
      })
      .catch(() => {
        // Handle error
      });
  }, 600);

  return () => clearTimeout(timer);
}, [currentPassword, currentUser.id]);
```

**Keuntungan**:

- React menjamin `useEffect` dijalankan saat dependency berubah
- Cleanup function otomatis membatalkan timer sebelumnya
- Tidak ada masalah closure stale

### 2.2 Fitur Validasi Baru: Password Tidak Boleh Sama

**Ditambahkan validasi**: Kata sandi baru tidak boleh sama dengan kata sandi saat ini.

**Frontend** (`useManageAccountLogic.ts`):

```typescript
// State baru
interface PasswordValidationState {
  // ... existing fields
  newPasswordSameAsCurrent: boolean;
}

// Effect untuk cek kesamaan
useEffect(() => {
  const isSame = !!(
    currentPassword &&
    newPassword &&
    currentPassword === newPassword
  );
  setPasswordValidation((prev) => ({
    ...prev,
    newPasswordSameAsCurrent: isSame,
  }));
}, [currentPassword, newPassword]);
```

**Backend** (`users.service.ts`):

```typescript
// Validasi di service
if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
  throw new BadRequestException(
    "Kata sandi baru tidak boleh sama dengan kata sandi saat ini",
  );
}
```

**Backend DTO** (`change-password.dto.ts`):

```typescript
@MinLength(8, { message: 'Kata sandi baru minimal 8 karakter' })
@MaxLength(128, { message: 'Kata sandi baru maksimal 128 karakter' })
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/, {
  message: 'Kata sandi baru harus mengandung huruf besar, huruf kecil, angka, dan simbol',
})
@Matches(/^\S+$/, { message: 'Kata sandi baru tidak boleh mengandung spasi' })
newPassword: string;
```

---

## 3. Perbaikan UI/UX Dark Mode

### 3.1 Perubahan Warna

| Elemen                   | Light Mode               | Dark Mode                          |
| ------------------------ | ------------------------ | ---------------------------------- |
| Judul "Kelola Akun Saya" | `text-gray-900`          | `text-white`                       |
| Card Container           | `bg-white`               | `bg-gray-800`                      |
| Input Fields             | `bg-white text-gray-900` | **Tetap** `bg-white text-gray-900` |
| Labels                   | `text-gray-700`          | `text-gray-300`                    |
| Section Titles           | `text-gray-900`          | `text-gray-100`                    |
| Deskripsi                | `text-gray-500`          | `text-gray-400`                    |
| Alert Warning            | `bg-amber-50`            | `bg-amber-500/20`                  |
| Alert Error              | `bg-red-50`              | `bg-red-500/20`                    |
| Button Secondary         | `bg-white`               | `bg-gray-700`                      |

### 3.2 File yang Diubah

1. **`FormPageLayout.tsx`**
   - Title: `dark:text-white`
   - Card: `dark:bg-gray-800 dark:border-gray-700`

2. **`ManageAccountPage.tsx`**
   - Input tetap dengan background putih (konsisten di light/dark)
   - Labels dan section titles dengan kontras yang sesuai
   - Button actions dengan styling dark mode

3. **`PasswordAlert.tsx`**
   - Warning: `dark:bg-amber-500/20 dark:text-amber-100`
   - Error: `dark:bg-red-500/20 dark:text-red-100`

4. **`PasswordStrengthMeter.tsx`**
   - Label dan bar dengan warna dark mode yang tepat

5. **`ReloginSuccessModal.tsx`**
   - Modal background: `dark:bg-gray-900`
   - Content dengan kontras yang baik

---

## 4. Komponen dan Alur

### 4.1 Struktur File

```
frontend/src/features/users/
├── ManageAccountPage.tsx          # Halaman utama
├── hooks/
│   └── useManageAccountLogic.ts   # Business logic & state management
└── components/
    ├── PasswordAlert.tsx          # Alert untuk validasi error
    ├── PasswordStrengthMeter.tsx  # Meter kekuatan password
    └── ReloginSuccessModal.tsx    # Modal setelah ganti password
```

### 4.2 Alur Validasi Password

```
User ketik password saat ini
         │
         ▼
   [useEffect trigger]
         │
         ▼
   Tunggu 600ms (debounce)
         │
         ▼
   Panggil API verifyPassword
         │
         ▼
   ┌─────┴─────┐
   │           │
Valid       Invalid
   │           │
   ▼           ▼
✓ Hijau    ✗ Merah + Alert
```

### 4.3 Kondisi Submit

Form dapat di-submit jika:

1. Nama dan email valid
2. **ATAU** tidak ada perubahan password
3. **ATAU** jika ada password baru:
   - Password saat ini valid (terverifikasi)
   - Password baru ≠ password saat ini
   - Konfirmasi password cocok
   - Semua kriteria password terpenuhi (8 karakter, huruf besar/kecil, angka, simbol)

---

## 5. Testing

### 5.1 Test Cases

| No  | Skenario                          | Expected Result                          |
| --- | --------------------------------- | ---------------------------------------- |
| 1   | Input password < 3 karakter       | Tidak ada validasi                       |
| 2   | Input password salah              | Alert "Kata sandi saat ini tidak sesuai" |
| 3   | Input password benar              | Centang hijau                            |
| 4   | Password baru = password saat ini | Alert "tidak boleh sama"                 |
| 5   | Konfirmasi tidak cocok            | Alert "tidak cocok"                      |
| 6   | Semua valid                       | Tombol "Simpan Perubahan" aktif          |

### 5.2 API Endpoints

- `POST /api/v1/users/:id/verify-password` - Verifikasi password saat ini
- `PATCH /api/v1/users/:id/change-password` - Ganti password

---

## 6. Catatan Penting

1. **Input field tetap putih di dark mode** untuk konsistensi dan readability
2. **Debounce 600ms** untuk mengurangi API calls berlebihan
3. **Validasi ganda** (frontend + backend) untuk keamanan
4. **Re-login required** setelah sukses ganti password untuk keamanan sesi

---

## 7. Changelog

- **v1.0** - Implementasi awal (tidak berfungsi)
- **v1.1** - Rewrite dengan useEffect + debounce sederhana
- **v1.2** - Tambah validasi password tidak boleh sama
- **v1.3** - Perbaikan tampilan dark mode
- **v1.4** - Final polish: input tetap putih, kontras optimal
