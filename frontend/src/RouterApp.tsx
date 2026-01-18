/**
 * Router-based Application
 *
 * New application entry point using React Router for navigation.
 * This replaces the state-based navigation in the legacy App.tsx.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/useAuthStore";
import { useUIStore } from "./stores/useUIStore";
import { useAssetStore } from "./stores/useAssetStore";
import { useRequestStore } from "./stores/useRequestStore";
import { useTransactionStore } from "./stores/useTransactionStore";
import { useMasterDataStore } from "./stores/useMasterDataStore";
import { useNotificationStore } from "./stores/useNotificationStore";

// API
import { unifiedApi, UnifiedAppData } from "./services/api";

// Providers & Layout
import {
  NotificationProvider,
  useNotification,
} from "./providers/NotificationProvider";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { PageSkeleton } from "./components/ui/PageSkeleton";
import { FullPageLoader } from "./components/ui/FullPageLoader";

// Route definitions
import { ROUTES, buildRoute } from "./routes";

// Types
import type { PreviewData, Asset, Request, LoanRequest } from "./types";

// Lazy-loaded pages
import { lazy, Suspense } from "react";

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

// Page wrapper with suspense
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

/**
 * Main Application Content (when authenticated)
 */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser)!;
  const logout = useAuthStore((state) => state.logout);
  const addNotification = useNotification();

  // Data loading state
  const [isDataLoading, setIsDataLoading] = useState(true);
  const dataLoadedRef = useRef(false);

  // Global modal states
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [scanContext, setScanContext] = useState<"global" | "form">("global");
  const [formScanCallback, setFormScanCallback] = useState<
    ((data: any) => void) | null
  >(null);

  // Hydrate all stores from unified API response
  const hydrateStores = useCallback((data: UnifiedAppData) => {
    useAssetStore.setState({
      assets: data.assets,
      categories: data.categories,
      stockMovements: data.stockMovements,
      isLoading: false,
    });

    useRequestStore.setState({
      requests: data.requests,
      loanRequests: data.loanRequests,
      returns: data.returns,
      isLoading: false,
    });

    useTransactionStore.setState({
      handovers: data.handovers,
      installations: data.installations,
      maintenances: data.maintenances,
      dismantles: data.dismantles,
      isLoading: false,
    });

    useMasterDataStore.setState({
      users: data.users,
      divisions: data.divisions,
      customers: data.customers,
      isLoading: false,
    });

    useNotificationStore.setState({
      notifications: data.notifications,
      isLoading: false,
    });
  }, []);

  // Load initial data - SINGLE unified fetch
  useEffect(() => {
    if (dataLoadedRef.current) return;

    const loadAllData = async () => {
      dataLoadedRef.current = true;
      try {
        const data = await unifiedApi.fetchAllData();
        hydrateStores(data);
      } catch (error) {
        console.error("[AppContent] Failed to load data:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    loadAllData();
  }, [hydrateStores]);

  // Navigation helper - bridging legacy setActivePage to router
  const setActivePage = (page: string, initialState?: any) => {
    // Store initial state for components that need it
    useUIStore.getState().setActivePage(page as any, initialState);

    // Map legacy page names to routes
    const routeMap: Record<string, string> = {
      dashboard: ROUTES.DASHBOARD,
      request: ROUTES.REQUESTS,
      "request-pinjam": ROUTES.REQUESTS_LOAN,
      registration: ROUTES.REGISTRATION,
      handover: ROUTES.HANDOVER,
      stock: ROUTES.STOCK,
      repair: ROUTES.REPAIR,
      customers: ROUTES.CUSTOMERS,
      "customer-new": "/customers/new",
      "customer-edit": initialState?.customerId
        ? `/customers/${initialState.customerId}/edit`
        : ROUTES.CUSTOMERS,
      "customer-detail": initialState?.customerId
        ? `/customers/${initialState.customerId}`
        : ROUTES.CUSTOMERS,
      "customer-installation-form": initialState?.customerId
        ? `/customers/${initialState.customerId}/installation`
        : ROUTES.CUSTOMERS,
      "customer-maintenance-form": initialState?.customerId
        ? `/customers/${initialState.customerId}/maintenance`
        : ROUTES.CUSTOMERS,
      "customer-dismantle": initialState?.customerId
        ? `/customers/${initialState.customerId}/dismantle`
        : ROUTES.CUSTOMERS,
      "pengaturan-pengguna": ROUTES.USERS,
      "user-form": initialState?.editingUser
        ? `/users/${initialState.editingUser.id}/edit`
        : "/users/new",
      "division-form": initialState?.editingDivision
        ? `/divisions/${initialState.editingDivision.id}/edit`
        : "/divisions/new",
      "user-detail": initialState?.userId
        ? `/users/${initialState.userId}`
        : ROUTES.USERS,
      "division-detail": initialState?.divisionId
        ? `/divisions/${initialState.divisionId}`
        : ROUTES.USERS,
      "pengaturan-akun": ROUTES.ACCOUNT_SETTINGS,
      kategori: ROUTES.CATEGORIES,
      "return-form": initialState?.loanId
        ? `/requests/loan/${initialState.loanId}/return`
        : ROUTES.REQUESTS_LOAN,
      "return-detail": initialState?.returnId
        ? `/requests/return/${initialState.returnId}`
        : ROUTES.REQUESTS_LOAN,
    };

    const route = routeMap[page] || ROUTES.DASHBOARD;
    navigate(route);
  };

  // Preview handler
  const handleShowPreview = (data: PreviewData) => {
    if (data.type === "customer") {
      navigate(`/customers/${data.id}`);
      setPreviewData(null);
    } else if (data.type === "installation") {
      navigate(`/customers/${data.id}/installation`);
      setPreviewData(null);
    } else if (data.type === "maintenance") {
      navigate(`/customers/${data.id}/maintenance`);
      setPreviewData(null);
    } else {
      setPreviewData(data);
    }
  };

  // Scan handler
  const handleScanSuccess = (parsedData: any) => {
    if (scanContext === "form" && formScanCallback) {
      formScanCallback(parsedData);
      setIsGlobalScannerOpen(false);
      return;
    }

    if (parsedData.id) {
      handleShowPreview({ type: "asset", id: parsedData.id });
    } else {
      addNotification("Kode aset tidak dikenali.", "error");
    }
    setIsGlobalScannerOpen(false);
  };

  // Navigation actions for preview modal
  const navigationActions = {
    onInitiateHandover: (asset: Asset) => {
      navigate(ROUTES.HANDOVER, { state: { prefillData: asset } });
      setPreviewData(null);
    },
    onInitiateDismantle: (asset: Asset) => {
      // Navigate to customers page with prefill data since Asset doesn't have customerId
      navigate(ROUTES.CUSTOMERS, {
        state: { prefillData: asset, action: "dismantle" },
      });
      setPreviewData(null);
    },
    onInitiateInstallation: (asset: Asset) => {
      // Navigate to customers page with prefill asset for installation
      navigate(ROUTES.CUSTOMERS, {
        state: { prefillAsset: asset.id, action: "installation" },
      });
      setPreviewData(null);
    },
    onInitiateRegistrationFromRequest: (
      request: Request,
      itemToRegister: any,
    ) => {
      navigate(ROUTES.REGISTRATION, {
        state: { prefillData: { request, itemToRegister } },
      });
    },
    onInitiateHandoverFromRequest: (request: Request) => {
      navigate(ROUTES.HANDOVER, { state: { prefillData: request } });
    },
    onInitiateHandoverFromLoan: (loanRequest: LoanRequest) => {
      navigate(ROUTES.HANDOVER, { state: { prefillData: loanRequest } });
    },
    onReportDamage: () => navigate(ROUTES.STOCK),
    onStartRepair: () => navigate(ROUTES.REPAIR),
    onMarkAsRepaired: () => navigate(ROUTES.REPAIR),
    onDecommission: () => navigate(ROUTES.REPAIR),
    onReceiveFromRepair: () => navigate(ROUTES.REPAIR),
    onAddProgressUpdate: () => navigate(ROUTES.REPAIR),
    onEditItem: (data: PreviewData) => {
      setPreviewData(null);
      if (data.type === "asset") {
        navigate(`/assets/${data.id}/edit`);
      }
      if (data.type === "customer") {
        navigate(`/customers/${data.id}/edit`);
      }
    },
  };

  if (isDataLoading) {
    return (
      <>
        <FullPageLoader message="Sinkronisasi Database..." />
        <PageSkeleton />
      </>
    );
  }

  // Get page initial state from UI store (for legacy component compatibility)
  const pageInitialState = useUIStore.getState().pageInitialState;
  const clearPageInitialState = useUIStore.getState().clearPageInitialState;

  return (
    <MainLayout
      currentUser={currentUser}
      onLogout={() => {
        logout();
        navigate(ROUTES.LOGIN);
      }}
      setActivePage={setActivePage}
      onShowPreview={handleShowPreview}
      onOpenScanner={() => {
        setScanContext("global");
        setIsGlobalScannerOpen(true);
      }}
      isGlobalScannerOpen={isGlobalScannerOpen}
      setIsGlobalScannerOpen={setIsGlobalScannerOpen}
      onScanSuccess={handleScanSuccess}
      previewData={previewData}
      setPreviewData={setPreviewData}
      previewActions={navigationActions}
    >
      <Routes>
        {/* Dashboard */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <LazyPage>
              <DashboardPage
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
              />
            </LazyPage>
          }
        />

        {/* Requests */}
        <Route
          path={ROUTES.REQUESTS}
          element={
            <LazyPage>
              <RequestHubPage
                activePage="request"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                onInitiateRegistration={
                  navigationActions.onInitiateRegistrationFromRequest
                }
                onInitiateHandoverFromRequest={
                  navigationActions.onInitiateHandoverFromRequest
                }
                onInitiateHandoverFromLoan={
                  navigationActions.onInitiateHandoverFromLoan
                }
                initialFilters={pageInitialState}
                onClearInitialFilters={clearPageInitialState}
                setIsGlobalScannerOpen={setIsGlobalScannerOpen}
                setScanContext={setScanContext}
                setFormScanCallback={setFormScanCallback}
              />
            </LazyPage>
          }
        />

        <Route
          path={ROUTES.REQUESTS_LOAN}
          element={
            <LazyPage>
              <RequestHubPage
                activePage="request-pinjam"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                onInitiateRegistration={
                  navigationActions.onInitiateRegistrationFromRequest
                }
                onInitiateHandoverFromRequest={
                  navigationActions.onInitiateHandoverFromRequest
                }
                onInitiateHandoverFromLoan={
                  navigationActions.onInitiateHandoverFromLoan
                }
                initialFilters={pageInitialState}
                onClearInitialFilters={clearPageInitialState}
                setIsGlobalScannerOpen={setIsGlobalScannerOpen}
                setScanContext={setScanContext}
                setFormScanCallback={setFormScanCallback}
              />
            </LazyPage>
          }
        />

        <Route
          path={ROUTES.RETURN_FORM}
          element={
            <LazyPage>
              <ReturnFormWrapper
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
              />
            </LazyPage>
          }
        />

        <Route
          path={ROUTES.RETURN_DETAIL}
          element={
            <LazyPage>
              <ReturnDetailWrapper
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
              />
            </LazyPage>
          }
        />

        {/* Assets */}
        <Route
          path={ROUTES.REGISTRATION}
          element={
            <LazyPage>
              <RegistrationPage
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                initialFilters={pageInitialState}
                onClearInitialFilters={clearPageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateHandover={navigationActions.onInitiateHandover}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
                onInitiateInstallation={
                  navigationActions.onInitiateInstallation
                }
                assetToViewId={null}
                itemToEdit={pageInitialState?.itemToEdit || null}
                onClearItemToEdit={clearPageInitialState}
                setIsGlobalScannerOpen={setIsGlobalScannerOpen}
                setScanContext={setScanContext}
                setFormScanCallback={setFormScanCallback}
              />
            </LazyPage>
          }
        />

        {/* Transactions */}
        <Route
          path={ROUTES.HANDOVER}
          element={
            <LazyPage>
              <HandoverPage
                currentUser={currentUser}
                onShowPreview={handleShowPreview}
                initialFilters={pageInitialState}
                onClearInitialFilters={clearPageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
              />
            </LazyPage>
          }
        />

        <Route
          path={ROUTES.STOCK}
          element={
            <LazyPage>
              <StockOverviewPage
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                initialFilters={pageInitialState}
                onClearInitialFilters={clearPageInitialState}
                onReportDamage={() => {}}
              />
            </LazyPage>
          }
        />

        <Route
          path={ROUTES.REPAIR}
          element={
            <LazyPage>
              <RepairManagementPage
                currentUser={currentUser}
                onShowPreview={handleShowPreview}
                onStartRepair={() => {}}
                onAddProgressUpdate={() => {}}
                onReceiveFromRepair={() => {}}
                onCompleteRepair={() => {}}
                onDecommission={() => {}}
              />
            </LazyPage>
          }
        />

        {/* Customers */}
        <Route
          path={ROUTES.CUSTOMERS}
          element={
            <LazyPage>
              <CustomerManagementPage
                subPage="list"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                pageInitialState={pageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
              />
            </LazyPage>
          }
        />

        <Route
          path="/customers/new"
          element={
            <LazyPage>
              <CustomerManagementPage
                subPage="new"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                pageInitialState={pageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
              />
            </LazyPage>
          }
        />

        <Route
          path="/customers/:id"
          element={
            <LazyPage>
              <CustomerManagementPage
                subPage="detail"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                pageInitialState={pageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
              />
            </LazyPage>
          }
        />

        <Route
          path="/customers/:id/edit"
          element={
            <LazyPage>
              <CustomerManagementPage
                subPage="edit"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                pageInitialState={pageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
              />
            </LazyPage>
          }
        />

        <Route
          path="/customers/:id/installation"
          element={
            <LazyPage>
              <CustomerManagementPage
                subPage="installation"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                pageInitialState={pageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
              />
            </LazyPage>
          }
        />

        <Route
          path="/customers/:id/maintenance"
          element={
            <LazyPage>
              <CustomerManagementPage
                subPage="maintenance"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                pageInitialState={pageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
              />
            </LazyPage>
          }
        />

        <Route
          path="/customers/:id/dismantle"
          element={
            <LazyPage>
              <CustomerManagementPage
                subPage="dismantle"
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
                pageInitialState={pageInitialState}
                prefillData={pageInitialState?.prefillData}
                onClearPrefill={clearPageInitialState}
                onInitiateDismantle={navigationActions.onInitiateDismantle}
              />
            </LazyPage>
          }
        />

        {/* Users */}
        <Route
          path={ROUTES.USERS}
          element={
            <LazyPage>
              <AccountsPage
                currentUser={currentUser}
                setActivePage={setActivePage}
                onShowPreview={handleShowPreview}
              />
            </LazyPage>
          }
        />

        <Route
          path="/users/new"
          element={
            <LazyPage>
              <UserFormPage
                currentUser={currentUser}
                onCancel={() => navigate(ROUTES.USERS)}
                editingUser={null}
              />
            </LazyPage>
          }
        />

        <Route
          path="/users/:id/edit"
          element={
            <LazyPage>
              <UserFormWrapper onCancel={() => navigate(ROUTES.USERS)} />
            </LazyPage>
          }
        />

        <Route
          path="/users/:id"
          element={
            <LazyPage>
              <UserDetailWrapper
                currentUser={currentUser}
                onBack={() => navigate(ROUTES.USERS)}
                onShowAssetPreview={(id) =>
                  handleShowPreview({ type: "asset", id })
                }
              />
            </LazyPage>
          }
        />

        {/* Divisions */}
        <Route
          path="/divisions/new"
          element={
            <LazyPage>
              <DivisionFormPage
                onCancel={() => navigate(ROUTES.USERS)}
                editingDivision={null}
              />
            </LazyPage>
          }
        />

        <Route
          path="/divisions/:id/edit"
          element={
            <LazyPage>
              <DivisionFormWrapper onCancel={() => navigate(ROUTES.USERS)} />
            </LazyPage>
          }
        />

        <Route
          path="/divisions/:id"
          element={
            <LazyPage>
              <DivisionDetailWrapper onBack={() => navigate(ROUTES.USERS)} />
            </LazyPage>
          }
        />

        {/* Settings */}
        <Route
          path={ROUTES.ACCOUNT_SETTINGS}
          element={
            <LazyPage>
              <ManageAccountPage
                currentUser={currentUser}
                onBack={() => navigate(ROUTES.DASHBOARD)}
              />
            </LazyPage>
          }
        />

        <Route
          path={ROUTES.CATEGORIES}
          element={
            <LazyPage>
              <CategoryManagementPage currentUser={currentUser} />
            </LazyPage>
          }
        />

        {/* Error Pages */}
        <Route
          path={ROUTES.PERMISSION_DENIED}
          element={
            <LazyPage>
              <PermissionDeniedPage onBack={() => navigate(ROUTES.DASHBOARD)} />
            </LazyPage>
          }
        />
      </Routes>
    </MainLayout>
  );
}

// Wrapper components for dynamic routes that need params
import { useParams } from "react-router-dom";

function UserFormWrapper({ onCancel }: { onCancel: () => void }) {
  const { id } = useParams<{ id: string }>();
  const users = useMasterDataStore((state) => state.users);
  const editingUser = users.find((u) => String(u.id) === id) || null;
  const currentUser = useAuthStore((state) => state.currentUser)!;

  return (
    <UserFormPage
      currentUser={currentUser}
      onCancel={onCancel}
      editingUser={editingUser}
    />
  );
}

function DivisionFormWrapper({ onCancel }: { onCancel: () => void }) {
  const { id } = useParams<{ id: string }>();
  const divisions = useMasterDataStore((state) => state.divisions);
  const editingDivision = divisions.find((d) => String(d.id) === id) || null;

  return (
    <DivisionFormPage onCancel={onCancel} editingDivision={editingDivision} />
  );
}

function UserDetailWrapper({
  currentUser,
  onBack,
  onShowAssetPreview,
}: {
  currentUser: any;
  onBack: () => void;
  onShowAssetPreview: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const users = useMasterDataStore((state) => state.users);
  const user = users.find((u) => String(u.id) === id);

  return (
    <UserDetailPage
      currentUser={currentUser}
      pageInitialState={{ userId: id ? Number(id) : undefined }}
      onBack={onBack}
      onEdit={() => navigate(`/users/${id}/edit`)}
      onShowAssetPreview={onShowAssetPreview}
    />
  );
}

function DivisionDetailWrapper({ onBack }: { onBack: () => void }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <DivisionDetailPage
      pageInitialState={{ divisionId: id ? Number(id) : undefined }}
      onBack={onBack}
      onEdit={() => navigate(`/divisions/${id}/edit`)}
      onViewMember={(uid) => navigate(`/users/${uid}`)}
    />
  );
}

function ReturnFormWrapper({
  currentUser,
  setActivePage,
  onShowPreview,
}: {
  currentUser: any;
  setActivePage: any;
  onShowPreview: any;
}) {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const loanRequests = useRequestStore((state) => state.loanRequests);
  const assets = useAssetStore((state) => state.assets);

  const loanRequest = loanRequests.find((lr) => lr.id === loanId);
  const assetIds = (location.state as any)?.assetIds || [];
  const preselectedAssets = assets.filter((a) => assetIds.includes(a.id));

  return (
    <ReturnAssetFormPage
      currentUser={currentUser}
      onCancel={() =>
        navigate(`/requests/loan`, { state: { openDetailForId: loanId } })
      }
      loanRequest={loanRequest}
      preselectedAssets={preselectedAssets}
      onShowPreview={onShowPreview}
    />
  );
}

function ReturnDetailWrapper({
  currentUser,
  setActivePage,
  onShowPreview,
}: {
  currentUser: any;
  setActivePage: any;
  onShowPreview: any;
}) {
  const { returnId } = useParams<{ returnId: string }>();
  const navigate = useNavigate();
  const returns = useRequestStore((state) => state.returns);
  const loanRequests = useRequestStore((state) => state.loanRequests);
  const assets = useAssetStore((state) => state.assets);

  const returnDocument = returns.find((r) => r.id === returnId);
  const loanRequest = returnDocument
    ? loanRequests.find((lr) => lr.id === returnDocument.loanRequestId)
    : undefined;

  const allReturnDocuments = returnDocument
    ? returns.filter((r) => r.docNumber === returnDocument.docNumber)
    : [];

  const assetsForReturn = allReturnDocuments
    .flatMap((r) => r.items)
    .map((item) => assets.find((a) => a.id === item.assetId))
    .filter((a): a is (typeof assets)[0] => a !== undefined);

  return (
    <ReturnRequestDetailPage
      currentUser={currentUser}
      onBackToList={() =>
        navigate("/requests/loan", { state: { initialTab: "returns" } })
      }
      loanRequest={loanRequest}
      returnDocuments={allReturnDocuments}
      assetsToReturn={assetsForReturn}
      onShowPreview={onShowPreview}
      setActivePage={setActivePage}
    />
  );
}

/**
 * Root Application Component
 */
function RouterApp() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const checkSession = useAuthStore((state) => state.checkSession);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const checkHydration = setInterval(() => {
      if (
        useAuthStore.persist.hasHydrated() &&
        useUIStore.persist.hasHydrated()
      ) {
        setIsHydrated(true);
        clearInterval(checkHydration);
      }
    }, 50);

    checkSession();
    return () => clearInterval(checkHydration);
  }, [checkSession]);

  if (!isHydrated) {
    return <FullPageLoader message="Memulai Sistem..." />;
  }

  return (
    <Routes>
      {/* Public Route - Login */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <Suspense fallback={<PageSkeleton />}>
              <LoginPage onLogin={async () => ({}) as any} />
            </Suspense>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default RouterApp;
