import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Débogage des rôles
    // console.log(`[RolesGuard] Checking roles for user: ${user?.email || 'unknown'}`);
    // console.log(`[RolesGuard] User roles: ${JSON.stringify(user?.roles)}`);

    if (!user) {
      console.warn('[RolesGuard] Access denied: No user found in request');
      return false;
    }

    // Admin bypasses all role checks
    if (user.roles?.includes('admin')) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      console.warn(`[RolesGuard] Forbidden: User ${user.email} lacks required roles [${requiredRoles.join(', ')}]. Has: [${user.roles?.join(', ')}]`);
    }

    return hasRole;
  }
}
