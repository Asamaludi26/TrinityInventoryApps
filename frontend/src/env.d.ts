/// <reference types="vite/client" />

/**
 * Environment Variable Type Definitions
 *
 * This file provides TypeScript type safety for Vite environment variables.
 * All VITE_* prefixed variables from .env files are typed here.
 */

interface ImportMetaEnv {
  /**
   * Base API URL for backend communication
   * @example "http://localhost:3001/api/v1"
   */
  readonly VITE_API_URL: string;

  /**
   * Application display name
   * @example "Trinity Asset Flow"
   */
  readonly VITE_APP_NAME: string;

  /**
   * Application version (semver)
   * @example "1.3.0"
   */
  readonly VITE_APP_VERSION: string;

  /**
   * Application description for meta tags
   */
  readonly VITE_APP_DESCRIPTION?: string;

  /**
   * Enable React Query DevTools
   * @default "false" in production
   */
  readonly VITE_ENABLE_DEVTOOLS?: string;

  /**
   * Enable demo account credentials on login page
   * @default "false" in production
   */
  readonly VITE_ENABLE_DEMO_ACCOUNTS?: string;

  /**
   * Enable debug logging to console
   * @default "false"
   */
  readonly VITE_ENABLE_DEBUG?: string;

  /**
   * Enable analytics tracking
   * @default "false"
   */
  readonly VITE_ENABLE_ANALYTICS?: string;

  /**
   * Sentry DSN for error tracking (production only)
   */
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Helper to safely parse boolean environment variables
 */
declare function parseEnvBoolean(value: string | undefined): boolean;
