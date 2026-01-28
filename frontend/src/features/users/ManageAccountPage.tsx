import React, { useState } from "react";
import { User } from "../../types";
import FormPageLayout from "../../components/layout/FormPageLayout";
import { useManageAccountLogic } from "./hooks/useManageAccountLogic";
import { ReloginSuccessModal } from "./components/ReloginSuccessModal";
import { AccountProfileTab } from "./components/AccountProfileTab";
import { AccountSecurityTab } from "./components/AccountSecurityTab";
import { useNotification } from "../../providers/NotificationProvider";
import { BsPersonFill, BsShieldLockFill } from "react-icons/bs";

// Stores for getting related data
import { useMasterDataStore } from "../../stores/useMasterDataStore";
import { useAssetStore } from "../../stores/useAssetStore";
import { useRequestStore } from "../../stores/useRequestStore";

type AccountTab = "profile" | "security";

interface ManageAccountPageProps {
  currentUser: User;
  onBack: () => void;
}

const ManageAccountPage: React.FC<ManageAccountPageProps> = ({ currentUser, onBack }) => {
  const addNotification = useNotification();

  // Tab state
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  // Store data
  const divisions = useMasterDataStore((state) => state.divisions);
  const assets = useAssetStore((state) => state.assets);
  const requests = useRequestStore((state) => state.requests);

  // Derived data
  const userDivision = divisions.find((d) => d.id === currentUser.divisionId);
  const userAssets = assets.filter((asset) => asset.currentUser === currentUser.name);
  const userRequests = requests.filter((req) => req.requester === currentUser.name);

  const {
    name,
    setName,
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordVisibility,
    setPasswordVisibility,
    isLoading,
    isRedirecting,
    showReloginModal,

    // Errors
    nameError,
    emailError,
    passwordError,

    // Password validation
    passwordValidation,
    passwordChecks,
    passwordStrength,
    allowedSymbols,

    // Computed
    canSubmit,

    // Actions
    handleSubmit,
    handleRelogin,
  } = useManageAccountLogic({ currentUser });

  // Handle save profile (for name/email edits)
  const handleSaveProfile = async () => {
    // Validate first
    if (nameError || emailError) {
      addNotification("Mohon perbaiki error pada form sebelum menyimpan.", "error");
      return;
    }
    // Trigger submit with only name/email changes (no password)
    const event = new Event("submit", { cancelable: true }) as unknown as React.FormEvent;
    await handleSubmit(event);
  };

  // Tab Button Component
  const TabButton: React.FC<{
    tab: AccountTab;
    icon: React.ReactNode;
    label: string;
  }> = ({ tab, icon, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
        activeTab === tab
          ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <FormPageLayout title="Kelola Akun Saya">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
          <nav className="flex -mb-px space-x-4">
            <TabButton
              tab="profile"
              icon={<BsPersonFill className="w-4 h-4" />}
              label="Profil Saya"
            />
            <TabButton
              tab="security"
              icon={<BsShieldLockFill className="w-4 h-4" />}
              label="Keamanan"
            />
          </nav>
        </div>

        {/* Profile Tab - New Enhanced Component */}
        {activeTab === "profile" && (
          <AccountProfileTab
            user={currentUser}
            division={userDivision}
            userAssets={userAssets}
            userRequests={userRequests}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            nameError={nameError}
            emailError={emailError}
            isLoading={isLoading}
            onSaveProfile={handleSaveProfile}
            onViewAssets={() => {
              addNotification("Lihat halaman Aset untuk detail lengkap", "info");
            }}
            onViewRequests={() => {
              addNotification("Lihat halaman Request untuk detail lengkap", "info");
            }}
          />
        )}

        {/* Security Tab - New Dedicated Component */}
        {activeTab === "security" && (
          <AccountSecurityTab
            currentUser={currentUser}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordVisibility={passwordVisibility}
            setPasswordVisibility={setPasswordVisibility}
            passwordValidation={passwordValidation}
            passwordChecks={passwordChecks}
            passwordStrength={passwordStrength}
            passwordError={passwordError}
            allowedSymbols={allowedSymbols}
            isLoading={isLoading}
            isRedirecting={isRedirecting}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
            onBack={onBack}
          />
        )}
      </FormPageLayout>

      {/* Modal Relogin Sukses */}
      <ReloginSuccessModal
        isOpen={showReloginModal}
        onRelogin={handleRelogin}
        isRedirecting={isRedirecting}
      />
    </>
  );
};

export default ManageAccountPage;
