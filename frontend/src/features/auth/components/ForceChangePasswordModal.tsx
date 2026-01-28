import React, { useState, useMemo, useEffect } from "react";
import { User } from "../../../types";
import { usersApi } from "../../../services/api/master-data.api";
import { useAuthStore, FORCE_CHANGE_PASSWORD_KEY } from "../../../stores/useAuthStore";
import { SpinnerIcon } from "../../../components/icons/SpinnerIcon";
import { LockIcon } from "../../../components/icons/LockIcon";
import { EyeIcon } from "../../../components/icons/EyeIcon";
import { EyeSlashIcon } from "../../../components/icons/EyeSlashIcon";
import { CheckIcon } from "../../../components/icons/CheckIcon";
import { CloseIcon } from "../../../components/icons/CloseIcon";
import { ShieldIcon } from "../../../components/icons/ShieldIcon";

interface ForceChangePasswordModalProps {
  user: User;
  onSuccess: () => void;
  onLogout?: () => void; // Optional logout handler from parent
}

/**
 * Modal Force Change Password
 * Ditampilkan ketika user login dengan mustChangePassword = true
 * User WAJIB mengganti password sebelum bisa menggunakan aplikasi
 */
export const ForceChangePasswordModal: React.FC<ForceChangePasswordModalProps> = ({
  user,
  onSuccess,
  onLogout,
}) => {
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);
  const logoutStore = useAuthStore((state) => state.logout);

  // Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verifikasi password saat ini
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean | null>(null);

  // Password strength calculation
  const allowedSymbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const { allowedSymbolsRegex, symbolCheckRegex } = useMemo(() => {
    const escaped = allowedSymbols.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&");
    return {
      allowedSymbolsRegex: new RegExp(`^[a-zA-Z0-9${escaped}]+$`),
      symbolCheckRegex: new RegExp(`[${escaped}]`),
    };
  }, []);

  const passwordChecks = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      upperLower: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      symbol: symbolCheckRegex.test(newPassword),
      noSpaces: !/\s/.test(newPassword),
      onlyAllowed: newPassword === "" || allowedSymbolsRegex.test(newPassword),
    };
  }, [newPassword, allowedSymbolsRegex, symbolCheckRegex]);

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "", color: "" };
    let score = 0;
    if (passwordChecks.length) score++;
    if (passwordChecks.upperLower) score++;
    if (passwordChecks.number) score++;
    if (passwordChecks.symbol) score++;

    if (!passwordChecks.noSpaces || !passwordChecks.onlyAllowed) {
      return { score: 1, label: "Tidak Valid", color: "bg-red-500" };
    }

    const labels = ["", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];
    const colors = ["", "bg-red-500", "bg-orange-500", "bg-blue-500", "bg-green-500"];
    return { score, label: labels[score] || "Lemah", color: colors[score] || "bg-red-500" };
  }, [newPassword, passwordChecks]);

  const isPasswordMismatch = confirmPassword && newPassword !== confirmPassword;
  const isNewSameAsCurrent = currentPassword && newPassword && currentPassword === newPassword;

  const canSubmit =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    !isPasswordMismatch &&
    !isNewSameAsCurrent &&
    currentPasswordValid === true &&
    passwordChecks.length &&
    passwordChecks.upperLower &&
    passwordChecks.number &&
    passwordChecks.noSpaces &&
    passwordChecks.onlyAllowed;

  // Verifikasi password saat ini dengan debounce
  useEffect(() => {
    if (!currentPassword || currentPassword.length < 3) {
      setCurrentPasswordValid(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifying(true);
      try {
        const result = await usersApi.verifyPassword(user.id, currentPassword);
        setCurrentPasswordValid(result.valid);
      } catch {
        setCurrentPasswordValid(false);
      } finally {
        setIsVerifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [currentPassword, user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    try {
      await usersApi.changePassword(user.id, {
        currentPassword,
        newPassword,
      });

      // Update user state - remove mustChangePassword flag
      updateCurrentUser({
        ...user,
        mustChangePassword: false,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal mengubah password. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Hapus flag localStorage terlebih dahulu
    localStorage.removeItem(FORCE_CHANGE_PASSWORD_KEY);
    // Gunakan handler dari parent jika ada, atau fallback ke store
    if (onLogout) {
      onLogout();
    } else {
      logoutStore();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShieldIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Keamanan Akun</h2>
          </div>
          <p className="text-primary-100 text-sm">
            Password Anda telah di-reset oleh administrator. Demi keamanan, silakan buat password
            baru sebelum melanjutkan.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
            <LockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Perhatian</p>
              <p className="mt-1">
                Anda tidak dapat menggunakan aplikasi sebelum mengganti password. Password sementara
                diberikan oleh admin.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
              <CloseIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Saat Ini (dari Admin)
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-20 border rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  currentPasswordValid === false
                    ? "border-red-500"
                    : currentPasswordValid === true
                      ? "border-green-500"
                      : "border-gray-300 dark:border-slate-600"
                }`}
                placeholder="Masukkan password dari admin"
                disabled={isLoading}
              />
              {/* Status indicator */}
              <div className="absolute inset-y-0 right-10 flex items-center pr-3">
                {isVerifying && <SpinnerIcon className="w-4 h-4 text-gray-400 animate-spin" />}
                {!isVerifying && currentPasswordValid === true && (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                )}
                {!isVerifying && currentPasswordValid === false && (
                  <CloseIcon className="w-4 h-4 text-red-500" />
                )}
              </div>
              {/* Toggle visibility */}
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {currentPasswordValid === false && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Password tidak sesuai. Pastikan Anda memasukkan password dari admin.
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  isNewSameAsCurrent ? "border-red-500" : "border-gray-300 dark:border-slate-600"
                }`}
                placeholder="Buat password baru yang kuat"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Strength */}
            {newPassword && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Kekuatan Password</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score >= 3
                        ? "text-green-600 dark:text-green-400"
                        : passwordStrength.score === 2
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {newPassword && (
              <ul className="mt-3 space-y-1 text-xs">
                <RequirementItem met={passwordChecks.length} text="Minimal 8 karakter" />
                <RequirementItem met={passwordChecks.upperLower} text="Huruf besar dan kecil" />
                <RequirementItem met={passwordChecks.number} text="Minimal satu angka" />
                <RequirementItem met={passwordChecks.symbol} text="Simbol (!@#$%^&*)" />
                <RequirementItem met={passwordChecks.noSpaces} text="Tanpa spasi" />
              </ul>
            )}

            {isNewSameAsCurrent && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Password baru tidak boleh sama dengan password saat ini.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  isPasswordMismatch
                    ? "border-red-500"
                    : confirmPassword && !isPasswordMismatch
                      ? "border-green-500"
                      : "border-gray-300 dark:border-slate-600"
                }`}
                placeholder="Ulangi password baru"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {isPasswordMismatch && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Password tidak cocok.</p>
            )}
            {confirmPassword && !isPasswordMismatch && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckIcon className="w-4 h-4" /> Password cocok
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Keluar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <LockIcon className="w-5 h-5" />
                  Simpan Password Baru
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Requirement item component
 */
const RequirementItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <li
    className={`flex items-center gap-2 ${met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
  >
    {met ? (
      <CheckIcon className="w-3.5 h-3.5" />
    ) : (
      <span className="w-3.5 h-3.5 rounded-full border border-current" />
    )}
    {text}
  </li>
);

export default ForceChangePasswordModal;
