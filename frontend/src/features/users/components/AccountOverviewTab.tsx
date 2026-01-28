/**
 * AccountOverviewTab - Komponen untuk menampilkan ringkasan statistik akun
 * Menampilkan distribusi role, divisi, dan statistik keseluruhan
 *
 * Catatan Keamanan:
 * - Distribusi Role hanya dapat dilihat oleh Super Admin
 * - Role limits: SUPER_ADMIN (1), ADMIN_LOGISTIK (3), ADMIN_PURCHASE (3)
 * - LEADER dan STAFF tidak memiliki batasan
 */

import React, { useMemo } from "react";
import { User, Division, UserRole } from "../../../types";
import { UsersIcon } from "../../../components/icons/UsersIcon";
import {
  BsShieldFillCheck,
  BsBuilding,
  BsPeopleFill,
  BsPersonBadge,
  BsGearFill,
  BsPerson,
  BsExclamationTriangleFill,
} from "react-icons/bs";

interface AccountOverviewTabProps {
  users: (User & { assetCount: number })[];
  divisions: Division[];
  currentUser: User;
  onViewUsersByRole: (role: UserRole) => void;
  onViewUsersByDivision: (divisionId: number) => void;
}

// Batas maksimal untuk setiap role
const ROLE_LIMITS: Partial<Record<UserRole, number>> = {
  "Super Admin": 1,
  "Admin Logistik": 3,
  "Admin Purchase": 3,
  // Leader dan Staff tidak ada batasan (undefined = unlimited)
};

// Definisi Role dengan warna dan deskripsi
const ROLE_INFO: Record<
  UserRole,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.FC<{ className?: string }>;
    description: string;
    warningColor: string;
  }
> = {
  "Super Admin": {
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-700",
    icon: BsShieldFillCheck,
    description: "Akses penuh ke seluruh sistem, konfigurasi, dan manajemen user",
    warningColor: "text-purple-600",
  },
  "Admin Logistik": {
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-700",
    icon: BsGearFill,
    description: "Operasi aset, gudang, stok, serah terima, dan perbaikan",
    warningColor: "text-blue-600",
  },
  "Admin Purchase": {
    color: "text-teal-700 dark:text-teal-300",
    bgColor: "bg-teal-50 dark:bg-teal-900/30",
    borderColor: "border-teal-200 dark:border-teal-700",
    icon: BsPersonBadge,
    description: "Pengadaan, vendor, dan persetujuan pembelian",
    warningColor: "text-teal-600",
  },
  Leader: {
    color: "text-sky-700 dark:text-sky-300",
    bgColor: "bg-sky-50 dark:bg-sky-900/30",
    borderColor: "border-sky-200 dark:border-sky-700",
    icon: BsPeopleFill,
    description: "Kepala divisi dengan akses urgent request",
    warningColor: "text-sky-600",
  },
  Staff: {
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-50 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
    icon: BsPerson,
    description: "Pengguna standar dengan akses request reguler",
    warningColor: "text-gray-600",
  },
};

export const AccountOverviewTab: React.FC<AccountOverviewTabProps> = ({
  users,
  divisions,
  currentUser,
  onViewUsersByRole,
  onViewUsersByDivision,
}) => {
  // Hanya Super Admin yang dapat melihat Distribusi Role
  const isSuperAdmin = currentUser.role === "Super Admin";
  // Hitung statistik role
  const roleStats = useMemo(() => {
    const stats: Record<UserRole, number> = {
      "Super Admin": 0,
      "Admin Logistik": 0,
      "Admin Purchase": 0,
      Leader: 0,
      Staff: 0,
    };

    users.forEach((user) => {
      if (stats[user.role] !== undefined) {
        stats[user.role]++;
      }
    });

    return stats;
  }, [users]);

  // Hitung statistik divisi dengan jumlah member
  const divisionStats = useMemo(() => {
    return divisions
      .map((division) => {
        const memberCount = users.filter((u) => u.divisionId === division.id).length;
        const totalAssets = users
          .filter((u) => u.divisionId === division.id)
          .reduce((acc, u) => acc + (u.assetCount || 0), 0);

        return {
          ...division,
          memberCount,
          totalAssets,
        };
      })
      .sort((a, b) => b.memberCount - a.memberCount);
  }, [users, divisions]);

  // Hitung user tanpa divisi
  const usersWithoutDivision = useMemo(() => {
    return users.filter((u) => !u.divisionId || u.divisionId === null).length;
  }, [users]);

  // Total statistik
  const totalStats = useMemo(
    () => ({
      totalUsers: users.length,
      totalDivisions: divisions.length,
      totalAssets: users.reduce((acc, u) => acc + (u.assetCount || 0), 0),
      activeUsers: users.length, // All users are considered active by default
      pendingPasswordReset: users.filter((u) => u.passwordResetRequested).length,
    }),
    [users, divisions]
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <UsersIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalStats.totalUsers}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Total Akun</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BsBuilding className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalStats.totalDivisions}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Total Divisi</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BsShieldFillCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalStats.activeUsers}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Akun Aktif</p>
            </div>
          </div>
        </div>

        {totalStats.pendingPasswordReset > 0 && (
          <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <BsShieldFillCheck className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {totalStats.pendingPasswordReset}
                </p>
                <p className="text-sm text-red-600/80 dark:text-red-300">Minta Reset Password</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Distribution - HANYA UNTUK SUPER ADMIN */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BsShieldFillCheck className="text-primary-600 dark:text-primary-400" />
                  Distribusi Role
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Pembagian pengguna berdasarkan peran dalam sistem
                </p>
              </div>
              <div className="hidden sm:block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  Super Admin Only
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => {
                const info = ROLE_INFO[role];
                const count = roleStats[role];
                const limit = ROLE_LIMITS[role];
                const isAtLimit = limit !== undefined && count >= limit;
                const isOverLimit = limit !== undefined && count > limit;
                const percentage =
                  totalStats.totalUsers > 0 ? Math.round((count / totalStats.totalUsers) * 100) : 0;
                const Icon = info.icon;

                return (
                  <button
                    key={role}
                    onClick={() => onViewUsersByRole(role)}
                    className={`p-4 rounded-xl border ${isOverLimit ? "border-red-400 dark:border-red-600" : info.borderColor} ${info.bgColor} text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] relative`}
                  >
                    {/* Limit Badge */}
                    {limit !== undefined && (
                      <div
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isOverLimit
                            ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                            : isAtLimit
                              ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {count}/{limit}
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${info.bgColor}`}>
                        <Icon className={`w-5 h-5 ${info.color}`} />
                      </div>
                      <span
                        className={`text-2xl font-bold ${isOverLimit ? "text-red-600 dark:text-red-400" : info.color}`}
                      >
                        {count}
                      </span>
                    </div>
                    <h4 className={`font-semibold ${info.color}`}>{role}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {info.description}
                    </p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5">
                        <div
                          className="bg-current h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            color: info.color.includes("purple")
                              ? "#7c3aed"
                              : info.color.includes("blue")
                                ? "#2563eb"
                                : info.color.includes("teal")
                                  ? "#0d9488"
                                  : info.color.includes("sky")
                                    ? "#0284c7"
                                    : info.color.includes("orange")
                                      ? "#ea580c"
                                      : "#6b7280",
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {percentage}% dari total
                        {limit === undefined && (
                          <span className="ml-1 text-green-600 dark:text-green-400">
                            (Unlimited)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Warning jika mencapai atau melebihi limit */}
                    {isAtLimit && (
                      <div
                        className={`mt-2 flex items-center gap-1 text-xs ${isOverLimit ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
                      >
                        <BsExclamationTriangleFill className="w-3 h-3" />
                        <span>{isOverLimit ? "Melebihi batas!" : "Limit tercapai"}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend untuk limit */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                Batasan Jumlah Role:
              </h4>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Super Admin: Max 1
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Admin Logistik: Max 3
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Admin Purchase: Max 3
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Leader & Staff: Unlimited
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Division Distribution */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BsBuilding className="text-green-600 dark:text-green-400" />
            Distribusi Divisi
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Pembagian pengguna dan aset per divisi
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Divisi
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Jumlah Anggota
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Aset Dipegang
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Distribusi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {divisionStats.map((division) => {
                const percentage =
                  totalStats.totalUsers > 0
                    ? Math.round((division.memberCount / totalStats.totalUsers) * 100)
                    : 0;

                return (
                  <tr
                    key={division.id}
                    onClick={() => onViewUsersByDivision(division.id)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <BsBuilding className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {division.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold">
                        {division.memberCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {division.totalAssets}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[150px]">
                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {percentage}%
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* User tanpa divisi */}
              {usersWithoutDivision > 0 && (
                <tr className="bg-amber-50/50 dark:bg-amber-900/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <BsPerson className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-300">
                          Tanpa Divisi
                        </p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                          Pengguna belum ditetapkan ke divisi
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold">
                      {usersWithoutDivision}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-400 dark:text-slate-500">-</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[150px]">
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round((usersWithoutDivision / totalStats.totalUsers) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {Math.round((usersWithoutDivision / totalStats.totalUsers) * 100)}%
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewTab;
