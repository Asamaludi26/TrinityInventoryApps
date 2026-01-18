import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict access to specific roles
 * @param roles - Array of allowed roles
 * @example
 * @Roles('SUPER_ADMIN', 'ADMIN_LOGISTIK')
 * @Get('admin/users')
 * getUsers() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
