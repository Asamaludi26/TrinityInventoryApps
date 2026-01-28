/**
 * Force Change Password Notice Modal
 *
 * Modal yang WAJIB muncul saat user login dengan mustChangePassword = true.
 * Tidak bisa di-dismiss - user HARUS mengganti password untuk melanjutkan.
 *
 * Trigger cases:
 * 1. User baru dengan default password
 * 2. Admin reset password user
 * 3. Policy keamanan (password expired)
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldExclamation,
  HiArrowRight,
  HiLockClosed,
  HiExclamationTriangle,
} from "react-icons/hi2";

interface ForceChangePasswordNoticeProps {
  isOpen: boolean;
  userName?: string;
  reason?: "default_password" | "admin_reset" | "policy";
  onChangePassword: () => void;
}

const reasonConfig = {
  default_password: {
    title: "Selamat Datang!",
    subtitle: "Langkah keamanan pertama Anda",
    message:
      "Akun Anda masih menggunakan password default. Demi keamanan data dan akses Anda, segera ganti password dengan yang lebih kuat.",
    icon: HiLockClosed,
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
  },
  admin_reset: {
    title: "Password Telah Direset",
    subtitle: "Tindakan keamanan diperlukan",
    message:
      "Administrator telah mereset password Anda. Untuk melanjutkan menggunakan aplikasi, Anda harus membuat password baru yang aman.",
    icon: HiShieldExclamation,
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  policy: {
    title: "Password Perlu Diperbarui",
    subtitle: "Kebijakan keamanan",
    message:
      "Sesuai kebijakan keamanan perusahaan, password Anda perlu diperbarui secara berkala. Silakan buat password baru.",
    icon: HiExclamationTriangle,
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
  },
};

export const ForceChangePasswordNotice: React.FC<ForceChangePasswordNoticeProps> = ({
  isOpen,
  userName,
  reason = "default_password",
  onChangePassword,
}) => {
  const config = reasonConfig[reason];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - tidak bisa diklik untuk close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with Gradient */}
              <div className={`relative bg-gradient-to-r ${config.gradient} p-8`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern
                        id="security-pattern"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#security-pattern)" />
                  </svg>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
                    className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4"
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {config.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 text-sm"
                  >
                    {config.subtitle}
                  </motion.p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Greeting */}
                {userName && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-gray-600 dark:text-gray-300 mb-3"
                  >
                    Halo,{" "}
                    <span className="font-semibold text-gray-800 dark:text-white">{userName}</span>!
                  </motion.p>
                )}

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
                >
                  {config.message}
                </motion.p>

                {/* Security Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <HiLockClosed className="w-4 h-4" />
                    Tips Password Kuat
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Minimal 8 karakter</li>
                    <li>• Kombinasi huruf besar, kecil, angka, dan simbol</li>
                    <li>• Jangan gunakan informasi pribadi</li>
                    <li>• Berbeda dari password sebelumnya</li>
                  </ul>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onChangePassword}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <HiLockClosed className="w-5 h-5" />
                  Ganti Password Sekarang
                  <HiArrowRight className="w-5 h-5" />
                </motion.button>

                {/* Footer Notice */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4"
                >
                  Anda tidak dapat mengakses fitur aplikasi sebelum mengganti password.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ForceChangePasswordNotice;
