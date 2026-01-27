import React from "react";
import { CheckIcon } from "../../../components/icons/CheckIcon";
import { SpinnerIcon } from "../../../components/icons/SpinnerIcon";

interface ReloginSuccessModalProps {
  isOpen: boolean;
  onRelogin: () => void;
  isRedirecting: boolean;
}

/**
 * Modal sukses elegan yang menginformasikan user harus re-login
 * setelah berhasil mengubah password.
 * Mendukung dark mode.
 */
export const ReloginSuccessModal: React.FC<ReloginSuccessModalProps> = ({
  isOpen,
  onRelogin,
  isRedirecting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-gray-900/70 dark:bg-black/80 backdrop-blur-sm transition-opacity" />

      {/* Center container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Panel */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Success Header with Gradient */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 px-6 py-8">
            <div className="flex flex-col items-center text-center">
              {/* Animated Check Icon */}
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
                <CheckIcon className="h-12 w-12 text-white animate-in zoom-in-50 duration-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Password Berhasil Diubah!</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="mb-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Demi keamanan akun Anda, silakan login kembali dengan password baru Anda untuk
                melanjutkan sesi.
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-6 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-500 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Sesi Anda saat ini akan berakhir. Anda akan diarahkan ke halaman login.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onRelogin}
              disabled={isRedirecting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/30 dark:shadow-primary-500/20 transition-all hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 hover:shadow-xl hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isRedirecting ? (
                <>
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                  Mengalihkan ke Login...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login Kembali
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Password baru akan berlaku segera setelah login berikutnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReloginSuccessModal;
