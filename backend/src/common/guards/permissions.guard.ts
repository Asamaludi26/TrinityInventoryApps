import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { USER_ROLES } from '../constants';

/**
 * Guard to check if user has required permission(s)
 * Permissions are checked against user.permissions array
 * Super Admin bypasses all permission checks
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super Admin bypasses all permission checks
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }

    const userPermissions: string[] = user.permissions || [];
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter(p => !userPermissions.includes(p));
      throw new ForbiddenException(`Access denied. Missing permission(s): ${missing.join(', ')}`);
    }

    return true;
  }
}
