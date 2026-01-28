import React, { useState } from "react";
// FIX: Menghapus 'Page' dari import karena tidak digunakan
import { User, Permission } from "../../types";
import { DetailPageLayout } from "../../components/layout/DetailPageLayout";
import { ClickableLink } from "../../components/ui/ClickableLink";
import { PencilIcon } from "../../components/icons/PencilIcon";
import { AssetIcon } from "../../components/icons/AssetIcon";
import { RequestIcon } from "../../components/icons/RequestIcon";
import { KeyIcon } from "../../components/icons/KeyIcon";
import { ExclamationTriangleIcon } from "../../components/icons/ExclamationTriangleIcon";
import Modal from "../../components/ui/Modal";
import { SpinnerIcon } from "../../components/icons/SpinnerIcon";
import { useNotification } from "../../providers/NotificationProvider";
import { hasPermission } from "../../utils/permissions";
import { ALL_PERMISSIONS } from "../../utils/permissions";
import { CheckIcon } from "../../components/icons/CheckIcon";
import { LockIcon } from "../../components/icons/LockIcon";
import {
  BsShieldLock,
  BsExclamationTriangleFill,
  BsShieldFillCheck,
  BsBuilding,
  BsEnvelope,
  BsCheckCircleFill,
  BsXCircleFill,
  BsArrowRight,
  BsClock,
} from "react-icons/bs";
import { CopyIcon } from "../../components/icons/CopyIcon";

// Store
import { useMasterDataStore } from "../../stores/useMasterDataStore";
import { useAssetStore } from "../../stores/useAssetStore";
import { useRequestStore } from "../../stores/useRequestStore";

// API
import { usersApi } from "../../services/api/master-data.api";

interface UserDetailPageProps {
  user?: User;
  currentUser: User;
  onBack: () => void;
  onEdit: () => void;
  onShowAssetPreview: (assetId: string) => void;
  pageInitialState?: { userId?: number };
}

// Role styling - synchronized with AccountProfileTabNew
const getRoleStyle = (role: User["role"]) => {
  switch (role) {
    case "Super Admin":
      return {
        badge:
          "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700",
        gradient: "from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600",
      };
    case "Admin Logistik":
      return {
        badge:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
        gradient: "from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600",
      };
    case "Admin Purchase":
      return {
        badge:
          "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700",
        gradient: "from-teal-600 to-teal-500 dark:from-teal-700 dark:to-teal-600",
      };
    case "Leader":
      return {
        badge:
          "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-700",
        gradient: "from-sky-600 to-sky-500 dark:from-sky-700 dark:to-sky-600",
      };
    default:
      return {
        badge:
          "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
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

// Stat Card Component - synchronized with AccountProfileTabNew
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="p-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${color} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
      </div>
    </div>
  </div>
);

// Permission Badge Component
const PermissionBadge: React.FC<{
  permission: { key: Permission; label: string };
  granted: boolean;
}> = ({ permission, granted }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
      granted
        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
    }`}
    title={permission.key}
  >
    {granted ? <BsCheckCircleFill className="w-3 h-3" /> : <BsXCircleFill className="w-3 h-3" />}
    <span className="truncate max-w-[150px]">{permission.label}</span>
  </div>
);

// Helper for Secure Password Generation
const generateSecurePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const length = 12;
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

const UserDetailPage: React.FC<UserDetailPageProps> = ({
  user: propUser,
  currentUser,
  onBack,
  onEdit,
  onShowAssetPreview,
  pageInitialState,
}) => {
  // --- 1. HOOKS DECLARATION (Harus Selalu di Paling Atas) ---
  const users = useMasterDataStore((state) => state.users);
  const updateUser = useMasterDataStore((state) => state.updateUser);
  const divisions = useMasterDataStore((state) => state.divisions);
  const assets = useAssetStore((state) => state.assets);
  const requests = useRequestStore((state) => state.requests);
  const addNotification = useNotification();

  // FIX: Memindahkan useState ke atas sebelum conditional return
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. DATA DERIVATION ---
  const userId = pageInitialState?.userId || propUser?.id;
  const user = users.find((u) => u.id === userId) || propUser;
  const division = divisions.find((d) => d.id === user?.divisionId);

  // --- 3. CONDITIONAL RETURN (Guard Clause) ---
  // Sekarang aman untuk return karena semua Hooks sudah dipanggil di atas
  if (!user) return <div>Pengguna tidak ditemukan.</div>;

  // --- 4. LOGIC YANG BERGANTUNG PADA 'user' ---
  const isRestrictedView = currentUser.role === "Admin Logistik" && user.id !== currentUser.id;

  const userAssets = assets.filter((asset) => asset.currentUser === user.name);
  const userRequests = requests.filter((req) => req.requester === user.name);

  const openResetModal = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    setIsLoading(true);
    const tempPassword = generateSecurePassword();

    try {
      // Gunakan endpoint dedicated resetPassword
      // Backend akan otomatis set mustChangePassword = true
      await usersApi.resetPassword(user.id, tempPassword);

      // Update local state untuk UI
      updateUser(user.id, {
        passwordResetRequested: false,
        passwordResetRequestDate: undefined,
      });

      setNewPassword(tempPassword);
      setIsResetModalOpen(false);
      setIsPasswordShown(true);
      addNotification("Password berhasil di-reset.", "success");
    } catch (e) {
      console.error(e);
      addNotification("Gagal mereset password.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const closePasswordModal = () => {
    setIsPasswordShown(false);
    setNewPassword("");
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    addNotification("Password disalin ke clipboard.", "success");
  };

  const roleStyle = getRoleStyle(user.role);

  // For permission stats - count granted permissions per group
  const permissionStats = ALL_PERMISSIONS.map((group) => {
    const granted = group.permissions.filter((p) => user.permissions.includes(p.key)).length;
    return { ...group, granted, total: group.permissions.length };
  });

  // State for expandable permission groups
  const [expandedPermissionGroup, setExpandedPermissionGroup] = useState<string | null>(null);

  return (
    <>
      <DetailPageLayout
        title={`Detail Akun: ${user.name}`}
        onBack={onBack}
        headerActions={
          hasPermission(currentUser, "users:edit") &&
          !isRestrictedView && (
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Akun
            </button>
          )
        }
      >
        <div className="space-y-6">
          {/* User Identity Card - Synchronized with AccountProfileTabNew */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${roleStyle.gradient} px-6 py-8`}>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <BsEnvelope className="w-4 h-4 text-white/80" />
                    {isRestrictedView ? (
                      <span className="italic flex items-center gap-1 text-white/60">
                        <BsShieldLock className="w-3 h-3" /> Email Tersembunyi
                      </span>
                    ) : (
                      <span className="text-white/80">{user.email}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-3">
                {isRestrictedView ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                    <BsShieldLock className="w-4 h-4" />
                    <span className="font-medium">Role Tersembunyi</span>
                  </div>
                ) : (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${roleStyle.badge}`}
                  >
                    <BsShieldFillCheck className="w-4 h-4" />
                    <span className="font-semibold">{user.role}</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                  <BsBuilding className="w-4 h-4" />
                  <span className="font-medium">{division?.name || "Tidak ada divisi"}</span>
                </div>
              </div>

              {!isRestrictedView && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    <span className="font-medium text-gray-700 dark:text-slate-300">
                      Deskripsi Role:
                    </span>{" "}
                    {getRoleDescription(user.role)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Section - 3 columns synchronized with AccountProfileTabNew */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Aset Dipegang"
              value={userAssets.length}
              icon={<AssetIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
              color="bg-primary-100 dark:bg-primary-900/30"
            />
            <StatCard
              title="Total Request"
              value={userRequests.length}
              icon={<RequestIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
              color="bg-green-100 dark:bg-green-900/30"
            />
            <StatCard
              title="Permission Groups"
              value={permissionStats.filter((g) => g.granted > 0).length}
              icon={<BsShieldFillCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
              color="bg-amber-100 dark:bg-amber-900/30"
            />
          </div>

          {/* Permissions Section - SYNCHRONIZED with AccountProfileTabNew expandable style */}
          {hasPermission(currentUser, "users:manage-permissions") && !isRestrictedView && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BsShieldFillCheck className="text-primary-600 dark:text-primary-400" />
                  Hak Akses Pengguna
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Permission berdasarkan role: <strong>{user.role}</strong>
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
                          <span className="font-medium text-gray-900 dark:text-white">
                            {group.group}
                          </span>
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
                              granted={user.permissions.includes(p.key)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Section (Super Admin / Admin with reset-password permission) */}
          {hasPermission(currentUser, "users:reset-password") &&
            user.id !== currentUser.id &&
            !isRestrictedView && (
              <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-600 pb-3 flex items-center gap-2">
                  <LockIcon className="w-5 h-5 text-primary-600" />
                  Keamanan Akun
                </h3>

                <div className="space-y-4">
                  {/* Jika ada permintaan reset password aktif */}
                  {user.passwordResetRequested && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                            <BsExclamationTriangleFill className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                              Permintaan Reset Password Aktif
                            </h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              User meminta reset password pada{" "}
                              {user.passwordResetRequestDate
                                ? new Date(user.passwordResetRequestDate).toLocaleString("id-ID")
                                : "baru-baru ini"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={openResetModal}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg shadow-sm hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <KeyIcon className="w-4 h-4" />
                          Approve Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tombol Reset Manual - SELALU tampil untuk Super Admin */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">
                        Reset Kata Sandi Manual
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reset password langsung tanpa perlu request dari user.
                      </p>
                    </div>
                    <button
                      onClick={openResetModal}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      <KeyIcon className="w-4 h-4" />
                      Reset Manual
                    </button>
                  </div>

                  {/* Info tentang alur reset */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-semibold">Info:</span> Setelah reset, user akan menerima
                      password sementara dan{" "}
                      <span className="font-semibold">wajib menggantinya</span> saat login pertama
                      kali.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Assigned Assets Section */}
          <div className="p-6 bg-white border border-gray-200/80 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Aset yang Digunakan ({userAssets.length})
            </h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Aset
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Aset
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MAC Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kondisi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userAssets.length > 0 ? (
                    userAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <ClickableLink onClick={() => onShowAssetPreview(asset.id)}>
                            {asset.name}
                          </ClickableLink>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600">
                          {asset.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600">
                          {asset.serialNumber || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600">
                          {asset.macAddress || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {asset.condition}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                        Tidak ada aset yang sedang digunakan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DetailPageLayout>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Kata Sandi?"
        size="md"
        hideDefaultCloseButton
      >
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">Anda yakin?</h3>
          <p className="mt-2 text-sm text-gray-600">
            Anda akan membuat kata sandi sementara baru untuk <strong>{user.name}</strong>. Akses
            pengguna akan dipulihkan.
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={() => setIsResetModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmReset}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700"
          >
            {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />} Ya, Reset
          </button>
        </div>
      </Modal>

      {/* Result Modal - Improved UX */}
      <Modal
        isOpen={isPasswordShown}
        onClose={closePasswordModal}
        title="Kata Sandi Baru"
        size="md"
      >
        <p className="text-sm text-gray-600">
          Bagikan kata sandi sementara berikut kepada <strong>{user.name}</strong>.
        </p>

        <div className="my-4 relative">
          <div className="p-4 text-center font-mono text-xl tracking-widest text-gray-900 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg select-all">
            {newPassword}
          </div>
          <button
            onClick={copyPassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-md transition-all shadow-sm"
            title="Salin Password"
          >
            <CopyIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center text-xs text-amber-700 p-3 bg-amber-50 rounded-md border border-amber-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <LockIcon className="w-3 h-3" />
            <strong>Penting:</strong>
          </div>
          <p>
            Password ini hanya ditampilkan sekali. Pastikan Anda menyalinnya sebelum menutup jendela
            ini.
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={closePasswordModal}
            className="w-full px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700"
          >
            Selesai
          </button>
        </div>
      </Modal>
    </>
  );
};

export default UserDetailPage;
