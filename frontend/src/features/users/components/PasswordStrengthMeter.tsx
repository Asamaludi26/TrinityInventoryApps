import React from "react";

interface PasswordStrengthProps {
  passwordStrength: { score: number; label: string; color: string };
}

/**
 * Password Strength Meter dengan dukungan dark mode
 * Menampilkan visualisasi kekuatan kata sandi secara real-time
 */
export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({ passwordStrength }) => {
  if (passwordStrength.score === 0) {
    return null;
  }

  const getTextColor = () => {
    switch (passwordStrength.score) {
      case 1:
        return "text-red-600 dark:text-red-400";
      case 2:
        return "text-orange-600 dark:text-orange-400";
      case 3:
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const getBarColor = () => {
    switch (passwordStrength.score) {
      case 1:
        return "bg-red-500 dark:bg-red-400";
      case 2:
        return "bg-orange-500 dark:bg-orange-400";
      case 3:
        return "bg-blue-500 dark:bg-blue-400";
      default:
        return "bg-green-500 dark:bg-green-400";
    }
  };

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Kekuatan Kata Sandi
        </span>
        <span className={`text-xs font-bold ${getTextColor()}`}>{passwordStrength.label}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${passwordStrength.score * 25}%` }}
        />
      </div>
    </div>
  );
};
