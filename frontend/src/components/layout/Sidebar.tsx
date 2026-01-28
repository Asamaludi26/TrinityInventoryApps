import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import { Page, User, Permission } from "../../types";
import { hasPermission } from "../../utils/permissions";
import { CloseIcon } from "../icons/CloseIcon";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { ChevronLeftIcon } from "../icons/ChevronLeftIcon";
import { ChevronRightIcon } from "../icons/ChevronRightIcon";
import { TrinitiLogoIcon } from "../icons/TrinitiLogoIcon";
import { LogoutIcon } from "../icons/LogoutIcon";

// Zustand Imports
import { useUIStore } from "../../stores/useUIStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { cn } from "../../utils/cn";

// ============================================================================
// Theme Context
// ============================================================================
type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ============================================================================
// SVG Icons - Modern Lucide-style
// ============================================================================
const icons = {
  dashboard: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  asset: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  register: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  box: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  request: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  handover: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m18 8 4 4-4 4" />
      <path d="M2 12h20" />
      <path d="m6 16-4-4 4-4" />
    </svg>
  ),
  repair: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  customer: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </svg>
  ),
  users: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  install: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  dismantle: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  settings: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  userCog: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="18" cy="15" r="3" />
      <circle cx="9" cy="7" r="4" />
      <path d="M10 15H6a4 4 0 0 0-4 4v2" />
      <path d="m21.7 16.4-.9-.3" />
      <path d="m15.2 13.9-.9-.3" />
      <path d="m16.6 18.7.3-.9" />
      <path d="m19.1 12.2.3-.9" />
      <path d="m19.6 18.7-.4-1" />
      <path d="m16.8 12.3-.4-1" />
      <path d="m14.3 16.6 1-.4" />
      <path d="m20.7 13.8 1-.4" />
    </svg>
  ),
  category: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2H2v10h10V2Z" />
      <path d="M22 12h-10v10h10V12Z" />
      <path d="M12 12H2v10h10V12Z" />
      <path d="M22 2h-10v10h10V2Z" />
    </svg>
  ),
  loan: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  ),
  maintenance: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  sun: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  moon: (props: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
};

// ============================================================================
// Types
// ============================================================================
interface SidebarProps {
  currentUser: User;
  activePage: Page;
  setActivePage: (page: Page, filters?: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  permission?: Permission;
  children?: MenuItem[];
  page?: Page;
  filter?: Record<string, any>;
};

// ============================================================================
// Menu Items Configuration
// ============================================================================
const allMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: icons.dashboard,
    permission: "dashboard:view",
  },
  {
    id: "assetManagement",
    label: "Pusat Aset",
    icon: icons.asset,
    permission: "assets:view",
    children: [
      {
        id: "registration",
        label: "Catat Aset",
        icon: icons.register,
        permission: "assets:create",
      },
      { id: "stock", label: "Stok Aset", icon: icons.box, permission: "assets:view" },
      {
        id: "request-parent",
        label: "Request Aset",
        icon: icons.request,
        children: [
          {
            id: "request-new",
            page: "request",
            label: "Request Baru",
            icon: icons.request,
            permission: "requests:view:own",
          },
          {
            id: "request-loan",
            page: "request-pinjam",
            label: "Request Pinjam",
            icon: icons.loan,
            permission: "loan-requests:view:own",
          },
        ],
      },
      {
        id: "handover",
        label: "Handover Aset",
        icon: icons.handover,
        permission: "assets:handover",
      },
      {
        id: "repair",
        label: "Perbaikan Aset",
        icon: icons.repair,
        permission: "assets:repair:manage",
      },
    ],
  },
  {
    id: "customerManagement",
    label: "Manajemen Pelanggan",
    icon: icons.customer,
    permission: "customers:view",
    children: [
      {
        id: "customers",
        label: "Daftar Pelanggan",
        icon: icons.users,
        permission: "customers:view",
      },
      {
        id: "customer-installation-form",
        page: "customer-installation-form",
        label: "Manajemen Instalasi",
        icon: icons.install,
        permission: "assets:install",
      },
      {
        id: "customer-maintenance-form",
        page: "customer-maintenance-form",
        label: "Manajemen Maintenance",
        icon: icons.maintenance,
        permission: "maintenances:view",
      },
      {
        id: "customer-dismantle",
        page: "customer-dismantle",
        label: "Data Dismantle",
        icon: icons.dismantle,
        permission: "assets:dismantle",
      },
    ],
  },
  {
    id: "settings",
    label: "Pengaturan",
    icon: icons.settings,
    children: [
      {
        id: "settings-akun",
        page: "pengaturan-akun",
        label: "Kelola Akun",
        icon: icons.userCog,
        permission: "account:manage",
      },
      {
        id: "settings-pengguna",
        page: "pengaturan-pengguna",
        label: "Akun & Divisi",
        icon: icons.users,
        permission: "users:view",
      },
      {
        id: "settings-kategori",
        page: "kategori",
        label: "Kategori & Model",
        icon: icons.category,
        permission: "categories:view",
      },
    ],
  },
];

// ============================================================================
// Main Sidebar Component
// ============================================================================
export const Sidebar: React.FC<SidebarProps> = ({
  currentUser: propUser,
  activePage: propActivePage,
  setActivePage: propSetActivePage,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
}) => {
  // Zustand Integration
  const storeActivePage = useUIStore((state) => state.activePage);
  const storeSetActivePage = useUIStore((state) => state.setActivePage);
  const storeSidebarOpen = useUIStore((state) => state.sidebarOpen);
  const storeToggleSidebar = useUIStore((state) => state.toggleSidebar);
  const storeSidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const storeToggleSidebarCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const storeTheme = useUIStore((state) => state.theme);
  const storeToggleTheme = useUIStore((state) => state.toggleTheme);
  const storeUser = useAuthStore((state) => state.currentUser);
  const storeLogout = useAuthStore((state) => state.logout);

  const activePage = storeActivePage;
  const currentUser = storeUser || propUser;
  const isOpen = storeSidebarOpen;
  const isCollapsed = storeSidebarCollapsed;
  const theme = storeTheme;
  const isDark = theme === "dark";

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {};
    allMenuItems.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some(
          (child) =>
            (child.page || child.id) === activePage ||
            child.children?.some((gc) => (gc.page || gc.id) === activePage)
        );
        if (isActive) {
          newOpenMenus[item.id] = true;
          item.children.forEach((child) => {
            if (child.children?.some((gc) => (gc.page || gc.id) === activePage)) {
              newOpenMenus[child.id] = true;
            }
          });
        }
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
  }, [activePage]);

  const menuItems = useMemo(() => {
    const filterVisibleItems = (items: MenuItem[]): MenuItem[] => {
      return items.reduce((acc: MenuItem[], item) => {
        if (item.permission && !hasPermission(currentUser, item.permission)) return acc;
        if (item.children && item.children.length > 0) {
          const visibleChildren = filterVisibleItems(item.children);
          if (visibleChildren.length === 0 && !item.page) return acc;
          return [
            ...acc,
            { ...item, children: visibleChildren.length > 0 ? visibleChildren : undefined },
          ];
        }
        return [...acc, item];
      }, []);
    };
    return filterVisibleItems(allMenuItems);
  }, [currentUser]);

  const handleSetActivePage = (page: Page, filters?: any) => {
    storeSetActivePage(page, filters);
    propSetActivePage(page, filters);
  };

  const handleSetIsOpen = (val: boolean) => {
    storeToggleSidebar(val);
    propSetIsOpen(val);
  };

  const handleNavClick = (page: Page, filters?: Record<string, any>) => {
    handleSetActivePage(page, filters);
    setActiveTooltip(null);
    if (window.innerWidth < 1024) handleSetIsOpen(false);
  };

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRoleGradient = (role: string) => {
    const gradients: Record<string, string> = {
      "Super Admin": "from-violet-500 to-purple-600",
      "Admin Logistik": "from-sky-400 to-blue-500",
      "Admin Purchase": "from-emerald-400 to-teal-500",
      Leader: "from-indigo-400 to-blue-500",
      Staff: "from-slate-400 to-gray-500",
      Teknisi: "from-orange-400 to-amber-500",
    };
    return gradients[role] || "from-slate-400 to-gray-500";
  };

  const isMenuActive = (item: MenuItem): boolean => activePage === (item.page || item.id);
  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.children) return false;
    return item.children.some(
      (child) =>
        isMenuActive(child) || (child.children && child.children.some((gc) => isMenuActive(gc)))
    );
  };

  // Collapsed menu item with click-to-open flyout
  const renderCollapsedMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isMenuActive(item);
    const isParentActive = hasActiveChild(item);
    const isTooltipOpen = activeTooltip === item.id;

    if (hasChildren) {
      return (
        <div key={item.id} className="relative group/menu">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTooltip(isTooltipOpen ? null : item.id);
            }}
            className={cn(
              "relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 mx-auto cursor-pointer",
              isParentActive
                ? isDark
                  ? "bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30"
                  : "bg-primary-50 text-primary-600 ring-1 ring-primary-200"
                : isDark
                  ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <item.icon className="w-5 h-5 pointer-events-none" />
            {isParentActive && (
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full pointer-events-none",
                  isDark ? "bg-primary-400" : "bg-primary-600"
                )}
              />
            )}
            {/* Expand indicator */}
            <ChevronRightIcon
              className={cn(
                "absolute right-0.5 top-1/2 -translate-y-1/2 w-3 h-3 transition-transform pointer-events-none",
                isTooltipOpen && "rotate-90",
                isDark ? "text-slate-600" : "text-gray-400"
              )}
            />
          </button>

          {/* Flyout Panel - Higher z-index to ensure clickability */}
          {isTooltipOpen && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTooltip(null);
                }}
              />
              <div
                className={cn(
                  "absolute left-full top-0 ml-3 z-[70] min-w-[240px] rounded-xl shadow-2xl border overflow-hidden animate-scale-in",
                  isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-3 border-b",
                    isDark ? "border-slate-700 bg-slate-900/50" : "border-gray-100 bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      isDark ? "text-slate-400" : "text-gray-500"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="p-2 max-h-80 overflow-y-auto">
                  {item.children?.map((child) => {
                    if (child.children && child.children.length > 0) {
                      return (
                        <div key={child.id} className="mb-2">
                          <div
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
                              isDark ? "text-slate-500" : "text-gray-400"
                            )}
                          >
                            {child.label}
                          </div>
                          {child.children.map((gc) => (
                            <button
                              key={gc.id}
                              onClick={() => handleNavClick((gc.page || gc.id) as Page, gc.filter)}
                              className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                isMenuActive(gc)
                                  ? isDark
                                    ? "bg-primary-500/20 text-primary-300"
                                    : "bg-primary-50 text-primary-700"
                                  : isDark
                                    ? "text-slate-300 hover:bg-slate-700 hover:text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              )}
                            >
                              <gc.icon className="w-4 h-4 flex-shrink-0" />
                              <span>{gc.label}</span>
                            </button>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={child.id}
                        onClick={() =>
                          handleNavClick((child.page || child.id) as Page, child.filter)
                        }
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isMenuActive(child)
                            ? isDark
                              ? "bg-primary-500/20 text-primary-300"
                              : "bg-primary-50 text-primary-700"
                            : isDark
                              ? "text-slate-300 hover:bg-slate-700 hover:text-white"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <child.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // Single item with improved tooltip
    return (
      <div key={item.id} className="relative group/single">
        <button
          onClick={() => handleNavClick((item.page || item.id) as Page)}
          className={cn(
            "relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 mx-auto cursor-pointer",
            isActive
              ? isDark
                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                : "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
              : isDark
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          )}
        >
          <item.icon className="w-5 h-5 pointer-events-none" />
        </button>
        {/* Enhanced Tooltip with arrow */}
        <div
          className={cn(
            "absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap",
            "opacity-0 invisible group-hover/single:opacity-100 group-hover/single:visible",
            "transform translate-x-1 group-hover/single:translate-x-0",
            "transition-all duration-200 ease-out z-[70] pointer-events-none",
            "shadow-lg border",
            isDark
              ? "bg-slate-800 text-white border-slate-700 shadow-slate-900/50"
              : "bg-white text-gray-900 border-gray-200 shadow-gray-200/80"
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              "absolute right-full top-1/2 -translate-y-1/2 w-0 h-0",
              "border-y-[6px] border-y-transparent border-r-[6px]",
              isDark ? "border-r-slate-800" : "border-r-white"
            )}
          />
          {item.label}
        </div>
      </div>
    );
  };

  // Expanded menu item
  const renderExpandedMenuItem = (item: MenuItem, level = 0) => {
    const isActive = isMenuActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = openMenus[item.id];
    const isParentActive = hasActiveChild(item);

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={cn(
              "flex items-center justify-between w-full rounded-xl text-sm font-medium transition-all duration-200 group",
              level === 0 ? "px-4 py-3" : "px-4 py-2.5 pl-11",
              isParentActive
                ? isDark
                  ? "text-white bg-slate-800/80"
                  : "text-gray-900 bg-gray-100"
                : isDark
                  ? "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={cn(
                  "transition-colors",
                  level === 0 ? "w-5 h-5" : "w-4 h-4",
                  isParentActive
                    ? isDark
                      ? "text-primary-400"
                      : "text-primary-600"
                    : isDark
                      ? "text-slate-500 group-hover:text-slate-300"
                      : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span>{item.label}</span>
            </div>
            <ChevronDownIcon
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isExpanded && "rotate-180",
                isDark ? "text-slate-500" : "text-gray-400"
              )}
            />
          </button>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderExpandedMenuItem(child, level + 1))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => handleNavClick((item.page || item.id) as Page, item.filter)}
        className={cn(
          "relative flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-all duration-200",
          level === 0 ? "px-4 py-3" : "px-4 py-2.5 pl-11",
          isActive
            ? isDark
              ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25"
              : "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25"
            : isDark
              ? "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <item.icon
          className={cn(
            "flex-shrink-0 transition-colors",
            level === 0 ? "w-5 h-5" : "w-4 h-4",
            isActive ? "text-white" : ""
          )}
        />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-[280px]";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: storeToggleTheme }}>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 lg:hidden no-print",
          isDark ? "bg-black/70 backdrop-blur-sm" : "bg-gray-900/50 backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => handleSetIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-out no-print",
          sidebarWidth,
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isDark
            ? "bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-r border-slate-800/60"
            : "bg-white border-r border-gray-200",
          "shadow-2xl"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b flex-shrink-0",
            isDark ? "border-slate-800/60" : "border-gray-200",
            isCollapsed ? "justify-center px-2" : "justify-between"
          )}
        >
          <div className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-3")}>
            <div
              className={cn(
                "flex items-center justify-center rounded-xl transition-all",
                isCollapsed ? "w-10 h-10" : "w-10 h-10",
                isDark ? "bg-primary-500/10" : "bg-primary-50"
              )}
            >
              <TrinitiLogoIcon
                className={cn("w-6 h-6", isDark ? "text-primary-400" : "text-primary-600")}
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-lg font-bold tracking-tight",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Triniti
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest -mt-0.5",
                    isDark ? "text-slate-500" : "text-gray-400"
                  )}
                >
                  Asset Flow
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle - Integrated in header */}
          <button
            onClick={() => storeToggleSidebarCollapsed()}
            className={cn(
              "hidden lg:flex items-center justify-center transition-all duration-200",
              "w-8 h-8 rounded-lg",
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            )}
            title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          >
            <div
              className={cn(
                "transition-transform duration-300",
                isCollapsed ? "rotate-180" : "rotate-0"
              )}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </div>
          </button>

          {/* Mobile Close Button */}
          {!isCollapsed && (
            <button
              onClick={() => handleSetIsOpen(false)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors",
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin",
            isCollapsed ? "px-2 space-y-2" : "px-3 space-y-1",
            isDark
              ? "scrollbar-thumb-slate-700 scrollbar-track-transparent"
              : "scrollbar-thumb-gray-300 scrollbar-track-transparent"
          )}
        >
          {isCollapsed
            ? menuItems.map((item) => renderCollapsedMenuItem(item))
            : menuItems.map((item) => renderExpandedMenuItem(item))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "flex-shrink-0 p-3 space-y-3 border-t",
            isDark ? "border-slate-800/60" : "border-gray-200"
          )}
        >
          {/* Theme Toggle */}
          <div
            className={cn(
              "flex items-center rounded-xl transition-all duration-200",
              isCollapsed ? "justify-center py-2" : "gap-3 px-3 py-2.5",
              isDark ? "bg-slate-800/60" : "bg-gray-100"
            )}
          >
            {!isCollapsed && (
              <>
                <icons.sun
                  className={cn("w-4 h-4", !isDark ? "text-amber-500" : "text-slate-500")}
                />
                <span
                  className={cn(
                    "text-xs font-medium flex-1",
                    isDark ? "text-slate-400" : "text-gray-600"
                  )}
                >
                  {isDark ? "Mode Gelap" : "Mode Terang"}
                </span>
              </>
            )}
            <button
              onClick={storeToggleTheme}
              className={cn(
                "relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                isCollapsed
                  ? cn(
                      "w-10 h-10 flex items-center justify-center rounded-lg",
                      isDark
                        ? "hover:bg-slate-700 focus:ring-primary-500 focus:ring-offset-slate-900"
                        : "hover:bg-gray-200 focus:ring-primary-500 focus:ring-offset-white"
                    )
                  : cn(
                      "w-11 h-6 rounded-full",
                      isDark
                        ? "bg-primary-600 focus:ring-primary-500 focus:ring-offset-slate-900"
                        : "bg-gray-300 focus:ring-primary-500 focus:ring-offset-white"
                    )
              )}
            >
              {isCollapsed ? (
                isDark ? (
                  <icons.moon className="w-5 h-5 text-primary-400" />
                ) : (
                  <icons.sun className="w-5 h-5 text-amber-500" />
                )
              ) : (
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300",
                    isDark && "translate-x-5"
                  )}
                />
              )}
            </button>
          </div>

          {/* User Profile */}
          <div
            className={cn(
              "flex items-center rounded-xl transition-all",
              isCollapsed ? "flex-col gap-2 py-3" : "gap-3 p-3",
              isDark ? "bg-slate-800/60" : "bg-gray-100"
            )}
          >
            <div
              className={cn(
                "rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0",
                isCollapsed ? "w-10 h-10 text-xs" : "w-11 h-11 text-sm",
                getRoleGradient(currentUser.role)
              )}
            >
              {getInitials(currentUser.name)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold truncate",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {currentUser.name}
                </p>
                <p className={cn("text-xs truncate", isDark ? "text-slate-400" : "text-gray-500")}>
                  {currentUser.role}
                </p>
              </div>
            )}
            <button
              onClick={storeLogout}
              className={cn(
                "rounded-lg transition-all p-2 flex-shrink-0",
                isDark
                  ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  : "text-gray-500 hover:text-red-600 hover:bg-red-50"
              )}
              title="Keluar"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Version */}
          {!isCollapsed && (
            <p
              className={cn(
                "text-[10px] text-center font-medium",
                isDark ? "text-slate-600" : "text-gray-400"
              )}
            >
              © 2026 Triniti Media Indonesia • v1.3.0
            </p>
          )}
        </div>
      </aside>
    </ThemeContext.Provider>
  );
};
