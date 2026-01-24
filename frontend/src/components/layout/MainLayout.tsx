import React, { useState, useEffect, useRef } from "react";
import { User, Page, PreviewData } from "../../types";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "../ui/NotificationBell";
import { MenuIcon } from "../icons/MenuIcon";
import { QrCodeIcon } from "../icons/QrCodeIcon";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { UserCogIcon } from "../icons/UserCogIcon";
import { LogoutIcon } from "../icons/LogoutIcon";
import { CommandPalette } from "../ui/CommandPalette";
import { GlobalScannerModal } from "../ui/GlobalScannerModal";
import { TopLoadingBar } from "../ui/TopLoadingBar";
import { ContentSkeleton } from "../ui/ContentSkeleton";
import PreviewModal from "../../features/preview/PreviewModal";
import { WhatsAppSimulationModal } from "../ui/WhatsAppSimulationModal";
import { cn } from "../../utils/cn";

// Stores
import { useUIStore } from "../../stores/useUIStore";

interface MainLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  // Global Actions passed down for Header/Sidebar
  setActivePage: (page: Page, filters?: any) => void;
  onShowPreview: (data: PreviewData) => void;
  // Scanner Actions
  onOpenScanner: () => void;
  // Modal States
  isGlobalScannerOpen: boolean;
  setIsGlobalScannerOpen: (open: boolean) => void;
  onScanSuccess: (data: any) => void;
  previewData: PreviewData | null;
  setPreviewData: (data: PreviewData | null) => void;
  // Action callbacks for Preview Modal
  previewActions: {
    onInitiateHandover: (asset: any) => void;
    onInitiateDismantle: (asset: any) => void;
    onInitiateInstallation: (asset: any) => void;
    onReportDamage: () => void;
    onStartRepair: () => void;
    onMarkAsRepaired: () => void;
    onDecommission: () => void;
    onReceiveFromRepair: () => void;
    onToggleVisibility?: () => void;
    onAddProgressUpdate: () => void;
    onEditItem: (data: any) => void;
  };
}

const getRoleClass = (role: User["role"]) => {
  switch (role) {
    case "Super Admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "Admin Logistik":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300";
    case "Admin Purchase":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
    case "Leader":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  }
};

const getRoleGradient = (role: User["role"]) => {
  switch (role) {
    case "Super Admin":
      return "from-purple-500 to-purple-600";
    case "Admin Logistik":
      return "from-sky-500 to-sky-600";
    case "Admin Purchase":
      return "from-teal-500 to-teal-600";
    case "Leader":
      return "from-indigo-500 to-indigo-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentUser,
  onLogout,
  setActivePage,
  onShowPreview,
  onOpenScanner,
  isGlobalScannerOpen,
  setIsGlobalScannerOpen,
  onScanSuccess,
  previewData,
  setPreviewData,
  previewActions,
}) => {
  // UI Store
  const activePage = useUIStore((state) => state.activePage);
  const isPageLoading = useUIStore((state) => state.isPageLoading);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.toggleSidebar);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const theme = useUIStore((state) => state.theme);

  const isDark = theme === "dark";

  // Local UI State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Apply theme on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Calculate sidebar margin - desktop only
  const sidebarMargin = sidebarCollapsed ? "lg:ml-20" : "lg:ml-72";

  return (
    <div
      className={cn(
        "min-h-screen flex font-sans transition-colors duration-300",
        isDark ? "bg-slate-950 text-slate-200" : "bg-gray-50 text-slate-800"
      )}
    >
      {/* Top Progress Bar */}
      <TopLoadingBar isLoading={isPageLoading} />

      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div
        className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300", sidebarMargin)}
      >
        {/* Header */}
        <header
          className={cn(
            "sticky top-0 z-40 flex items-center justify-between w-full h-16 px-6 no-print border-b shadow-sm backdrop-blur-md transition-colors duration-300",
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200/60"
          )}
        >
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors",
                isDark
                  ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className={cn(
                "hidden md:flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-all shadow-sm group",
                isDark
                  ? "text-slate-400 bg-slate-800/50 border-slate-700 hover:text-slate-200 hover:border-slate-600"
                  : "text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600 hover:border-slate-300"
              )}
            >
              <span
                className={cn(isDark ? "group-hover:text-slate-200" : "group-hover:text-slate-800")}
              >
                Cari...
              </span>
              <kbd
                className={cn(
                  "px-1.5 py-0.5 text-[10px] font-bold border rounded-md shadow-sm",
                  isDark
                    ? "text-slate-500 bg-slate-900 border-slate-700"
                    : "text-slate-400 bg-white border-slate-200"
                )}
              >
                ⌘K
              </kbd>
            </button>

            <div className={cn("h-6 w-px", isDark ? "bg-slate-700" : "bg-slate-200")} />

            {/* Notification Bell */}
            <NotificationBell
              currentUser={currentUser}
              setActivePage={setActivePage}
              onShowPreview={onShowPreview}
            />

            {/* QR Scanner */}
            <button
              onClick={onOpenScanner}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark
                  ? "text-slate-400 hover:bg-slate-800 hover:text-primary-400"
                  : "text-slate-500 hover:bg-slate-100 hover:text-primary-600"
              )}
              title="Pindai QR Aset"
            >
              <QrCodeIcon className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative pl-2" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-3 p-1 pr-3 rounded-full transition-all border",
                  isDark
                    ? "border-transparent hover:bg-slate-800 hover:border-slate-700"
                    : "border-transparent hover:bg-slate-100 hover:border-slate-200",
                  isProfileDropdownOpen && (isDark ? "bg-slate-800" : "bg-slate-100")
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md bg-gradient-to-br",
                    getRoleGradient(currentUser.role)
                  )}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-right hidden sm:block">
                  <span
                    className={cn(
                      "block text-sm font-bold leading-none",
                      isDark ? "text-slate-200" : "text-slate-700"
                    )}
                  >
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <span
                    className={cn(
                      "block text-[10px] font-medium uppercase tracking-wider mt-0.5",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDownIcon
                  className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    isDark ? "text-slate-500" : "text-slate-400",
                    isProfileDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div
                  className={cn(
                    "absolute right-0 z-50 w-56 mt-3 origin-top-right rounded-xl shadow-xl animate-zoom-in ring-1 ring-black/5 focus:outline-none overflow-hidden border",
                    isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                  )}
                >
                  <div className="p-1.5">
                    {/* Mobile User Info */}
                    <div
                      className={cn(
                        "px-3 py-3 mb-1 border-b sm:hidden",
                        isDark ? "border-slate-700" : "border-slate-50"
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm font-bold",
                          isDark ? "text-slate-200" : "text-slate-800"
                        )}
                      >
                        {currentUser.name}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                        {currentUser.role}
                      </p>
                    </div>

                    {/* Kelola Akun */}
                    <button
                      onClick={() => {
                        setActivePage("pengaturan-akun");
                        setIsProfileDropdownOpen(false);
                      }}
                      className={cn(
                        "flex items-center w-full gap-3 px-3 py-2.5 text-sm text-left rounded-lg transition-colors font-medium",
                        isDark
                          ? "text-slate-300 hover:bg-slate-700 hover:text-primary-400"
                          : "text-slate-700 hover:bg-slate-50 hover:text-primary-600"
                      )}
                    >
                      <UserCogIcon className="w-4 h-4" />
                      <span>Kelola Akun</span>
                    </button>

                    <div
                      className={cn(
                        "my-1 border-t",
                        isDark ? "border-slate-700" : "border-slate-50"
                      )}
                    />

                    {/* Logout */}
                    <button
                      onClick={onLogout}
                      className={cn(
                        "flex items-center w-full gap-3 px-3 py-2.5 text-sm text-left rounded-lg transition-colors font-medium",
                        isDark ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50"
                      )}
                    >
                      <LogoutIcon className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Scroll Area */}
        <main
          className={cn(
            "flex-1 overflow-x-hidden overflow-y-auto relative transition-colors duration-300",
            isDark ? "bg-slate-950" : "bg-gray-50"
          )}
        >
          {isPageLoading ? <ContentSkeleton /> : children}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalScannerModal
        isOpen={isGlobalScannerOpen}
        onClose={() => setIsGlobalScannerOpen(false)}
        onScanSuccess={onScanSuccess}
      />

      <WhatsAppSimulationModal />

      <PreviewModal
        currentUser={currentUser}
        previewData={previewData}
        onClose={() => setPreviewData(null)}
        onShowPreview={onShowPreview}
        onEditItem={previewActions.onEditItem}
        onInitiateHandover={previewActions.onInitiateHandover}
        onInitiateDismantle={previewActions.onInitiateDismantle}
        onInitiateInstallation={previewActions.onInitiateInstallation}
        onReportDamage={previewActions.onReportDamage}
        onStartRepair={previewActions.onStartRepair}
        onMarkAsRepaired={previewActions.onMarkAsRepaired}
        onDecommission={previewActions.onDecommission}
        onReceiveFromRepair={previewActions.onReceiveFromRepair}
        onAddProgressUpdate={previewActions.onAddProgressUpdate}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActivePage}
        onShowPreview={onShowPreview}
      />
    </div>
  );
};

// Export untuk backwards compatibility
export { MainLayout as MainLayoutNew };
