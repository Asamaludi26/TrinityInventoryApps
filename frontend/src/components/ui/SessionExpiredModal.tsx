/**
 * Session Expired Modal Component
 *
 * Modal modern yang ditampilkan saat sesi berakhir (401).
 * Mengganti alert() JavaScript dengan UI yang lebih profesional.
 *
 * Fitur:
 * - Animasi smooth dengan Framer Motion
 * - Auto-redirect ke login setelah countdown
 * - Design modern sesuai SaaS standards
 * - Support berbagai tipe (success untuk password change, warning untuk expired)
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldExclamation,
  HiArrowRightOnRectangle,
  HiCheckCircle,
  HiInformationCircle,
} from "react-icons/hi2";

export type SessionModalType = "success" | "warning" | "info";

interface SessionExpiredModalProps {
  isOpen: boolean;
  message?: string;
  title?: string;
  type?: SessionModalType;
  infoText?: string;
  buttonText?: string;
  onConfirm: () => void;
  autoRedirectSeconds?: number;
}

const typeConfig = {
  success: {
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    icon: HiCheckCircle,
    iconBg: "bg-white/20",
  },
  warning: {
    gradient: "from-red-500 via-orange-500 to-amber-500",
    icon: HiShieldExclamation,
    iconBg: "bg-white/20",
  },
  info: {
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    icon: HiInformationCircle,
    iconBg: "bg-white/20",
  },
};

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  message = "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.",
  title = "Sesi Berakhir",
  type = "warning",
  infoText,
  buttonText = "Login Kembali",
  onConfirm,
  autoRedirectSeconds = 5,
}) => {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoRedirectSeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onConfirm, autoRedirectSeconds]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with Icon */}
              <div className={`relative bg-gradient-to-r ${config.gradient} p-8`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern id="circles" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="2" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circles)" />
                  </svg>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-center text-gray-600 dark:text-gray-300 mb-4">{message}</p>

                {/* Info box */}
                {infoText && (
                  <div className="flex items-start gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <HiInformationCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">{infoText}</p>
                  </div>
                )}

                {/* Countdown indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Anda akan diarahkan ke halaman login.
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <HiArrowRightOnRectangle className="w-5 h-5" />
                  {buttonText}
                </motion.button>

                {/* Footer text */}
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                  Password baru akan berlaku segera setelah login berikutnya.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredModal;
