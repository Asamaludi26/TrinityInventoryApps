/**
 * =============================================================================
 * Application Constants
 * =============================================================================
 * All application-wide constants defined in one place
 */

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Rate limiting
export const THROTTLE_TTL = 60000; // 1 minute in milliseconds
export const THROTTLE_LIMIT = 100; // requests per TTL
export const THROTTLE_LOGIN_TTL = 60000;
export const THROTTLE_LOGIN_LIMIT = 5;

// JWT
export const JWT_DEFAULT_EXPIRY = '7d';

// Password
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_SALT_ROUNDS = 12;
export const DEFAULT_USER_PASSWORD = 'Trinity@2026'; // Password standar untuk akun baru

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Document Number Prefixes
export const DOC_PREFIX = {
  ASSET: 'AST',
  REQUEST: 'RO',
  LOAN: 'LREQ',
  HANDOVER: 'HO',
  DISMANTLE: 'DM',
  MAINTENANCE: 'MNT',
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_LOGISTIK: 'ADMIN_LOGISTIK',
  ADMIN_PURCHASE: 'ADMIN_PURCHASE',
  STAFF: 'STAFF',
  TEKNISI: 'TEKNISI',
} as const;

// Role Account Limits
export const ROLE_ACCOUNT_LIMITS: Record<string, number> = {
  SUPER_ADMIN: 1,
  ADMIN_LOGISTIK: 3,
  ADMIN_PURCHASE: 3,
  // STAFF, LEADER, TEKNISI tidak dibatasi
} as const;

// Permission Actions
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
} as const;

// Permission Resources
export const PERMISSION_RESOURCES = {
  ASSETS: 'assets',
  REQUESTS: 'requests',
  LOANS: 'loans',
  HANDOVERS: 'handovers',
  USERS: 'users',
  CUSTOMERS: 'customers',
  CATEGORIES: 'categories',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;
