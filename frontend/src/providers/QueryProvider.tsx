/**
 * React Query Provider
 *
 * Provides TanStack Query client to the application with
 * sensible defaults for caching and error handling.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

// Query client configuration
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus in development
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
        // Don't refetch on reconnect unless data is stale
        refetchOnReconnect: "always",
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
      },
    },
  });

export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient for each session to prevent SSR issues
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}

// Export query client for use outside React
export { createQueryClient };
