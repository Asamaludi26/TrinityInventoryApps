/**
 * =============================================================================
 * Test Utilities
 * =============================================================================
 *
 * Common test utilities and render helpers for React Testing Library.
 *
 * @module test/test-utils
 * @version 1.0.0
 * @created 2026-01-19
 */

/* eslint-disable react-refresh/only-export-components */

import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// FIX: Import userEvent secara eksplisit untuk menghindari masalah re-export
import userEvent from "@testing-library/user-event";

// Create a new QueryClient for each test
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: Infinity, // Keep data in cache
        staleTime: Infinity, // Never mark as stale
      },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
}

/**
 * Provider wrapper that includes all app-level providers
 */
function AllProviders({ children }: AllProvidersProps): ReactElement {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Custom render with all providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// FIX: Export userEvent secara eksplisit
export { userEvent };

// Override render with custom render
export { customRender as render };

// Export the test query client factory
export { createTestQueryClient };
