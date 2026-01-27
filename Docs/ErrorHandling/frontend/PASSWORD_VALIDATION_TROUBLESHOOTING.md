# Troubleshooting: Validasi Password Real-time

**Tanggal**: 27 Januari 2026  
**Modul**: Frontend - User Management  
**Status**: ✅ Resolved

---

## 📋 Deskripsi Masalah

### Gejala

Pada halaman "Kelola Akun Saya", ketika pengguna mengetik password saat ini untuk verifikasi:

1. Spinner loading muncul dan **terus berputar tanpa henti**
2. Tidak ada feedback apakah password valid atau tidak
3. Backend log menunjukkan request berhasil dengan response `201 Created`
4. Tombol "Simpan Perubahan" tetap disabled

### Impact

- User tidak dapat mengubah password
- User experience sangat buruk
- Fitur keamanan tidak berfungsi

---

## 🔍 Investigasi

### Step 1: Verifikasi Backend

```bash
# Log backend menunjukkan:
POST /api/users/1/verify-password - 201 Created
# Response: { "valid": true }
```

**Kesimpulan**: Backend berfungsi dengan benar.

### Step 2: Analisis Frontend Code

**File**: `frontend/src/features/users/hooks/useManageAccountLogic.ts`

Implementasi sebelumnya menggunakan pattern:

```typescript
// PROBLEMATIC CODE
const executePasswordVerification = useCallback(
  async (password: string) => {
    // API call
  },
  [currentUser.id],
);

const handleCurrentPasswordChange = useCallback(
  (password: string) => {
    setCurrentPassword(password);
    const timer = setTimeout(() => {
      executePasswordVerification(password);
    }, 800);
    return () => clearTimeout(timer);
  },
  [executePasswordVerification],
);
```

### Step 3: Identifikasi Root Cause

**Root Cause: Closure Stale**

1. `useCallback` dengan dependency `executePasswordVerification` tidak memicu re-render saat dependency berubah
2. `setTimeout` di dalam `useCallback` menyimpan referensi lama ke function
3. Saat timer selesai, function yang dipanggil adalah versi lama yang mungkin sudah tidak valid
4. State update tidak terjadi karena referensi state sudah stale

**Visual Explanation**:

```
Time: 0ms   - User types password
Time: 0ms   - handleCurrentPasswordChange called
Time: 0ms   - setTimeout started with OLD reference to executePasswordVerification
Time: 800ms - Timer fires, calls OLD executePasswordVerification
Time: 800ms - OLD function tries to update state, but closure is stale
Result:     - State never updates, spinner keeps spinning
```

---

## ✅ Solusi

### Pendekatan Baru: useEffect + Debounce

Mengganti `useCallback` dengan `useEffect` yang secara native memiliki cleanup function:

```typescript
// FIXED CODE
useEffect(() => {
  // Guard clause
  if (!currentPassword || currentPassword.length < 3) {
    setPasswordValidation((prev) => ({
      ...prev,
      currentPasswordValid: null,
      currentPasswordVerifying: false,
    }));
    return;
  }

  // Set loading state
  setPasswordValidation((prev) => ({
    ...prev,
    currentPasswordVerifying: true,
  }));

  // Debounce dengan setTimeout
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

  // Cleanup function - dipanggil setiap kali dependency berubah
  return () => clearTimeout(timer);
}, [currentPassword, currentUser.id]);
```

### Mengapa Ini Bekerja?

1. **React menjamin eksekusi**: `useEffect` selalu dijalankan saat dependency berubah
2. **Cleanup otomatis**: Return function membatalkan timer sebelumnya
3. **Fresh closure**: Setiap eksekusi effect mendapat closure baru dengan nilai terbaru
4. **No stale references**: `currentPassword` dan `currentUser.id` selalu fresh

---

## 🎯 Key Learnings

### Do's ✅

1. Gunakan `useEffect` untuk side effects yang bergantung pada state changes
2. Selalu sertakan cleanup function untuk async operations
3. Debounce dengan `setTimeout` di dalam `useEffect` lebih reliable
4. Test dengan berbagai kondisi input (fast typing, slow typing, etc.)

### Don'ts ❌

1. Jangan gunakan `useCallback` untuk complex async flows dengan debounce
2. Jangan mengandalkan refs untuk menyimpan timer ID dalam pattern kompleks
3. Jangan abaikan cleanup saat component unmount
4. Jangan cache API results tanpa invalidation strategy yang jelas

---

## 🧪 Testing Verification

### Test Cases

| Test Case             | Expected                         | Actual                           | Status |
| --------------------- | -------------------------------- | -------------------------------- | ------ |
| Type valid password   | Spinner → Check icon             | Spinner → Check icon             | ✅     |
| Type invalid password | Spinner → Warning                | Spinner → Warning                | ✅     |
| Fast typing (< 600ms) | Only last keystroke triggers API | Only last keystroke triggers API | ✅     |
| Clear password field  | Reset to neutral state           | Reset to neutral state           | ✅     |
| Network error         | Show error state                 | Show error state                 | ✅     |

---

## 📁 Files Modified

1. `frontend/src/features/users/hooks/useManageAccountLogic.ts` - Complete rewrite
2. `frontend/src/features/users/ManageAccountPage.tsx` - UI updates
3. `frontend/src/features/users/components/PasswordAlert.tsx` - New component
4. `frontend/src/features/users/components/PasswordStrengthMeter.tsx` - New component
5. `frontend/src/features/users/components/ReloginSuccessModal.tsx` - New component

---

## 📚 References

- [React useEffect Documentation](https://react.dev/reference/react/useEffect)
- [React Hooks FAQ - Stale Closures](https://legacy.reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function)
- [Debouncing in React](https://usehooks-ts.com/react-hook/use-debounce)

---

_Dokumentasi ini dibuat pada 27 Januari 2026 sebagai bagian dari troubleshooting session._
