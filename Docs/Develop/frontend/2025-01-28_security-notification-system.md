# Security Notification System Implementation

**Tanggal**: 28 Januari 2026  
**Tipe**: Feature Enhancement  
**Status**: ✅ Completed

## Ringkasan

Implementasi sistem notifikasi keamanan modern dengan pendekatan profesional SaaS:

1. **Token Version** - Invalidasi token JWT saat password di-reset admin
2. **Force Change Password Modal** - Modal wajib yang tidak bisa di-dismiss untuk paksa ganti password
3. **Session Expired Modal** - Modal modern dengan countdown untuk mengganti `alert()` JavaScript
4. **Token Heartbeat** - Real-time token validation setiap 30 detik

## File yang Dibuat/Dimodifikasi

### File Baru

| File                                                       | Deskripsi                                                   |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| `frontend/src/components/ui/ForceChangePasswordNotice.tsx` | Modal WAJIB untuk paksa ganti password (tidak bisa dismiss) |
| `frontend/src/components/ui/SessionExpiredModal.tsx`       | Modal untuk sesi expired dengan countdown auto-redirect     |
| `frontend/src/components/ui/SecurityBanner.tsx`            | Komponen banner notifikasi keamanan dengan gradient styling |
| `frontend/src/stores/useSessionStore.ts`                   | Zustand store untuk event sesi (non-persisted)              |
| `frontend/src/hooks/useTokenHeartbeat.ts`                  | Hook untuk real-time token validation                       |
| `frontend/src/hooks/useSmartRefresh.ts`                    | Hook untuk smart data refresh saat tab aktif                |

### File yang Dimodifikasi

| File                                  | Perubahan                                                   |
| ------------------------------------- | ----------------------------------------------------------- |
| `frontend/src/App.tsx`                | Integrasi ForceChangePasswordNotice dan SessionExpiredModal |
| `frontend/src/services/api/client.ts` | Ganti `alert()` dengan session store untuk 401 handling     |
| `frontend/src/stores/useAuthStore.ts` | Improved partialize dengan dokumentasi keamanan             |

## Komponen Baru

### 1. ForceChangePasswordNotice (WAJIB)

```tsx
<ForceChangePasswordNotice
  isOpen={mustChangePassword}
  userName={currentUser.name}
  reason="admin_reset" | "default_password" | "policy"
  onChangePassword={() => navigateToSettingsPage()}
/>
```

**Fitur:**

- TIDAK BISA di-dismiss - user HARUS ganti password
- Tampilan modern dengan gradient header
- Tips password kuat
- Animasi entrance yang menarik perhatian

### 2. SessionExpiredModal

```tsx
<SessionExpiredModal
  isOpen={isSessionExpired}
  type="success" | "warning"
  title="Judul"
  message="Pesan"
  infoText="Info tambahan"
  buttonText="Label Button"
  onConfirm={() => logout()}
  autoRedirectSeconds={5}
/>
```

**Fitur:**

- Countdown timer otomatis
- Tipe berbeda untuk password reset (success/hijau) vs expired (warning/merah)
- Auto-redirect setelah countdown

### 3. SecurityBanner (opsional, dismissible)

```tsx
<SecurityBanner
  type="security" | "warning" | "info"
  title="Judul"
  message="Pesan notifikasi"
  actionLabel="Label Tombol"
  onAction={() => navigateToPage()}
  onDismiss={() => dismissBanner()}
/>
```

- Animasi masuk/keluar dengan Framer Motion
- Responsive design
- Dark mode support
- Tombol dismiss dan action

### 2. SessionExpiredModal

```tsx
<SessionExpiredModal
  isOpen={true}
  onClose={() => handleLogout()}
  message="Sesi Anda telah berakhir"
  autoRedirectSeconds={5}
/>
```

**Fitur:**

- Countdown timer dengan circular progress
- Auto-redirect setelah countdown selesai
- UI modern dengan ikon dan animasi
- Dark mode support

### 3. useSessionStore

```typescript
// State
isSessionExpired: boolean
sessionExpiredMessage: string | undefined

// Actions
setSessionExpired(message?: string)
clearSessionExpired()
```

**Karakteristik:**

- Tidak di-persist ke localStorage (reset saat refresh)
- Lightweight untuk event sesi saja

## Alur Kerja Baru

### Password Reset oleh Admin

1. Admin reset password user via panel admin
2. Backend:
   - Generate password baru/default
   - Set `mustChangePassword: true`
   - Increment `tokenVersion`
3. Token lama user menjadi invalid (401 Unauthorized)
4. Frontend menampilkan `SessionExpiredModal`
5. User diarahkan ke login page

### User Login dengan mustChangePassword

1. User login dengan password hasil reset
2. Backend return `mustChangePassword: true`
3. Frontend menyimpan flag di auth store
4. `SecurityBanner` muncul di atas layar
5. User klik "Ubah Password" → navigasi ke halaman Kelola Akun
6. User berhasil ganti password → logout & login ulang
7. `mustChangePassword: false` → banner tidak muncul

## Keamanan localStorage

Data yang disimpan di localStorage (auth-storage):

| Field                | Alasan                   |
| -------------------- | ------------------------ |
| `id`                 | Identifikasi user        |
| `name`               | Display name             |
| `email`              | Display & identification |
| `role`               | Authorization checks     |
| `divisionId`         | Access control           |
| `permissions`        | UI permission checks     |
| `mustChangePassword` | Security banner trigger  |
| `token`              | JWT untuk API requests   |

**TIDAK disimpan:**

- Password (plain atau hash)
- Data sensitif lainnya
- Session secrets

## Testing

1. **Reset Password oleh Admin:**
   - Login sebagai admin
   - Reset password user lain
   - Verifikasi user terlogout (jika sedang online)

2. **Login dengan Password Default:**
   - Login dengan user yang baru di-reset password
   - Verifikasi SecurityBanner muncul
   - Klik tombol action → navigasi ke pengaturan akun
   - Ganti password → verifikasi logout & banner hilang setelah login ulang

3. **Session Expired:**
   - Simulasi token expired
   - Verifikasi SessionExpiredModal muncul (bukan alert)
   - Verifikasi countdown dan auto-redirect bekerja

## Catatan Pengembangan

- Pendekatan token version lebih robust daripada flag client-side
- Banner dapat di-dismiss untuk sesi ini (state di component, bukan localStorage)
- Modal session expired tidak dapat di-dismiss (harus login ulang)
