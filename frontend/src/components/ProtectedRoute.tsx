/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 * Checks role-based access for restricted routes.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { staffRestrictedPaths, ROUTES } from "../routes";
import { PageSkeleton } from "./ui/PageSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const location = useLocation();
  const isHydrated = useAuthStore.persist.hasHydrated();

  // Wait for auth state to hydrate
  if (!isHydrated) {
    return <PageSkeleton />;
  }

  // Not authenticated - redirect to login
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access
  const isStaffRestricted = staffRestrictedPaths.some((path) => {
    // Handle dynamic routes like /users/:id
    const pathPattern = path.replace(/:\w+/g, "[^/]+");
    const regex = new RegExp(`^${pathPattern}$`);
    return regex.test(location.pathname);
  });

  if (currentUser.role === "Staff" && isStaffRestricted) {
    return <Navigate to={ROUTES.PERMISSION_DENIED} replace />;
  }

  return <>{children}</>;
}

/**
 * Public Route Component
 *
 * Redirects authenticated users away from public pages like login.
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const location = useLocation();
  const isHydrated = useAuthStore.persist.hasHydrated();

  // Wait for auth state to hydrate
  if (!isHydrated) {
    return <PageSkeleton />;
  }

  // Already authenticated - redirect to dashboard or intended page
  if (currentUser) {
    const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
