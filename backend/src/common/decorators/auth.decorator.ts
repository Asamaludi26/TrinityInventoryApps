import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from './roles.decorator';
import { RequirePermissions } from './permissions.decorator';

/**
 * Composite decorator for role-based access control
 * Combines JWT authentication with role checking
 * @param roles - Allowed roles
 * @example
 * @Auth('SUPER_ADMIN', 'ADMIN_LOGISTIK')
 * @Get('admin/settings')
 * getSettings() { ... }
 */
export function Auth(...roles: string[]) {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
}

/**
 * Composite decorator for permission-based access control
 * Combines JWT authentication with permission checking
 * @param permissions - Required permissions
 * @example
 * @AuthPermissions('assets:create')
 * @Post()
 * createAsset() { ... }
 */
export function AuthPermissions(...permissions: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    RequirePermissions(...permissions),
  );
}
