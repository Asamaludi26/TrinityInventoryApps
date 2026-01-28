/**
 * AccountProfileTab - Tab Profil untuk halaman Kelola Akun Saya
 * Menampilkan informasi profil lengkap user dengan fitur edit inline
 */

import React, { useState } from "react";
import { User, Division, Asset, Request, ItemStatus, Permission } from "../../../types";
import { UserIcon } from "../../../components/icons/UserIcon";
import { AssetIcon } from "../../../components/icons/AssetIcon";
import { RequestIcon } from "../../../components/icons/RequestIcon";
import { PencilIcon } from "../../../components/icons/PencilIcon";
import { CheckIcon } from "../../../components/icons/CheckIcon";
import { CloseIcon } from "../../../components/icons/CloseIcon";
import { SpinnerIcon } from "../../../components/icons/SpinnerIcon";
import {
  BsShieldFillCheck,
  BsBuilding,
  BsEnvelope,
  BsPersonBadge,
  BsClock,
  BsCheckCircleFill,
  BsXCircleFill,
  BsArrowRight,
} from "react-icons/bs";
import { ALL_PERMISSIONS, hasPermission } from "../../../utils/permissions";

interface AccountProfileTabProps {
  user: User;
  division?: Division;
  userAssets: Asset[];
  userRequests: Request[];
  // Edit functionality
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  nameError: string;
  emailError: string;
  isLoading: boolean;
  onSaveProfile: () => Promise<void>;
  // Navigation
  onViewAssets: () => void;
  onViewRequests: () => void;
}

// Role style configuration
const getRoleStyle = (role: User["role"]) => {
  switch (role) {
    case "Super Admin":
      return {
        badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700",
        gradient: "from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600",
      };
    case "Admin Logistik":
      return {
        badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
        gradient: "from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600",
      };
    case "Admin Purchase":
      return {
        badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700",
        gradient: "from-teal-600 to-teal-500 dark:from-teal-700 dark:to-teal-600",
      };
    case "Leader":
      return {
        badge: "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-700",
        gradient: "from-sky-600 to-sky-500 dark:from-sky-700 dark:to-sky-600",
      };
    default:
      return {
        badge: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        gradient: "from-gray-600 to-gray-500 dark:from-gray-700 dark:to-gray-600",
      };
  }
};

// Role description
const getRoleDescription = (role: User["role"]) => {
  switch (role) {
    case "Super Admin":
      return "Akses penuh ke seluruh sistem, konfigurasi, dan manajemen user";
    case "Admin Logistik":
      return "Operasi aset, gudang, stok, serah terima, dan perbaikan";
    case "Admin Purchase":
      return "Pengadaan, vendor, dan persetujuan pembelian";
    case "Leader":
      return "Kepala divisi dengan akses urgent request";
    default:
      return "Pengguna standar dengan akses request reguler";
  }
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
  color: string;
}> = ({ title, value, icon, onClick, color }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`p-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-left transition-all ${
      onClick ? "hover:shadow-md hover:scale-[1.02] cursor-pointer" : "cursor-default"
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 ${color} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
      </div>
    </div>
  </button>
);

// Permission Badge Component
const PermissionBadge: React.FC<{ 
  permission: { key: Permission; label: string }; 
  granted: boolean 
}> = ({ permission, granted }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
      granted
        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
    }`}
    title={permission.key}
  >
    {granted ? (
      <BsCheckCircleFill className="w-3 h-3" />
    ) : (
      <BsXCircleFill className="w-3 h-3" />
    )}
    <span className="truncate max-w-[150px]">{permission.label}</span>
  </div>
);

export const AccountProfileTab: React.FC<AccountProfileTabProps> = ({
  user,
  division,
  userAssets,
  userRequests,
  name,
  setName,
  email,
  setEmail,
  nameError,
  emailError,
  isLoading,
  onSaveProfile,
  onViewAssets,
  onViewRequests,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalName] = useState(user.name);
  const [originalEmail] = useState(user.email);
  const [expandedPermissionGroup, setExpandedPermissionGroup] = useState<string | null>(null);

  // Calculate pending requests
  const pendingRequests = userRequests.filter(
    (r) =>
      r.status === ItemStatus.PENDING ||
      r.status === ItemStatus.LOGISTIC_APPROVED ||
      r.status === ItemStatus.AWAITING_CEO_APPROVAL
  ).length;

  const roleStyle = getRoleStyle(user.role);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveProfile();
      setIsEditing(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(originalName);
    setEmail(originalEmail);
    setIsEditing(false);
  };

  const hasChanges = name !== originalName || email !== originalEmail;

  // Count granted permissions per group
  const permissionStats = ALL_PERMISSIONS.map((group) => {
    const granted = group.permissions.filter((p) => hasPermission(user, p.key)).length;
    return { ...group, granted, total: group.permissions.length };
  });

  return (
    <div className="space-y-6">
      {/* User Identity Card with Edit */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${roleStyle.gradient} px-6 py-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold text-white uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-2xl font-bold bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Nama Lengkap"
                    disabled={isSaving}
                  />
                ) : (
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <BsEnvelope className="w-4 h-4 text-white/80" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                      placeholder="email@example.com"
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="text-white/80">{user.email}</span>
                  )}
                </div>
                {(nameError || emailError) && isEditing && (
                  <p className="text-red-200 text-xs mt-2">{nameError || emailError}</p>
                )}
              </div>
            </div>
            
            {/* Edit Button */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Batal"
                  >
                    <CloseIcon className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges || !!nameError || !!emailError}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? (
                      <SpinnerIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    Simpan
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium text-sm transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${roleStyle.badge}`}
            >
              <BsShieldFillCheck className="w-4 h-4" />
              <span className="font-semibold">{user.role}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
              <BsBuilding className="w-4 h-4" />
              <span className="font-medium">{division?.name || "Tidak ada divisi"}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              <span className="font-medium text-gray-700 dark:text-slate-300">Deskripsi Role:</span>{" "}
              {getRoleDescription(user.role)}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Aset Dipegang"
          value={userAssets.length}
          icon={<AssetIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
          color="bg-primary-100 dark:bg-primary-900/30"
          onClick={userAssets.length > 0 ? onViewAssets : undefined}
        />
        <StatCard
          title="Total Request"
          value={userRequests.length}
          icon={<RequestIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
          color="bg-green-100 dark:bg-green-900/30"
          onClick={userRequests.length > 0 ? onViewRequests : undefined}
        />
        <StatCard
          title="Request Pending"
          value={pendingRequests}
          icon={<BsClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Permissions Overview */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BsShieldFillCheck className="text-primary-600 dark:text-primary-400" />
            Hak Akses Anda
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Ringkasan permission berdasarkan role: <strong>{user.role}</strong>
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {permissionStats.map((group) => (
              <div
                key={group.group}
                className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedPermissionGroup(
                      expandedPermissionGroup === group.group ? null : group.group
                    )
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">{group.group}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        group.granted === group.total
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : group.granted > 0
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}
                    >
                      {group.granted}/{group.total}
                    </span>
                  </div>
                  <BsArrowRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedPermissionGroup === group.group ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandedPermissionGroup === group.group && (
                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    {group.permissions.map((p) => (
                      <PermissionBadge
                        key={p.key}
                        permission={p}
                        granted={hasPermission(user, p.key)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access - Recent Assets */}
      {userAssets.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AssetIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Aset yang Dipegang
            </h3>
            <button
              onClick={onViewAssets}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua <BsArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userAssets.slice(0, 6).map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600"
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">{asset.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-1">
                    {asset.id}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Kondisi: <span className="font-medium">{asset.condition}</span>
                  </p>
                </div>
              ))}
            </div>
            {userAssets.length > 6 && (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center mt-3">
                +{userAssets.length - 6} aset lainnya
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountProfileTab;
