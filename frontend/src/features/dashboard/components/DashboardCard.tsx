import React from "react";
import { Tooltip } from "../../../components/ui/Tooltip";

interface DashboardCardProps {
  title: string;
  value: string | number;
  secondaryMetric: string;
  icon: React.FC<{ className?: string }>;
  color: "blue" | "green" | "amber" | "red" | "purple" | "indigo" | "teal" | "rose";
  onClick: () => void;
  tooltipText?: string;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  secondaryMetric,
  icon: Icon,
  color,
  onClick,
  tooltipText,
  className = "",
}) => {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      ring: "group-hover:ring-blue-100 dark:group-hover:ring-blue-900/50",
      dot: "bg-blue-500",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      ring: "group-hover:ring-emerald-100 dark:group-hover:ring-emerald-900/50",
      dot: "bg-emerald-500",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      ring: "group-hover:ring-amber-100 dark:group-hover:ring-amber-900/50",
      dot: "bg-amber-500",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      ring: "group-hover:ring-red-100 dark:group-hover:ring-red-900/50",
      dot: "bg-red-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
      ring: "group-hover:ring-purple-100 dark:group-hover:ring-purple-900/50",
      dot: "bg-purple-500",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800",
      ring: "group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/50",
      dot: "bg-indigo-500",
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-900/30",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-200 dark:border-teal-800",
      ring: "group-hover:ring-teal-100 dark:group-hover:ring-teal-900/50",
      dot: "bg-teal-500",
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-900/30",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-800",
      ring: "group-hover:ring-rose-100 dark:group-hover:ring-rose-900/50",
      dot: "bg-rose-500",
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  const cardContent = (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between h-full p-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all duration-300 cursor-pointer hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1 hover:border-transparent ring-0 hover:ring-2 ${style.ring} ${className}`}
    >
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 tracking-wide uppercase truncate">
            {title}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-gray-900 dark:text-white truncate block"
              title={typeof value === "string" ? value : undefined}
            >
              {value}
            </span>
          </div>
        </div>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 ${style.bg} ${style.text} transition-transform group-hover:scale-110`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`}
          ></span>
          <span className="truncate">{secondaryMetric}</span>
        </p>
      </div>
    </div>
  );

  if (tooltipText) {
    return <Tooltip text={tooltipText}>{cardContent}</Tooltip>;
  }

  return cardContent;
};
