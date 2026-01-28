# Dokumentasi: Alur Reset Password yang Aman

**Tanggal**: 27 Januari 2026  
**Modul**: User Management / Authentication  
**Versi**: 2.1.0

---

## 📋 Ringkasan

Implementasi fitur reset password yang aman dan profesional dengan alur sebagai berikut:

1. **User meminta reset** → Notifikasi dikirim ke **Super Admin saja**
2. **Super Admin meng-approve** → Generate password baru, kirim ke user
3. **User login dengan password reset** → **Modal force change password** muncul
4. **User wajib ganti password** → Baru bisa menggunakan aplikasi

---

## 🔐 Alur Keamanan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ALUR RESET PASSWORD YANG AMAN                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. USER meminta reset password:                                            │
│     └─> OPSI A: Dari halaman login (Lupa Kata Sandi)                        │
│     └─> OPSI B: Dari halaman Kelola Akun (Bantuan Akses) ⭐ BARU            │
│     └─> POST /api/v1/auth/request-password-reset { email }                  │
│                                                                             │
│  2. BACKEND:                                                                │
│     └─> Set user.passwordResetRequested = true                              │
│     └─> Kirim notifikasi ke SEMUA Super Admin                               │
│     └─> Notifikasi type: "PASSWORD_RESET_REQUEST"                           │
│                                                                             │
│  3. SUPER ADMIN melihat notifikasi di bell icon 🔔                          │
│     └─> Klik notifikasi → Navigasi ke User Detail Page                      │
│     └─> Lihat badge "Menunggu Reset Password"                               │
│                                                                             │
│  4. SUPER ADMIN klik "Reset Password"                                       │
│     └─> Konfirmasi modal muncul                                             │
│     └─> Generate password acak (12 karakter, crypto-secure)                 │
│     └─> PATCH /api/v1/users/:id/reset-password { password }                 │
│                                                                             │
│  5. BACKEND resetPassword():                                                │
│     └─> Hash password baru dengan bcrypt                                    │
│     └─> Set passwordResetRequested = false                                  │
│     └─> Set passwordResetRequestDate = null                                 │
│     └─> Set mustChangePassword = true  ⭐ KEY POINT                         │
│                                                                             │
│  6. SUPER ADMIN melihat password baru di modal                              │
│     └─> Copy password → Sampaikan ke user (manual/secure channel)           │
│                                                                             │
│  7. USER login dengan password dari Super Admin                             │
│     └─> POST /api/v1/auth/login                                             │
│     └─> Response includes mustChangePassword: true                          │
│                                                                             │
│  8. FRONTEND mendeteksi mustChangePassword === true                         │
│     └─> Tampilkan ForceChangePasswordModal (full screen, no escape)         │
│     └─> User WAJIB ganti password sebelum lanjut                            │
│                                                                             │
│  9. USER mengisi form ganti password:                                       │
│     └─> Password saat ini (dari admin)                                      │
│     └─> Password baru (dengan validasi kekuatan)                            │
│     └─> Konfirmasi password baru                                            │
│                                                                             │
│ 10. PATCH /api/v1/users/:id/change-password                                 │
│     └─> Verifikasi password lama                                            │
│     └─> Hash password baru                                                  │
│     └─> Set mustChangePassword = false                                      │
│                                                                             │
│ 11. USER dapat menggunakan aplikasi dengan normal ✅                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File yang Dimodifikasi/Dibuat

### Backend

| File                                       | Perubahan                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `src/modules/auth/auth.module.ts`          | Import `NotificationsModule`                                                          |
| `src/modules/auth/auth.service.ts`         | Inject `NotificationsService`, kirim notifikasi ke Super Admin                        |
| `src/modules/users/users.service.ts`       | Method `resetPassword()` set `mustChangePassword = true` secara otomatis              |
| `src/modules/users/users.controller.ts`    | Endpoint `PATCH /users/:id/reset-password` dengan guard `SUPER_ADMIN, ADMIN_LOGISTIK` |
| `src/modules/users/dto/update-user.dto.ts` | Tambah field `passwordResetRequested` dan `passwordResetRequestDate`                  |

### Frontend

| File                                                        | Perubahan                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `src/App.tsx`                                               | Import dan render `ForceChangePasswordModal`                    |
| `src/features/auth/components/ForceChangePasswordModal.tsx` | **BARU** - Modal untuk paksa ganti password                     |
| `src/components/icons/ShieldIcon.tsx`                       | **BARU** - Icon untuk modal keamanan                            |
| `src/components/ui/NotificationBell.tsx`                    | Handle notifikasi `PASSWORD_RESET_REQUEST`                      |
| `src/features/users/UserDetailPage.tsx`                     | Gunakan `usersApi.resetPassword(id, password)`                  |
| `src/features/users/ManageAccountPage.tsx`                  | **BARU** - Section "Bantuan Akses" untuk request reset password |
| `src/services/api/master-data.api.ts`                       | Method `resetPassword` diubah: `PATCH` + kirim password         |
| `src/services/api/auth.api.ts`                              | Interface `BackendLoginResponse` tambah `mustChangePassword`    |
| `src/utils/enumMapper.ts`                                   | `transformBackendUser` include `mustChangePassword`             |

---

## 🔧 Detail Implementasi

### 1. Notifikasi Password Reset ke Super Admin

```typescript
// backend/src/modules/auth/auth.service.ts
async requestPasswordReset(email: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) {
    return { message: 'Jika email terdaftar, admin akan menghubungi Anda' };
  }

  await this.usersService.markPasswordResetRequested(user.id);

  // Kirim notifikasi ke semua Super Admin
  const superAdmins = await this.usersService.findAll({
    role: UserRole.SUPER_ADMIN,
  });

  if (superAdmins.data && superAdmins.data.length > 0) {
    const superAdminIds = superAdmins.data.map(admin => admin.id);

    await this.notificationsService.createBulk(superAdminIds, {
      type: 'PASSWORD_RESET_REQUEST',
      message: `${user.name} meminta reset password`,
      actorName: user.name,
      referenceId: String(user.id), // User ID untuk navigasi
    });
  }

  return { message: 'Permintaan reset password telah dikirim ke admin' };
}
```

### 2. Auto-set mustChangePassword saat Admin Reset

```typescript
// backend/src/modules/users/users.service.ts
async update(id: number, updateUserDto: UpdateUserDto) {
  const existingUser = await this.findOne(id);

  // Deteksi operasi reset password oleh admin
  const isAdminPasswordReset =
    sanitized.password &&
    updateUserDto.passwordResetRequested === false &&
    existingUser.passwordResetRequested === true;

  const updateData: Prisma.UserUncheckedUpdateInput = {
    ...sanitized,
    // Jika admin reset password, paksa user ganti saat login
    ...(isAdminPasswordReset && {
      mustChangePassword: true,
    }),
  };

  return this.prisma.user.update({ where: { id }, data: updateData });
}
```

### 3. ForceChangePasswordModal Component

```tsx
// frontend/src/features/auth/components/ForceChangePasswordModal.tsx
export const ForceChangePasswordModal: React.FC<Props> = ({
  user,
  onSuccess,
}) => {
  // Form state, validasi, dll...

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <ShieldIcon />
          <h2>Keamanan Akun</h2>
          <p>Password telah di-reset. Silakan buat password baru.</p>
        </div>

        {/* Form dengan:
            - Verifikasi password saat ini (dari admin)
            - Password baru dengan strength meter
            - Konfirmasi password
            - Tombol Keluar atau Simpan
        */}
      </div>
    </div>
  );
};
```

### 4. App.tsx - Deteksi mustChangePassword

```tsx
// frontend/src/App.tsx
const App: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [showForceChangePassword, setShowForceChangePassword] = useState(false);

  useEffect(() => {
    if (currentUser?.mustChangePassword) {
      setShowForceChangePassword(true);
    }
  }, [currentUser?.mustChangePassword]);

  if (showForceChangePassword && currentUser.mustChangePassword) {
    return (
      <ForceChangePasswordModal
        user={currentUser}
        onSuccess={() => setShowForceChangePassword(false)}
      />
    );
  }

  return <AppContent />;
};
```

---

## 🔔 Notifikasi Bell - Handle PASSWORD_RESET_REQUEST

```tsx
// frontend/src/components/ui/NotificationBell.tsx

// Handle click - navigasi ke user detail
if (notification.type === "PASSWORD_RESET_REQUEST") {
  if (notification.referenceId && currentUser.role === "Super Admin") {
    setActivePage("user-detail", { userId: parseInt(notification.referenceId) });
  }
  return;
}

// Display message
case "PASSWORD_RESET_REQUEST":
  message = `meminta reset password. Klik untuk melihat detail.`;
  Icon = LockIcon;
  break;
```

---

## 🔒 Keamanan

### Password Generation (Frontend)

```typescript
// Menggunakan crypto.getRandomValues untuk keamanan
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

### Validasi Password Baru

- Minimal 8 karakter
- Huruf besar dan kecil
- Minimal satu angka
- Simbol (!@#$%^&\*)
- Tanpa spasi
- Tidak boleh sama dengan password saat ini

### Rate Limiting

- Endpoint `/auth/request-password-reset`: 3 request per menit
- Mencegah brute force dan enumeration attack

---

## 🧪 Testing Checklist

- [ ] User dapat request reset password dari login page
- [ ] Super Admin menerima notifikasi di bell
- [ ] Klik notifikasi navigasi ke user detail
- [ ] Admin dapat reset password dan melihat password baru
- [ ] User login dengan password reset → modal muncul
- [ ] User tidak bisa akses aplikasi tanpa ganti password
- [ ] Setelah ganti password, modal hilang dan user bisa lanjut
- [ ] Non-Super Admin tidak melihat notifikasi reset request

---

## 📚 Referensi

- [DEFAULT_PASSWORD_IMPLEMENTATION.md](DEFAULT_PASSWORD_IMPLEMENTATION.md) - Password standar untuk akun baru
- [MANAGE_ACCOUNT_REFACTOR.md](MANAGE_ACCOUNT_REFACTOR.md) - Refactor halaman kelola akun
- [RESET_PASSWORD_ANALYSIS.md](RESET_PASSWORD_ANALYSIS.md) - Analisa awal fitur reset password

---

_Dokumentasi ini dibuat pada 27 Januari 2026_
