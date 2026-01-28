/**
 * AccountSecurityTab - Tab Keamanan untuk halaman Kelola Akun Saya
 * Menampilkan form untuk mengubah password dan request reset
 */

import React, { useState } from "react";
import { User } from "../../../types";
import { SpinnerIcon } from "../../../components/icons/SpinnerIcon";
import { LockIcon } from "../../../components/icons/LockIcon";
import { EyeIcon } from "../../../components/icons/EyeIcon";
import { EyeSlashIcon } from "../../../components/icons/EyeSlashIcon";
import { CheckIcon } from "../../../components/icons/CheckIcon";
import { CloseIcon } from "../../../components/icons/CloseIcon";
import { KeyIcon } from "../../../components/icons/KeyIcon";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { PasswordAlert } from "./PasswordAlert";
import { BsShieldLockFill, BsExclamationTriangleFill } from "react-icons/bs";
import Modal from "../../../components/ui/Modal";
import { authApi } from "../../../services/api/auth.api";
import { useNotification } from "../../../providers/NotificationProvider";

interface AccountSecurityTabProps {
  currentUser: User;
  // Password Change Logic
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  passwordVisibility: { current: boolean; new: boolean; confirm: boolean };
  setPasswordVisibility: React.Dispatch<
    React.SetStateAction<{ current: boolean; new: boolean; confirm: boolean }>
  >;
  passwordValidation: {
    currentPasswordValid: boolean | null;
    currentPasswordVerifying: boolean;
    currentPasswordError: string;
    confirmPasswordMatch: boolean | null;
    newPasswordSameAsCurrent: boolean;
  };
  passwordChecks: {
    length: boolean;
    upperLower: boolean;
    number: boolean;
    symbol: boolean;
    noSpaces: boolean;
    onlyAllowed: boolean;
  };
  passwordStrength: { score: number; label: string; color: string };
  passwordError: string;
  allowedSymbols: string;
  isLoading: boolean;
  isRedirecting: boolean;
  canSubmit: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

// Subcomponents
const PasswordStatusIndicator: React.FC<{
  isVerifying: boolean;
  isValid: boolean | null;
}> = ({ isVerifying, isValid }) => {
  if (isVerifying) {
    return (
      <div className="absolute inset-y-0 right-10 flex items-center pr-3">
        <SpinnerIcon className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }
  if (isValid === true) {
    return (
      <div className="absolute inset-y-0 right-10 flex items-center pr-3">
        <CheckIcon className="w-4 h-4 text-green-500" />
      </div>
    );
  }
  if (isValid === false) {
    return (
      <div className="absolute inset-y-0 right-10 flex items-center pr-3">
        <CloseIcon className="w-4 h-4 text-red-500" />
      </div>
    );
  }
  return null;
};

const CheckListItem: React.FC<{ met: boolean; text: React.ReactNode }> = ({ met, text }) => (
  <li
    className={`flex items-start gap-2 transition-colors duration-200 ${
      met ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-300"
    }`}
  >
    {met ? (
      <CheckIcon className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
    ) : (
      <CloseIcon className="w-4 h-4 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
    )}
    <span>{text}</span>
  </li>
);

const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 mt-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900/80 border border-gray-200 dark:border-gray-600 shadow-sm">
    {children}
  </div>
);

export const AccountSecurityTab: React.FC<AccountSecurityTabProps> = ({
  currentUser,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordVisibility,
  setPasswordVisibility,
  passwordValidation,
  passwordChecks,
  passwordStrength,
  passwordError,
  allowedSymbols,
  isLoading,
  isRedirecting,
  canSubmit,
  handleSubmit,
  onBack,
}) => {
  const addNotification = useNotification();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [resetRequestSent, setResetRequestSent] = useState(
    currentUser.passwordResetRequested || false
  );

  const handleRequestReset = async () => {
    setIsRequestingReset(true);
    try {
      await authApi.requestPasswordReset(currentUser.email);
      setResetRequestSent(true);
      setIsResetModalOpen(false);
      addNotification(
        "Permintaan reset password telah dikirim ke Super Admin. Anda akan dihubungi segera.",
        "success"
      );
    } catch (error: any) {
      addNotification(error.message || "Gagal mengirim permintaan reset password.", "error");
    } finally {
      setIsRequestingReset(false);
    }
  };

  // Border classes
  const currentPasswordBorderClass = (() => {
    if (passwordValidation.currentPasswordVerifying) return "border-gray-300";
    if (passwordValidation.currentPasswordValid === true)
      return "border-green-500 focus:ring-green-500 focus:border-green-500";
    if (passwordValidation.currentPasswordValid === false)
      return "border-red-500 focus:ring-red-500 focus:border-red-500";
    return "border-gray-300";
  })();

  const newPasswordBorderClass = (() => {
    if (passwordValidation.newPasswordSameAsCurrent && newPassword)
      return "border-red-500 focus:ring-red-500 focus:border-red-500";
    return "border-gray-300 focus:ring-primary-500 focus:border-primary-500";
  })();

  const confirmPasswordBorderClass = (() => {
    if (!confirmPassword) return "border-gray-300";
    if (passwordValidation.confirmPasswordMatch === true)
      return "border-green-500 focus:ring-green-500 focus:border-green-500";
    if (passwordValidation.confirmPasswordMatch === false)
      return "border-red-500 focus:ring-red-500 focus:border-red-500";
    return "border-gray-300";
  })();

  const inputBaseClass =
    "block w-full px-4 py-2.5 text-sm rounded-xl shadow-sm transition-all duration-200 disabled:opacity-60 bg-white text-gray-900 placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Change Password Section */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BsShieldLockFill className="text-primary-600 dark:text-primary-400" />
              Ubah Kata Sandi
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Kosongkan jika tidak ingin mengubah kata sandi
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.current ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading || isRedirecting}
                  className={`${inputBaseClass} pr-20 border ${currentPasswordBorderClass}`}
                  placeholder="Masukkan kata sandi saat ini"
                  autoComplete="current-password"
                />
                <PasswordStatusIndicator
                  isVerifying={passwordValidation.currentPasswordVerifying}
                  isValid={passwordValidation.currentPasswordValid}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisibility((p) => ({ ...p, current: !p.current }))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-primary-600 transition-colors"
                  disabled={isLoading || isRedirecting}
                  tabIndex={-1}
                >
                  {passwordVisibility.current ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <PasswordAlert
                  type="warning"
                  message={passwordValidation.currentPasswordError}
                  show={
                    passwordValidation.currentPasswordValid === false &&
                    !!passwordValidation.currentPasswordError
                  }
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className={labelClass}>
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.new ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading || isRedirecting}
                  className={`${inputBaseClass} pr-10 border ${newPasswordBorderClass}`}
                  placeholder="Masukkan kata sandi baru"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisibility((p) => ({ ...p, new: !p.new }))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-primary-600 transition-colors"
                  disabled={isLoading || isRedirecting}
                  tabIndex={-1}
                >
                  {passwordVisibility.new ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="mt-2">
                <PasswordAlert
                  type="error"
                  message="Kata sandi baru tidak boleh sama dengan kata sandi saat ini."
                  show={passwordValidation.newPasswordSameAsCurrent && !!newPassword}
                />
              </div>

              {newPassword && !passwordValidation.newPasswordSameAsCurrent && (
                <PasswordStrengthMeter passwordStrength={passwordStrength} />
              )}

              {newPassword && !passwordValidation.newPasswordSameAsCurrent && (
                <InfoBox>
                  <p className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">
                    Kata sandi harus memenuhi kriteria berikut:
                  </p>
                  <ul className="space-y-2 text-xs">
                    <CheckListItem met={passwordChecks.length} text="Minimal 8 karakter" />
                    <CheckListItem
                      met={passwordChecks.upperLower}
                      text="Kombinasi huruf besar dan kecil"
                    />
                    <CheckListItem
                      met={passwordChecks.number}
                      text="Sertakan setidaknya satu angka"
                    />
                    <CheckListItem
                      met={passwordChecks.symbol}
                      text={
                        <span>
                          Sertakan setidaknya satu simbol{" "}
                          <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded text-xs font-mono">
                            !@#$%^&*
                          </code>
                        </span>
                      }
                    />
                    <CheckListItem
                      met={passwordChecks.noSpaces}
                      text="Tidak boleh mengandung spasi"
                    />
                    <CheckListItem
                      met={passwordChecks.onlyAllowed}
                      text={
                        <span>
                          Hanya simbol yang diizinkan:{" "}
                          <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded text-xs font-mono break-all">
                            {allowedSymbols}
                          </code>
                        </span>
                      }
                    />
                  </ul>
                </InfoBox>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.confirm ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || isRedirecting}
                  className={`${inputBaseClass} pr-20 border ${confirmPasswordBorderClass}`}
                  placeholder="Ulangi kata sandi baru"
                  autoComplete="new-password"
                />
                {confirmPassword && (
                  <div className="absolute inset-y-0 right-10 flex items-center pr-3">
                    {passwordValidation.confirmPasswordMatch === true ? (
                      <CheckIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <CloseIcon className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setPasswordVisibility((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-primary-600 transition-colors"
                  disabled={isLoading || isRedirecting}
                  tabIndex={-1}
                >
                  {passwordVisibility.confirm ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <PasswordAlert
                  type="error"
                  message="Konfirmasi kata sandi tidak cocok dengan kata sandi baru."
                  show={passwordValidation.confirmPasswordMatch === false}
                />
              </div>
            </div>

            {passwordError && (
              <div className="mt-2">
                <PasswordAlert type="error" message={passwordError} show={true} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading || isRedirecting}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-60 transition-all duration-200"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-xl shadow-sm ${
                canSubmit
                  ? "bg-primary-600 hover:bg-primary-700"
                  : "bg-gray-400 dark:bg-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : isRedirecting ? (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Berhasil, Mengalihkan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </div>

        {/* Request Reset Section */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <KeyIcon className="w-5 h-5" />
              Bantuan Akses
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Lupa kata sandi? Minta bantuan Super Admin
            </p>
          </div>

          <div className="p-6">
            {resetRequestSent ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                    <SpinnerIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                      Permintaan Sedang Diproses
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Permintaan reset password Anda telah dikirim ke Super Admin.
                    </p>
                    {currentUser.passwordResetRequestDate && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        Diminta pada:{" "}
                        {new Date(currentUser.passwordResetRequestDate).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Reset Kata Sandi via Admin
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Admin akan membuat kata sandi sementara untuk Anda
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl shadow-sm hover:bg-amber-700 transition-all duration-200"
                >
                  <KeyIcon className="w-4 h-4" />
                  Minta Reset
                </button>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Catatan:</span> Setelah admin mereset kata sandi,
                Anda akan menerima kata sandi sementara dan{" "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  wajib menggantinya
                </span>{" "}
                saat login pertama kali.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Reset Request Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Minta Reset Kata Sandi?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Perhatian:</span> Permintaan Anda akan dikirim ke
              Super Admin untuk ditinjau.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Proses reset:</p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>Permintaan dikirim ke Super Admin</li>
              <li>Super Admin mereset kata sandi Anda</li>
              <li>Login dengan kata sandi sementara</li>
              <li>
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  Wajib ganti kata sandi
                </span>
              </li>
            </ol>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              disabled={isRequestingReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleRequestReset}
              disabled={isRequestingReset}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-70"
            >
              {isRequestingReset ? (
                <>
                  <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Ya, Kirim Permintaan"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccountSecurityTab;
