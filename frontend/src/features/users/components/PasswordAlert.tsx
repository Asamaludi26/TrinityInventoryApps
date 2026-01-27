import React from "react";

interface PasswordAlertProps {
  type: "warning" | "error";
  message: string;
  show: boolean;
}

/**
 * Komponen alert modern untuk validasi password.
 * Digunakan untuk menampilkan peringatan saat kata sandi tidak valid.
 */
export const PasswordAlert: React.FC<PasswordAlertProps> = ({ type, message, show }) => {
  if (!show) return null;

  const styles = {
    warning: {
      container:
        "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-100",
      icon: "text-amber-600 dark:text-amber-300",
      iconBg: "bg-amber-100 dark:bg-amber-500/30",
    },
    error: {
      container:
        "bg-red-50 border-red-300 text-red-900 dark:bg-red-500/20 dark:border-red-500/50 dark:text-red-100",
      icon: "text-red-600 dark:text-red-300",
      iconBg: "bg-red-100 dark:bg-red-500/30",
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${currentStyle.container} animate-in fade-in-0 slide-in-from-top-1 duration-300`}
      role="alert"
    >
      <div className={`flex-shrink-0 p-1.5 rounded-lg ${currentStyle.iconBg}`}>
        {type === "warning" ? (
          <svg className={`w-5 h-5 ${currentStyle.icon}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className={`w-5 h-5 ${currentStyle.icon}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export default PasswordAlert;
