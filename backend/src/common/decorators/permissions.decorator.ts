import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to restrict access based on granular permissions
 * @param permissions - Array of required permissions (e.g., 'assets:create', 'users:delete')
 * @example
 * @RequirePermissions('assets:create', 'assets:update')
 * @Post()
 * createAsset() { ... }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
