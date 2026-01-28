import React, { useState } from "react";
import { User } from "../../types";
import FormPageLayout from "../../components/layout/FormPageLayout";
import { SpinnerIcon } from "../../components/icons/SpinnerIcon";
import { UserIcon } from "../../components/icons/UserIcon";
import { LockIcon } from "../../components/icons/LockIcon";
import { EyeIcon } from "../../components/icons/EyeIcon";
import { EyeSlashIcon } from "../../components/icons/EyeSlashIcon";
import { CheckIcon } from "../../components/icons/CheckIcon";
import { CloseIcon } from "../../components/icons/CloseIcon";
import { KeyIcon } from "../../components/icons/KeyIcon";
import { useManageAccountLogic } from "./hooks/useManageAccountLogic";
import { PasswordStrengthMeter } from "./components/PasswordStrengthMeter";
import { PasswordAlert } from "./components/PasswordAlert";
import { ReloginSuccessModal } from "./components/ReloginSuccessModal";
import { authApi } from "../../services/api/auth.api";
import { useNotification } from "../../providers/NotificationProvider";
import Modal from "../../components/ui/Modal";

interface ManageAccountPageProps {
  currentUser: User;
  onBack: () => void;
}

/**
 * Form Section dengan dukungan dark mode
 */
const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="pt-6 border-t border-gray-200 dark:border-gray-600 first:pt-0 first:border-t-0">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

/**
 * CheckList Item untuk kriteria password
 */
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

/**
 * Password field status indicator - warna tetap karena input background putih
 */
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

/**
 * Info Box dengan styling modern dan dark mode
 */
const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 mt-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900/80 border border-gray-200 dark:border-gray-600 shadow-sm">
    {children}
  </div>
);

const ManageAccountPage: React.FC<ManageAccountPageProps> = ({ currentUser, onBack }) => {
  const addNotification = useNotification();

  // State untuk Request Reset Password
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [resetRequestSent, setResetRequestSent] = useState(
    currentUser.passwordResetRequested || false
  );

  const {
    name,
    setName,
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordVisibility,
    setPasswordVisibility,
    isLoading,
    isRedirecting,
    showReloginModal,

    // Errors
    nameError,
    emailError,
    passwordError,

    // Password validation
    passwordValidation,
    passwordChecks,
    passwordStrength,
    allowedSymbols,

    // Computed
    canSubmit,

    // Actions
    handleSubmit,
    handleRelogin,
  } = useManageAccountLogic({ currentUser });

  // Handle request reset password
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

  // Determine border color for current password field
  const currentPasswordBorderClass = (() => {
    if (passwordValidation.currentPasswordVerifying) return "border-gray-300";
    if (passwordValidation.currentPasswordValid === true)
      return "border-green-500 focus:ring-green-500 focus:border-green-500";
    if (passwordValidation.currentPasswordValid === false)
      return "border-red-500 focus:ring-red-500 focus:border-red-500";
    return "border-gray-300";
  })();

  // Determine border color for new password field
  const newPasswordBorderClass = (() => {
    if (passwordValidation.newPasswordSameAsCurrent && newPassword)
      return "border-red-500 focus:ring-red-500 focus:border-red-500";
    return "border-gray-300 focus:ring-primary-500 focus:border-primary-500";
  })();

  // Determine border color for confirm password field
  const confirmPasswordBorderClass = (() => {
    if (!confirmPassword) return "border-gray-300";
    if (passwordValidation.confirmPasswordMatch === true)
      return "border-green-500 focus:ring-green-500 focus:border-green-500";
    if (passwordValidation.confirmPasswordMatch === false)
      return "border-red-500 focus:ring-red-500 focus:border-red-500";
    return "border-gray-300";
  })();

  // Common input classes dengan dark mode - input tetap terang
  const inputBaseClass =
    "block w-full px-4 py-2.5 text-sm rounded-xl shadow-sm transition-all duration-200 disabled:opacity-60 bg-white text-gray-900 placeholder-gray-400";

  // Common label classes - tetap kontras
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <>
      <FormPageLayout title="Kelola Akun Saya">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          {/* === PROFIL SECTION === */}
          <FormSection
            title="Profil"
            icon={<UserIcon className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />}
          >
            <div>
              <label htmlFor="name" className={labelClass}>
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading || isRedirecting}
                className={`${inputBaseClass} border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Masukkan nama lengkap"
              />
              {nameError && (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {nameError}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Alamat Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isRedirecting}
                className={`${inputBaseClass} border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="contoh@email.com"
              />
              {emailError && (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>
          </FormSection>

          {/* === UBAH KATA SANDI SECTION === */}
          <FormSection
            title="Ubah Kata Sandi"
            icon={<LockIcon className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
              Kosongkan jika Anda tidak ingin mengubah kata sandi.
            </p>

            {/* Input Password Saat Ini */}
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
                  onClick={() =>
                    setPasswordVisibility((p) => ({
                      ...p,
                      current: !p.current,
                    }))
                  }
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

              {/* Alert: Password saat ini tidak valid */}
              <div className="mt-3">
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

            {/* Input Password Baru */}
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

              {/* Alert: Password baru sama dengan saat ini */}
              <div className="mt-3">
                <PasswordAlert
                  type="error"
                  message="Kata sandi baru tidak boleh sama dengan kata sandi saat ini."
                  show={passwordValidation.newPasswordSameAsCurrent && !!newPassword}
                />
              </div>

              {/* Password Strength Meter */}
              {newPassword && !passwordValidation.newPasswordSameAsCurrent && (
                <PasswordStrengthMeter passwordStrength={passwordStrength} />
              )}

              {/* Password Criteria Checklist */}
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

            {/* Input Konfirmasi Password */}
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
                {/* Confirm password match indicator */}
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
                  onClick={() =>
                    setPasswordVisibility((p) => ({
                      ...p,
                      confirm: !p.confirm,
                    }))
                  }
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

              {/* Alert: Konfirmasi password tidak cocok */}
              <div className="mt-3">
                <PasswordAlert
                  type="error"
                  message="Konfirmasi kata sandi tidak cocok dengan kata sandi baru."
                  show={passwordValidation.confirmPasswordMatch === false}
                />
              </div>
            </div>

            {/* General password error */}
            {passwordError && (
              <div className="mt-2">
                <PasswordAlert type="error" message={passwordError} show={true} />
              </div>
            )}
          </FormSection>

          {/* === BANTUAN AKSES SECTION === */}
          <FormSection
            title="Bantuan Akses"
            icon={<KeyIcon className="w-6 h-6 mr-3 text-amber-600 dark:text-amber-400" />}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lupa kata sandi lama Anda? Minta bantuan Super Admin untuk mereset kata sandi akun
                Anda.
              </p>

              {/* Status Request */}
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
                        Permintaan reset password Anda telah dikirim ke Super Admin. Mohon tunggu
                        konfirmasi dari administrator.
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        {currentUser.passwordResetRequestDate
                          ? `Diminta pada: ${new Date(currentUser.passwordResetRequestDate).toLocaleString("id-ID")}`
                          : "Menunggu proses..."}
                      </p>
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

              <InfoBox>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Catatan:</span> Setelah admin mereset kata sandi
                  Anda, Anda akan menerima kata sandi sementara dan{" "}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    wajib menggantinya
                  </span>{" "}
                  saat login pertama kali.
                </p>
              </InfoBox>
            </div>
          </FormSection>

          {/* === ACTION BUTTONS === */}
          <div className="flex justify-end pt-6 space-x-3 border-t border-gray-200 dark:border-gray-600">
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
        </form>
      </FormPageLayout>

      {/* Modal Relogin Sukses */}
      <ReloginSuccessModal
        isOpen={showReloginModal}
        onRelogin={handleRelogin}
        isRedirecting={isRedirecting}
      />

      {/* Modal Konfirmasi Request Reset Password */}
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
              Super Admin untuk ditinjau. Setelah disetujui, Anda akan menerima kata sandi sementara
              dari admin.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Proses reset kata sandi:</p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>Permintaan dikirim ke Super Admin</li>
              <li>Super Admin memverifikasi dan mereset kata sandi</li>
              <li>Anda menerima kata sandi sementara dari admin</li>
              <li>Login dengan kata sandi sementara</li>
              <li>
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  Wajib ganti kata sandi
                </span>{" "}
                sebelum melanjutkan
              </li>
            </ol>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              disabled={isRequestingReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleRequestReset}
              disabled={isRequestingReset}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg shadow-sm hover:bg-amber-700 disabled:opacity-70"
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

export default ManageAccountPage;
