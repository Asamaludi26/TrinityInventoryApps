/**
 * Application Constants
 *
 * Centralized constants used throughout the application.
 *
 * @module constants/app
 * @version 1.0.0
 */

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ] as const,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE = {
  SEARCH: 300,
  RESIZE: 100,
  SCROLL: 50,
  INPUT: 200,
} as const;

/**
 * Toast notification durations (in milliseconds)
 */
export const TOAST = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH: "auth-storage",
  UI_STATE: "ui-storage",
  THEME: "theme-preference",
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
} as const;

/**
 * API endpoints (relative to base URL)
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_PASSWORD_RESET: "/auth/password-reset",

  // Assets
  ASSETS: "/assets",
  ASSET_BY_ID: (id: string) => `/assets/${id}`,
  ASSET_CONSUME: (id: string) => `/assets/${id}/consume`,

  // Categories
  CATEGORIES: "/categories",
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,

  // Customers
  CUSTOMERS: "/customers",
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,

  // Users
  USERS: "/users",
  USER_BY_ID: (id: number) => `/users/${id}`,
  USER_RESET_PASSWORD: (id: number) => `/users/${id}/reset-password`,

  // Divisions
  DIVISIONS: "/divisions",
  DIVISION_BY_ID: (id: number) => `/divisions/${id}`,

  // Requests
  REQUESTS: "/requests",
  REQUEST_BY_ID: (id: string) => `/requests/${id}`,
  REQUEST_APPROVE: (id: string) => `/requests/${id}/approve`,
  REQUEST_REJECT: (id: string) => `/requests/${id}/reject`,

  // Loans
  LOANS: "/loans",
  LOAN_BY_ID: (id: string) => `/loans/${id}`,
  LOAN_RETURN: (id: string) => `/loans/${id}/return`,

  // Transactions
  HANDOVERS: "/handovers",
  INSTALLATIONS: "/installations",
  MAINTENANCES: "/maintenances",
  DISMANTLES: "/dismantles",

  // Stock
  STOCK: "/stock",
  STOCK_MOVEMENTS: "/stock/movements",

  // Notifications
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,

  // Reports
  REPORTS: "/reports",
  REPORTS_EXPORT: "/reports/export",

  // Unified
  UNIFIED_APP_DATA: "/unified/app-data",
} as const;

/**
 * Query keys for TanStack Query
 */
export const QUERY_KEYS = {
  ASSETS: ["assets"] as const,
  ASSET: (id: string) => ["assets", id] as const,
  CATEGORIES: ["categories"] as const,
  CUSTOMERS: ["customers"] as const,
  CUSTOMER: (id: string) => ["customers", id] as const,
  USERS: ["users"] as const,
  USER: (id: number) => ["users", id] as const,
  DIVISIONS: ["divisions"] as const,
  REQUESTS: ["requests"] as const,
  REQUEST: (id: string) => ["requests", id] as const,
  LOANS: ["loans"] as const,
  LOAN: (id: string) => ["loans", id] as const,
  HANDOVERS: ["handovers"] as const,
  INSTALLATIONS: ["installations"] as const,
  MAINTENANCES: ["maintenances"] as const,
  DISMANTLES: ["dismantles"] as const,
  NOTIFICATIONS: ["notifications"] as const,
  STOCK: ["stock"] as const,
  UNIFIED_DATA: ["unified-data"] as const,
} as const;

/**
 * Date formats (for date-fns)
 */
export const DATE_FORMAT = {
  DISPLAY: "dd MMM yyyy",
  DISPLAY_WITH_TIME: "dd MMM yyyy, HH:mm",
  ISO: "yyyy-MM-dd",
  ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
  TIME_ONLY: "HH:mm",
  FULL: "EEEE, dd MMMM yyyy",
} as const;

/**
 * Regex patterns for validation
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^[0-9]+$/,
} as const;
