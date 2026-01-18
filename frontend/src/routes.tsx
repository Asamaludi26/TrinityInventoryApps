/**
 * Application Routes Configuration
 *
 * Centralized route definitions for React Router.
 * All routes are lazy-loaded for optimal performance.
 */

import { lazy, Suspense, ComponentType } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import { PageSkeleton } from "./components/ui/PageSkeleton";

// Lazy load all page components
const LoginPage = lazy(() => import("./features/auth/LoginPage"));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const RegistrationPage = lazy(
  () => import("./features/assetRegistration/RegistrationPage"),
);
const HandoverPage = lazy(() => import("./features/handover/HandoverPage"));
const RepairManagementPage = lazy(
  () => import("./features/repair/RepairManagementPage"),
);
const CustomerManagementPage = lazy(
  () => import("./features/customers/CustomerManagementPage"),
);
const AccountsPage = lazy(() =>
  import("./features/users/AccountsPage").then((m) => ({
    default: m.AccountsPage,
  })),
);
const CategoryManagementPage = lazy(
  () => import("./features/categories/CategoryManagementPage"),
);
const ManageAccountPage = lazy(
  () => import("./features/users/ManageAccountPage"),
);
const UserFormPage = lazy(() => import("./features/users/UserFormPage"));
const DivisionFormPage = lazy(
  () => import("./features/users/DivisionFormPage"),
);
const UserDetailPage = lazy(() => import("./features/users/UserDetailPage"));
const DivisionDetailPage = lazy(
  () => import("./features/users/DivisionDetailPage"),
);
const StockOverviewPage = lazy(
  () => import("./features/stock/StockOverviewPage"),
);
const PermissionDeniedPage = lazy(
  () => import("./features/auth/PermissionDeniedPage"),
);
const RequestHubPage = lazy(() => import("./features/requests/RequestHubPage"));
const ReturnAssetFormPage = lazy(
  () => import("./features/requests/loan/ReturnAssetFormPage"),
);
const ReturnRequestDetailPage = lazy(
  () => import("./features/requests/loan/ReturnRequestDetailPage"),
);

// Lazy wrapper with skeleton fallback
function LazyPage({ Component }: { Component: ComponentType<any> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

// Route path constants
export const ROUTES = {
  // Auth
  LOGIN: "/login",

  // Main
  DASHBOARD: "/",

  // Requests
  REQUESTS: "/requests",
  REQUESTS_PURCHASE: "/requests/purchase",
  REQUESTS_LOAN: "/requests/loan",
  RETURN_FORM: "/requests/loan/:loanId/return",
  RETURN_DETAIL: "/requests/return/:returnId",

  // Assets
  REGISTRATION: "/assets",
  ASSET_NEW: "/assets/new",
  ASSET_EDIT: "/assets/:id/edit",

  // Transactions
  HANDOVER: "/handover",
  STOCK: "/stock",
  REPAIR: "/repair",

  // Customers
  CUSTOMERS: "/customers",
  CUSTOMER_NEW: "/customers/new",
  CUSTOMER_EDIT: "/customers/:id/edit",
  CUSTOMER_DETAIL: "/customers/:id",
  CUSTOMER_INSTALLATION: "/customers/:id/installation",
  CUSTOMER_MAINTENANCE: "/customers/:id/maintenance",
  CUSTOMER_DISMANTLE: "/customers/:id/dismantle",

  // User Management
  USERS: "/users",
  USER_NEW: "/users/new",
  USER_EDIT: "/users/:id/edit",
  USER_DETAIL: "/users/:id",

  // Divisions
  DIVISION_NEW: "/divisions/new",
  DIVISION_EDIT: "/divisions/:id/edit",
  DIVISION_DETAIL: "/divisions/:id",

  // Settings
  ACCOUNT_SETTINGS: "/settings/account",
  CATEGORIES: "/settings/categories",

  // Error
  PERMISSION_DENIED: "/403",
} as const;

// Helper to build dynamic routes
export const buildRoute = {
  assetEdit: (id: string) => `/assets/${id}/edit`,
  customerDetail: (id: string) => `/customers/${id}`,
  customerEdit: (id: string) => `/customers/${id}/edit`,
  customerInstallation: (id: string) => `/customers/${id}/installation`,
  customerMaintenance: (id: string) => `/customers/${id}/maintenance`,
  customerDismantle: (id: string) => `/customers/${id}/dismantle`,
  userDetail: (id: number) => `/users/${id}`,
  userEdit: (id: number) => `/users/${id}/edit`,
  divisionDetail: (id: number) => `/divisions/${id}`,
  divisionEdit: (id: number) => `/divisions/${id}/edit`,
  returnForm: (loanId: string) => `/requests/loan/${loanId}/return`,
  returnDetail: (returnId: string) => `/requests/return/${returnId}`,
};

// Public routes (no auth required)
export const publicRoutes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: <LazyPage Component={LoginPage} />,
  },
];

// Protected routes (auth required)
export const protectedRoutes: RouteObject[] = [
  // Dashboard
  {
    path: ROUTES.DASHBOARD,
    element: <LazyPage Component={DashboardPage} />,
  },

  // Requests
  {
    path: ROUTES.REQUESTS,
    element: <LazyPage Component={RequestHubPage} />,
  },
  {
    path: ROUTES.REQUESTS_PURCHASE,
    element: <LazyPage Component={RequestHubPage} />,
  },
  {
    path: ROUTES.REQUESTS_LOAN,
    element: <LazyPage Component={RequestHubPage} />,
  },
  {
    path: ROUTES.RETURN_FORM,
    element: <LazyPage Component={ReturnAssetFormPage} />,
  },
  {
    path: ROUTES.RETURN_DETAIL,
    element: <LazyPage Component={ReturnRequestDetailPage} />,
  },

  // Assets
  {
    path: ROUTES.REGISTRATION,
    element: <LazyPage Component={RegistrationPage} />,
  },
  {
    path: ROUTES.ASSET_NEW,
    element: <LazyPage Component={RegistrationPage} />,
  },
  {
    path: ROUTES.ASSET_EDIT,
    element: <LazyPage Component={RegistrationPage} />,
  },

  // Transactions
  {
    path: ROUTES.HANDOVER,
    element: <LazyPage Component={HandoverPage} />,
  },
  {
    path: ROUTES.STOCK,
    element: <LazyPage Component={StockOverviewPage} />,
  },
  {
    path: ROUTES.REPAIR,
    element: <LazyPage Component={RepairManagementPage} />,
  },

  // Customers
  {
    path: ROUTES.CUSTOMERS,
    element: <LazyPage Component={CustomerManagementPage} />,
  },
  {
    path: ROUTES.CUSTOMER_NEW,
    element: <LazyPage Component={CustomerManagementPage} />,
  },
  {
    path: ROUTES.CUSTOMER_EDIT,
    element: <LazyPage Component={CustomerManagementPage} />,
  },
  {
    path: ROUTES.CUSTOMER_DETAIL,
    element: <LazyPage Component={CustomerManagementPage} />,
  },
  {
    path: ROUTES.CUSTOMER_INSTALLATION,
    element: <LazyPage Component={CustomerManagementPage} />,
  },
  {
    path: ROUTES.CUSTOMER_MAINTENANCE,
    element: <LazyPage Component={CustomerManagementPage} />,
  },
  {
    path: ROUTES.CUSTOMER_DISMANTLE,
    element: <LazyPage Component={CustomerManagementPage} />,
  },

  // User Management
  {
    path: ROUTES.USERS,
    element: <LazyPage Component={AccountsPage} />,
  },
  {
    path: ROUTES.USER_NEW,
    element: <LazyPage Component={UserFormPage} />,
  },
  {
    path: ROUTES.USER_EDIT,
    element: <LazyPage Component={UserFormPage} />,
  },
  {
    path: ROUTES.USER_DETAIL,
    element: <LazyPage Component={UserDetailPage} />,
  },

  // Divisions
  {
    path: ROUTES.DIVISION_NEW,
    element: <LazyPage Component={DivisionFormPage} />,
  },
  {
    path: ROUTES.DIVISION_EDIT,
    element: <LazyPage Component={DivisionFormPage} />,
  },
  {
    path: ROUTES.DIVISION_DETAIL,
    element: <LazyPage Component={DivisionDetailPage} />,
  },

  // Settings
  {
    path: ROUTES.ACCOUNT_SETTINGS,
    element: <LazyPage Component={ManageAccountPage} />,
  },
  {
    path: ROUTES.CATEGORIES,
    element: <LazyPage Component={CategoryManagementPage} />,
  },

  // Error pages
  {
    path: ROUTES.PERMISSION_DENIED,
    element: <LazyPage Component={PermissionDeniedPage} />,
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
];

// Role-based route access
export const staffRestrictedPaths = [
  ROUTES.REGISTRATION,
  ROUTES.ASSET_NEW,
  ROUTES.REPAIR,
  ROUTES.CUSTOMERS,
  ROUTES.CUSTOMER_NEW,
  ROUTES.CUSTOMER_EDIT,
  ROUTES.USERS,
  ROUTES.USER_NEW,
  ROUTES.USER_EDIT,
  ROUTES.DIVISION_NEW,
  ROUTES.DIVISION_EDIT,
  ROUTES.CATEGORIES,
];
