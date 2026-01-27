# Dokumentasi Update: Refaktor Fitur Kelola Akun Saya

**Tanggal**: 27 Januari 2026  
**Versi**: 1.4.0  
**Modul**: Authentication / User Management

---

## 📋 Ringkasan Perubahan

Refaktorisasi fitur "Kelola Akun Saya" untuk meningkatkan keamanan dan pengalaman pengguna dengan validasi real-time dan notifikasi modern.

### Fitur Baru

1. **Validasi Kata Sandi Saat Ini Secara Real-time**
   - Password lama diverifikasi langsung ke database menggunakan debounce (800ms)
   - Menampilkan status loading, valid, atau invalid dengan indikator visual
   - Alert modern muncul jika password tidak cocok

2. **Validasi Kecocokan Kata Sandi Baru**
   - Konfirmasi password divalidasi secara real-time
   - Alert error modern muncul jika tidak cocok
   - Indikator visual (check/cross) pada input field

3. **Modal Relogin Sukses**
   - Modal elegan dengan animasi muncul setelah password berhasil diubah
   - Informasi jelas bahwa user harus login ulang
   - Tombol "Login Kembali" yang melogout dan redirect ke halaman login

4. **Tombol Simpan Cerdas**
   - Tombol disabled otomatis jika ada validasi yang gagal
   - Visual feedback berbeda untuk state enabled/disabled

---

## 🗂️ File yang Diubah/Dibuat

### Backend

| File                                                   | Perubahan                                         |
| ------------------------------------------------------ | ------------------------------------------------- |
| `backend/src/modules/users/dto/verify-password.dto.ts` | **BARU** - DTO untuk validasi password            |
| `backend/src/modules/users/users.service.ts`           | Tambah method `verifyPassword()`                  |
| `backend/src/modules/users/users.controller.ts`        | Tambah endpoint `POST /users/:id/verify-password` |

### Frontend

| File                                                             | Perubahan                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| `frontend/src/services/api/master-data.api.ts`                   | Tambah fungsi `verifyPassword()`                          |
| `frontend/src/features/users/hooks/useManageAccountLogic.ts`     | **TULIS ULANG** - Logic lengkap dengan validasi real-time |
| `frontend/src/features/users/ManageAccountPage.tsx`              | **TULIS ULANG** - UI dengan alert dan modal baru          |
| `frontend/src/features/users/components/PasswordAlert.tsx`       | **BARU** - Komponen alert modern                          |
| `frontend/src/features/users/components/ReloginSuccessModal.tsx` | **BARU** - Modal sukses elegan                            |

---

## 🔧 Detail Teknis

### 1. Endpoint Backend Baru

```typescript
// POST /api/users/:id/verify-password
// Request Body:
{ "password": "string" }

// Response:
{ "valid": boolean }
```

**Security**: Endpoint ini memverifikasi password menggunakan bcrypt.compare() dan hanya mengembalikan status valid/invalid tanpa informasi sensitif.

### 2. State Management Hook

```typescript
interface PasswordValidationState {
  currentPasswordValid: boolean | null; // null = belum diverifikasi
  currentPasswordVerifying: boolean; // status loading
  currentPasswordError: string; // pesan error
  confirmPasswordMatch: boolean | null; // kecocokan konfirmasi
}
```

### 3. Debounce Implementation

Menggunakan custom debounce function untuk menghindari dependency lodash:

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): T & { cancel: () => void };
```

### 4. Computed canSubmit

Tombol simpan akan disabled jika:

- Sedang loading atau redirecting
- Nama atau email kosong
- Password baru ada tapi:
  - Password lama belum diverifikasi valid
  - Konfirmasi password tidak cocok
  - Kriteria password tidak terpenuhi

---

## 🎨 Komponen UI Baru

### PasswordAlert

Alert modern dengan dua varian:

- `warning` - Background amber, icon segitiga
- `error` - Background merah, icon X

```tsx
<PasswordAlert
  type="warning"
  message="Kata sandi saat ini tidak sesuai"
  show={true}
/>
```

### ReloginSuccessModal

Modal sukses dengan:

- Header gradient hijau-emerald
- Icon check dengan animasi
- Informasi keamanan di info box
- Tombol login dengan loading state

```tsx
<ReloginSuccessModal
  isOpen={showReloginModal}
  onRelogin={handleRelogin}
  isRedirecting={isRedirecting}
/>
```

---

## 📐 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   KELOLA AKUN SAYA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ PROFIL                                                │  │
│  │ ├─ Nama Lengkap: [input]                              │  │
│  │ └─ Alamat Email: [input]                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UBAH KATA SANDI                                       │  │
│  │                                                       │  │
│  │ Kata Sandi Saat Ini:                                  │  │
│  │ [●●●●●●●●] [🔄 verifying] [✓ valid] [✗ invalid]       │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ ⚠️ Kata sandi saat ini tidak sesuai dengan akun │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │ Kata Sandi Baru:                                      │  │
│  │ [●●●●●●●●] [strength meter]                           │  │
│  │ ├─ ✓ Minimal 8 karakter                               │  │
│  │ ├─ ✓ Huruf besar & kecil                              │  │
│  │ ├─ ✓ Angka                                            │  │
│  │ └─ ✗ Simbol                                           │  │
│  │                                                       │  │
│  │ Konfirmasi Kata Sandi Baru:                           │  │
│  │ [●●●●●●●●] [✓ match] [✗ no match]                     │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ ❌ Konfirmasi kata sandi tidak cocok            │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │    [Kembali]    [Simpan Perubahan - enabled/disabled]│    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

           ↓ Jika password berhasil diubah

┌─────────────────────────────────────────────────────────────┐
│                  MODAL RELOGIN SUKSES                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     🎉 Gradient Header                                │  │
│  │         ✓                                             │  │
│  │   Password Berhasil Diubah!                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Demi keamanan akun Anda, silakan login kembali             │
│  dengan password baru Anda.                                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ℹ️ Sesi Anda saat ini akan berakhir.                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│           [ 🔐 Login Kembali ]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Manual Testing

- [x] Masukkan password lama yang salah → Alert warning muncul
- [x] Masukkan password lama yang benar → Tanda check hijau muncul
- [x] Password baru tidak cocok dengan konfirmasi → Alert error muncul
- [x] Password baru cocok dengan konfirmasi → Tanda check hijau muncul
- [x] Password baru sama dengan password saat ini → Alert error muncul
- [x] Semua validasi gagal → Tombol simpan disabled
- [x] Semua validasi berhasil → Tombol simpan enabled
- [x] Submit sukses ganti password → Modal relogin muncul
- [x] Klik "Login Kembali" → Redirect ke halaman login
- [x] Dark mode: Semua komponen terbaca dengan baik

### Edge Cases

- [x] Debounce berfungsi (600ms, tidak spam request ke server)
- [x] Cancel request sebelumnya saat input berubah (via cleanup function)
- [x] Handle network error dengan graceful
- [x] Cleanup pada unmount component

---

## 🐛 Troubleshooting

### Masalah: Spinner Validasi Berputar Tanpa Henti

**Gejala**: Setelah mengetik password saat ini, spinner terus berputar meskipun backend sudah merespons.

**Root Cause**: Implementasi useCallback dengan dependency kompleks menyebabkan closure stale.

**Solusi**: Rewrite total menggunakan useEffect dengan debounce sederhana:

```typescript
// SEBELUM (Tidak berfungsi - closure stale)
const handleCurrentPasswordChange = useCallback(
  (password) => {
    const timer = setTimeout(() => {
      // Closure menyimpan nilai lama dari executePasswordVerification
      executePasswordVerification(password);
    }, 600);
    return () => clearTimeout(timer);
  },
  [executePasswordVerification],
);

// SESUDAH (Berfungsi)
useEffect(() => {
  if (!currentPassword || currentPassword.length < 3) {
    setPasswordValidation((prev) => ({
      ...prev,
      currentPasswordValid: null,
      currentPasswordVerifying: false,
    }));
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
        setPasswordValidation((prev) => ({
          ...prev,
          currentPasswordValid: result.valid,
          currentPasswordVerifying: false,
        }));
      })
      .catch(() => {
        setPasswordValidation((prev) => ({
          ...prev,
          currentPasswordValid: false,
          currentPasswordVerifying: false,
        }));
      });
  }, 600);

  return () => clearTimeout(timer);
}, [currentPassword, currentUser.id]);
```

### Masalah: Dark Mode Text Tidak Terbaca

**Gejala**: Text pada input dan labels tidak terlihat di dark mode.

**Solusi**: Gunakan background putih konsisten untuk input fields:

```tsx
// Input dengan background putih (light & dark mode)
className =
  "block w-full px-3 py-2 bg-gray-50 border border-gray-300 text-sm text-gray-700 rounded-lg shadow-sm";
```

---

## 📝 API Reference

### Verify Password

```http
POST /api/users/:id/verify-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "current_password_here"
}
```

**Responses:**

| Status | Body                                        | Keterangan           |
| ------ | ------------------------------------------- | -------------------- |
| 200    | `{ "valid": true }`                         | Password cocok       |
| 200    | `{ "valid": false }`                        | Password tidak cocok |
| 404    | `{ "message": "Pengguna tidak ditemukan" }` | User ID tidak ada    |
| 401    | `{ "message": "Unauthorized" }`             | Token invalid        |

---

## 🚀 Deployment Notes

1. **Database**: Tidak ada perubahan schema, tidak perlu migrasi
2. **Environment**: Tidak ada env vars baru
3. **Breaking Changes**: Tidak ada
4. **Backward Compatible**: Ya, endpoint baru hanya ditambahkan

---

## 📚 Related Documentation

- [BACKEND_GUIDE.md](../02_DEVELOPMENT_GUIDES/BACKEND_GUIDE.md) - Panduan backend
- [STATE_MANAGEMENT_GUIDE.md](../02_DEVELOPMENT_GUIDES/STATE_MANAGEMENT_GUIDE.md) - Panduan state
- [API_REFERENCE.md](../02_DEVELOPMENT_GUIDES/API_REFERENCE.md) - Referensi API lengkap

---

_Dokumentasi ini dibuat pada 27 Januari 2026_
