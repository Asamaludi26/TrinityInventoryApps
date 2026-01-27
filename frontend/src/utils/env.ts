/**
 * Environment Configuration Utilities
 *
 * Provides type-safe access to environment variables with fallbacks.
 *
 * @module utils/env
 * @version 1.0.0
 */

/**
 * Parse boolean environment variable
 */
export function parseEnvBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

/**
 * Environment configuration object
 * Access environment variables with type safety and fallbacks
 */
export const env = {
  /**
   * API base URL
   */
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",

  /**
   * Application name
   */
  appName: import.meta.env.VITE_APP_NAME || "Trinity Asset Flow",

  /**
   * Application version
   */
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  /**
   * Application description
   */
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || "Sistem Manajemen Aset Terpadu",

  /**
   * Whether running in development mode
   */
  isDev: import.meta.env.DEV,

  /**
   * Whether running in production mode
   */
  isProd: import.meta.env.PROD,

  /**
   * Current mode (development | production | test)
   */
  mode: import.meta.env.MODE,

  /**
   * Feature Flags
   */
  features: {
    /**
     * Enable React Query DevTools
     */
    devTools: parseEnvBoolean(import.meta.env.VITE_ENABLE_DEVTOOLS, import.meta.env.DEV),

    /**
     * Show demo account credentials on login page
     */
    demoAccounts: parseEnvBoolean(import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS, false),

    /**
     * Enable debug logging
     */
    debug: parseEnvBoolean(import.meta.env.VITE_ENABLE_DEBUG, false),

    /**
     * Enable analytics tracking
     */
    analytics: parseEnvBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, false),
  },

  /**
   * Sentry DSN for error tracking
   */
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
} as const;

/**
 * Log configuration in development
 */
if (env.features.debug) {
  // eslint-disable-next-line no-console
  console.log("[ENV] Configuration:", {
    apiUrl: env.apiUrl,
    appName: env.appName,
    mode: env.mode,
    features: env.features,
  });
}

export default env;
