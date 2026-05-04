import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../modules/permissions/permissions.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  // Simple cache to avoid DB hits on every request
  private static permissionCache = new Map<string, { permissions: string[], expiry: number }>();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute

  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Skip if route is Public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. Get required permissions from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // 3. Super Admin has access to everything
    if (user.roles?.includes('admin')) return true;

    // If no specific permission is required, we just check if user is authenticated (which is handled by JwtAuthGuard)
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    // 4. Get consolidated permissions (with caching)
    const userPermissions = await this.getCachedPermissions(user.id);

    // 5. Check if user has ALL required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      console.warn(`[PermissionsGuard] Accès refusé pour ${user.email}. Manque: ${requiredPermissions.filter(p => !userPermissions.includes(p))}`);
    }

    return hasPermission;
  }

  private async getCachedPermissions(userId: string): Promise<string[]> {
    const cached = PermissionsGuard.permissionCache.get(userId);
    const now = Date.now();

    if (cached && cached.expiry > now) {
      return cached.permissions;
    }

    const permissions = await this.permissionsService.getConsolidatedUserPermissions(userId);
    PermissionsGuard.permissionCache.set(userId, {
      permissions,
      expiry: now + this.CACHE_TTL,
    });

    return permissions;
  }
}
