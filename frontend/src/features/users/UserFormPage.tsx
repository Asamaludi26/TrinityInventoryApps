import React, { useState, useEffect } from "react";
import { User, UserRole, Permission } from "../../types";
import { useNotification } from "../../providers/NotificationProvider";
import { SpinnerIcon } from "../../components/icons/SpinnerIcon";
import { CustomSelect } from "../../components/ui/CustomSelect";
import FormPageLayout from "../../components/layout/FormPageLayout";
import {
  hasPermission,
  ROLE_DEFAULT_PERMISSIONS,
  sanitizePermissions,
} from "../../utils/permissions";
import { PermissionManager } from "./components/PermissionManager";
import { LockIcon } from "../../components/icons/LockIcon";
import { BsInfoCircle, BsShieldLock, BsExclamationTriangle } from "react-icons/bs";

// Store Import
import { useMasterDataStore } from "../../stores/useMasterDataStore";
import { usersApi } from "../../services/api/master-data.api";

// Password standar untuk akun baru
const DEFAULT_PASSWORD = "Trinity@2026";

const userRoles: UserRole[] = [
  "Staff",
  "Leader",
  "Admin Logistik",
  "Admin Purchase",
  "Super Admin",
];

// Interface untuk role limit info
interface RoleLimitInfo {
  role: string;
  displayName: string;
  limit: number | null;
  current: number;
  available: number | null;
}

interface UserFormPageProps {
  currentUser: User;
  onCancel: () => void;
  editingUser: User | null;
}

const UserFormPage: React.FC<UserFormPageProps> = ({ currentUser, onCancel, editingUser }) => {
  // Zustand State
  const divisions = useMasterDataStore((state) => state.divisions);
  const addUser = useMasterDataStore((state) => state.addUser);
  const updateUser = useMasterDataStore((state) => state.updateUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Staff");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    divisions[0]?.id.toString() || ""
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleLimits, setRoleLimits] = useState<RoleLimitInfo[]>([]);
  const [roleWarning, setRoleWarning] = useState<string | null>(null);
  const addNotification = useNotification();

  const inventoryDivisionId = divisions.find((d) => d.name === "Logistik")?.id.toString();
  const canManagePermissions = hasPermission(currentUser, "users:manage-permissions");

  const isSuperAdminAccount = editingUser?.role === "Super Admin";

  // Fetch role limits on mount
  useEffect(() => {
    const fetchRoleLimits = async () => {
      try {
        const limits = await usersApi.getRoleLimits();
        setRoleLimits(limits);
      } catch (error) {
        console.error("Failed to fetch role limits:", error);
      }
    };
    fetchRoleLimits();
  }, []);

  // Check role availability when role changes
  useEffect(() => {
    if (!roleLimits.length) return;

    const limitInfo = roleLimits.find((r) => {
      // Map frontend role name to backend role name
      const backendRoleMap: Record<string, string> = {
        "Super Admin": "SUPER_ADMIN",
        "Admin Logistik": "ADMIN_LOGISTIK",
        "Admin Purchase": "ADMIN_PURCHASE",
      };
      return r.role === backendRoleMap[selectedRole];
    });

    if (limitInfo && limitInfo.limit !== null) {
      // For edit mode, if same role, available = limit - (current - 1) since we're counting ourselves
      const available =
        editingUser?.role === selectedRole
          ? limitInfo.limit - limitInfo.current + 1
          : limitInfo.available;

      if (available !== null && available <= 0 && editingUser?.role !== selectedRole) {
        setRoleWarning(
          `Batas maksimal akun ${limitInfo.displayName} sudah tercapai (${limitInfo.limit} akun). Pilih role lain atau nonaktifkan akun yang ada.`
        );
      } else if (available !== null && available === 1) {
        setRoleWarning(
          `Peringatan: Hanya tersisa ${available} slot untuk role ${limitInfo.displayName}.`
        );
      } else {
        setRoleWarning(null);
      }
    } else {
      setRoleWarning(null);
    }
  }, [selectedRole, roleLimits, editingUser]);

  // Initial Load
  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setSelectedRole(editingUser.role);
      setSelectedDivisionId(editingUser.divisionId?.toString() || "");
      setPermissions(editingUser.permissions || []);
    } else {
      setName("");
      setEmail("");
      setSelectedRole("Staff");
      setSelectedDivisionId(divisions[0]?.id.toString() || "");
      // Initialize with default permissions for Staff
      setPermissions(ROLE_DEFAULT_PERMISSIONS["Staff"] || []);
    }
  }, [editingUser, divisions]);

  // Automatic Permission Update on Role Change
  useEffect(() => {
    let shouldReset = false;
    if (!editingUser) {
      shouldReset = true;
    } else {
      if (selectedRole !== editingUser.role) {
        shouldReset = true;
      }
    }

    if (shouldReset) {
      const defaults = ROLE_DEFAULT_PERMISSIONS[selectedRole] || [];
      setPermissions(defaults);
    }
  }, [selectedRole, editingUser]);

  useEffect(() => {
    if (selectedRole === "Admin Logistik" && inventoryDivisionId) {
      setSelectedDivisionId(inventoryDivisionId);
    }
  }, [selectedRole, inventoryDivisionId]);

  const handleDivisionChange = (divisionId: string) => {
    if (divisionId !== inventoryDivisionId && selectedRole === "Admin Logistik") {
      setSelectedRole("Staff");
    }
    setSelectedDivisionId(divisionId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      addNotification("Nama dan Email wajib diisi.", "error");
      return;
    }
    setIsSubmitting(true);

    // SECURITY: Sanitize permissions one last time before saving.
    // This prevents restricted permissions from being saved if the role was changed
    // but the permissions state still held old values.
    const cleanPermissions = sanitizePermissions(permissions, selectedRole);

    const userData = {
      name,
      email,
      role: selectedRole,
      divisionId: selectedRole === "Super Admin" ? null : parseInt(selectedDivisionId),
      permissions: cleanPermissions,
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        addNotification("Akun berhasil diperbarui.", "success");
      } else {
        await addUser(userData);
        addNotification("Akun baru berhasil ditambahkan.", "success");
      }
      onCancel(); // Navigate back
    } catch (error: unknown) {
      // Handle specific error messages from backend
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Terjadi kesalahan saat menyimpan data.";
      addNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if submit should be disabled due to role limit
  const isRoleLimitExceeded =
    roleWarning?.includes("Batas maksimal") && (editingUser?.role !== selectedRole || !editingUser);

  return (
    <FormPageLayout
      title={editingUser ? "Edit Akun Pengguna" : "Tambah Akun Pengguna Baru"}
      actions={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Batal
          </button>
          {!isSuperAdminAccount && (
            <button
              type="submit"
              form="user-form"
              disabled={isSubmitting || isRoleLimitExceeded}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
              {editingUser ? "Simpan Perubahan" : "Simpan Akun"}
            </button>
          )}
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="mx-auto space-y-8">
        {isSuperAdminAccount && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200">
            <LockIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Akun Terproteksi.</strong> Peran dan hak akses akun Super Admin tidak dapat
              diubah untuk mencegah penguncian sistem secara tidak sengaja.
            </div>
          </div>
        )}

        {/* Info Password Standar untuk Akun Baru */}
        {!editingUser && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200">
            <BsInfoCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong className="block mb-1">Informasi Password Awal</strong>
              <p>
                Akun baru akan menggunakan password standar:{" "}
                <code className="font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-600 select-all">
                  {DEFAULT_PASSWORD}
                </code>
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-300">
                <BsShieldLock className="w-3.5 h-3.5" />
                Pengguna <strong>wajib mengganti password</strong> saat pertama kali login untuk
                keamanan.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nama Lengkap
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSuperAdminAccount}
                required
                className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-200 disabled:text-gray-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSuperAdminAccount}
                required
                className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-200 disabled:text-gray-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Role
            </label>
            <div className="mt-1">
              <CustomSelect
                options={userRoles.map((r) => ({ value: r, label: r }))}
                value={selectedRole}
                onChange={(value) => setSelectedRole(value as UserRole)}
                disabled={isSuperAdminAccount}
              />
            </div>
            {selectedRole === "Admin Logistik" && !roleWarning && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Role Admin Logistik hanya berlaku untuk Divisi Logistik.
              </p>
            )}
            {/* Role Limit Warning */}
            {roleWarning && (
              <div
                className={`mt-2 p-2.5 rounded-lg flex items-start gap-2 text-sm ${
                  roleWarning.includes("Batas maksimal")
                    ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                }`}
              >
                <BsExclamationTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{roleWarning}</span>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="division"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Divisi
            </label>
            <div className="mt-1">
              <CustomSelect
                options={
                  selectedRole === "Super Admin"
                    ? [{ value: "", label: "N/A" }]
                    : divisions.map((d) => ({
                        value: d.id.toString(),
                        label: d.name,
                      }))
                }
                value={selectedDivisionId}
                onChange={handleDivisionChange}
                disabled={
                  selectedRole === "Super Admin" ||
                  selectedRole === "Admin Logistik" ||
                  isSuperAdminAccount
                }
                placeholder="Pilih Divisi"
              />
            </div>
          </div>
        </div>

        {canManagePermissions && (
          <div className="pt-6 border-t dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <LockIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Manajemen Hak Akses (Permissions)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hak akses bertanda kunci wajib dimiliki oleh role ini.
                  </p>
                </div>
              </div>
            </div>
            <PermissionManager
              currentPermissions={permissions}
              onChange={setPermissions}
              selectedRole={selectedRole}
              disabled={isSuperAdminAccount}
            />
          </div>
        )}
      </form>
    </FormPageLayout>
  );
};

export default UserFormPage;
