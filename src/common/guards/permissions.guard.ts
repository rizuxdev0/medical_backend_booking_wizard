import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../modules/permissions/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Le Super Admin/Admin a accès à tout par défaut
    if (user.roles?.includes('admin')) {
      return true;
    }

    // Récupérer les permissions consolidées de l'utilisateur
    const userPermissions = await this.permissionsService.getConsolidatedUserPermissions(user.id);

    // Vérifier si l'utilisateur possède TOUTES les permissions requises
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      console.warn(`[PermissionsGuard] Accès refusé pour ${user.email}. Permissions manquantes : ${requiredPermissions.filter(p => !userPermissions.includes(p))}`);
    }

    return hasPermission;
  }
}
