/**
 * Security Banner Component
 *
 * Persistent notification banner untuk security-related alerts.
 * Digunakan untuk menampilkan pesan penting seperti:
 * - Password perlu diganti setelah reset oleh admin
 * - Akun baru dengan password default
 * - Session akan expire
 *
 * @example
 * <SecurityBanner
 *   type="warning"
 *   title="Keamanan Akun"
 *   message="Password Anda perlu diganti untuk keamanan akun."
 *   actionLabel="Ubah Password"
 *   onAction={() => navigateToSettings()}
 *   onDismiss={() => setShowBanner(false)}
 * />
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldExclamation,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXMark,
  HiArrowRight,
  HiLockClosed,
} from "react-icons/hi2";

export type SecurityBannerType = "security" | "warning" | "info";

export interface SecurityBannerProps {
  type: SecurityBannerType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

const bannerConfig = {
  security: {
    icon: HiShieldExclamation,
    bgGradient: "from-amber-500 via-orange-500 to-red-500",
    bgFallback: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500",
    iconBg: "bg-white/20",
    textColor: "text-white",
    buttonBg: "bg-white hover:bg-gray-100",
    buttonText: "text-orange-600 font-semibold",
    dismissBg: "hover:bg-white/20",
  },
  warning: {
    icon: HiExclamationTriangle,
    bgGradient: "from-yellow-400 via-amber-500 to-orange-500",
    bgFallback: "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500",
    iconBg: "bg-white/20",
    textColor: "text-white",
    buttonBg: "bg-white hover:bg-gray-100",
    buttonText: "text-amber-600 font-semibold",
    dismissBg: "hover:bg-white/20",
  },
  info: {
    icon: HiInformationCircle,
    bgGradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgFallback: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
    iconBg: "bg-white/20",
    textColor: "text-white",
    buttonBg: "bg-white hover:bg-gray-100",
    buttonText: "text-indigo-600 font-semibold",
    dismissBg: "hover:bg-white/20",
  },
};

export const SecurityBanner: React.FC<SecurityBannerProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  dismissible = true,
  className = "",
}) => {
  const config = bannerConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background with gradient */}
      <div className={`${config.bgFallback} shadow-lg`}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="security-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M0 20h40M20 0v40"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#security-pattern)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon + Message */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Icon Container */}
              <div className={`flex-shrink-0 p-2 sm:p-2.5 rounded-xl ${config.iconBg}`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.textColor}`} />
              </div>

              {/* Text Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <HiLockClosed
                    className={`w-3.5 h-3.5 ${config.textColor} opacity-80 hidden sm:block`}
                  />
                  <h3 className={`text-sm sm:text-base font-bold ${config.textColor} truncate`}>
                    {title}
                  </h3>
                </div>
                <p
                  className={`text-xs sm:text-sm ${config.textColor} opacity-90 mt-0.5 line-clamp-2`}
                >
                  {message}
                </p>
              </div>
            </div>

            {/* Right: Action Button + Dismiss */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {actionLabel && onAction && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAction}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 
                    rounded-lg text-xs sm:text-sm transition-all duration-200
                    ${config.buttonBg} ${config.buttonText}
                    shadow-md hover:shadow-lg
                  `}
                >
                  <span className="hidden sm:inline">{actionLabel}</span>
                  <span className="sm:hidden">Ubah</span>
                  <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.button>
              )}

              {dismissible && onDismiss && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDismiss}
                  className={`
                    p-1.5 sm:p-2 rounded-lg transition-colors duration-200
                    ${config.dismissBg} ${config.textColor}
                  `}
                  aria-label="Tutup"
                >
                  <HiXMark className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ["-200%", "200%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
};

export default SecurityBanner;
