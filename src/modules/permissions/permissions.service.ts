// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Permission } from './entities/permission.entity';
// import { RolePermission } from './entities/role-permission.entity';
// import {
//   CreatePermissionDto,
//   AssignPermissionsDto,
//   PermissionResponseDto,
//   RolePermissionsResponseDto,
// } from './dto/create-permission.dto';

// @Injectable()
// export class PermissionsService {
//   constructor(
//     @InjectRepository(Permission)
//     private permissionRepo: Repository<Permission>,
//     @InjectRepository(RolePermission)
//     private rolePermissionRepo: Repository<RolePermission>,
//   ) {}

//   async findAllPermissions(): Promise<PermissionResponseDto[]> {
//     const permissions = await this.permissionRepo.find({
//       order: { module: 'ASC', name: 'ASC' },
//     });
//     return permissions.map((p) => this.mapToResponse(p));
//   }

//   async findPermissionByCode(code: string): Promise<PermissionResponseDto> {
//     const permission = await this.permissionRepo.findOne({
//       where: { code },
//     });

//     if (!permission) {
//       throw new NotFoundException(
//         `Permission avec le code ${code} non trouvée`,
//       );
//     }

//     return this.mapToResponse(permission);
//   }

//   async createPermission(
//     createPermissionDto: CreatePermissionDto,
//   ): Promise<PermissionResponseDto> {
//     const existing = await this.permissionRepo.findOne({
//       where: { code: createPermissionDto.code },
//     });

//     if (existing) {
//       throw new BadRequestException(
//         `Une permission avec le code ${createPermissionDto.code} existe déjà`,
//       );
//     }

//     const permission = this.permissionRepo.create({
//       code: createPermissionDto.code,
//       name: createPermissionDto.name,
//       description: createPermissionDto.description || null,
//       module: createPermissionDto.module,
//     });

//     await this.permissionRepo.save(permission);
//     return this.mapToResponse(permission);
//   }

//   async getRolePermissions(role: string): Promise<RolePermissionsResponseDto> {
//     const rolePermissions = await this.rolePermissionRepo.find({
//       where: { role: role as any },
//       relations: ['permission'],
//     });

//     return {
//       role,
//       permissions: rolePermissions.map((rp) =>
//         this.mapToResponse(rp.permission),
//       ),
//     };
//   }

//   async assignPermissions(
//     assignDto: AssignPermissionsDto,
//   ): Promise<RolePermissionsResponseDto> {
//     // Supprimer les anciennes permissions
//     await this.rolePermissionRepo.delete({ role: assignDto.role as any });

//     // Ajouter les nouvelles permissions
//     for (const code of assignDto.permission_codes) {
//       const permission = await this.permissionRepo.findOne({
//         where: { code },
//       });

//       if (!permission) {
//         throw new NotFoundException(`Permission ${code} non trouvée`);
//       }

//       const rolePermission = this.rolePermissionRepo.create({
//         role: assignDto.role as any,
//         permissionCode: code,
//       });

//       await this.rolePermissionRepo.save(rolePermission);
//     }

//     return this.getRolePermissions(assignDto.role);
//   }

//   async hasPermission(role: string, permissionCode: string): Promise<boolean> {
//     // Admin a toutes les permissions
//     if (role === 'admin') {
//       return true;
//     }

//     const count = await this.rolePermissionRepo.count({
//       where: {
//         role: role as any,
//         permissionCode,
//       },
//     });

//     return count > 0;
//   }

//   async getPermissionsByRole(role: string): Promise<string[]> {
//     const rolePermissions = await this.rolePermissionRepo.find({
//       where: { role: role as any },
//     });

//     return rolePermissions.map((rp) => rp.permissionCode);
//   }

//   private mapToResponse(permission: Permission): PermissionResponseDto {
//     return {
//       id: permission.id,
//       code: permission.code,
//       name: permission.name,
//       description: permission.description || null,
//       module: permission.module,
//       created_at: permission.createdAt,
//     };
//   }
// }
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import {
  CreatePermissionDto,
  AssignPermissionsDto,
  PermissionResponseDto,
  RolePermissionsResponseDto,
} from './dto/create-permission.dto';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async onModuleInit() {
    const count = await this.permissionRepo.count();
    if (count === 0) {
      console.log('--- SEEDING PERMISSIONS ---');
      await this.seedDefaultPermissions();
    }
  }

  private async seedDefaultPermissions() {
    const defaultPermissions = [
      // Patients
      { code: 'patients.view', name: 'Voir patients', module: 'patients' },
      { code: 'patients.create', name: 'Créer patient', module: 'patients' },
      { code: 'patients.edit', name: 'Modifier patient', module: 'patients' },
      { code: 'patients.delete', name: 'Supprimer patient', module: 'patients' },
      { code: 'patients.documents', name: 'Gérer les documents patients', module: 'patients' },
      // Appointments
      { code: 'appointments.view', name: 'Voir RDV', module: 'appointments' },
      { code: 'appointments.create', name: 'Créer RDV', module: 'appointments' },
      { code: 'appointments.edit', name: 'Modifier RDV', module: 'appointments' },
      { code: 'appointments.delete', name: 'Annuler RDV', module: 'appointments' },
      { code: 'appointments.close', name: 'Clôturer RDV', module: 'appointments' },
      // Practitioners
      { code: 'practitioners.view', name: 'Voir praticiens', module: 'practitioners' },
      { code: 'practitioners.create', name: 'Créer praticien', module: 'practitioners' },
      { code: 'practitioners.edit', name: 'Modifier praticien', module: 'practitioners' },
      { code: 'practitioners.delete', name: 'Supprimer praticien', module: 'practitioners' },
      // Queue
      { code: 'queue.view', name: 'Voir file', module: 'queue' },
      { code: 'queue.manage', name: 'Gérer file', module: 'queue' },
      // Billing
      { code: 'billing.view', name: 'Voir factures', module: 'billing' },
      { code: 'billing.create', name: 'Créer facture', module: 'billing' },
      { code: 'billing.edit', name: 'Modifier facture', module: 'billing' },
      { code: 'billing.delete', name: 'Supprimer facture', module: 'billing' },
      // Payments
      { code: 'payments.view', name: 'Voir paiements', module: 'billing' },
      { code: 'payments.create', name: 'Enregistrer paiement', module: 'billing' },
      // Settings
      { code: 'settings.view', name: 'Voir paramètres', module: 'settings' },
      { code: 'settings.edit', name: 'Modifier paramètres', module: 'settings' },
      // Users
      { code: 'users.view', name: 'Voir utilisateurs', module: 'users' },
      { code: 'users.create', name: 'Créer un nouvel utilisateur', module: 'users' },
      { code: 'users.edit', name: 'Modifier utilisateur', module: 'users' },
      { code: 'users.deactivate', name: 'Désactiver un compte utilisateur', module: 'users' },
      { code: 'users.manage_roles', name: 'Gérer les rôles', module: 'users' },
      // Reports
      { code: 'reports.view', name: 'Voir statistiques', module: 'reports' },
      { code: 'reports.export', name: 'Exporter données', module: 'reports' },
      // Audit
      { code: 'audit.view', name: 'Voir audit', module: 'audit' },
      { code: 'audit.export', name: 'Exporter audit', module: 'audit' },
      // Resources
      { code: 'resources.view', name: 'Voir ressources', module: 'resources' },
      { code: 'resources.manage', name: 'Gérer ressources', module: 'resources' },
      // Departments
      { code: 'departments.view', name: 'Voir départements', module: 'departments' },
      { code: 'departments.create', name: 'Créer nouveau département', module: 'departments' },
      { code: 'departments.edit', name: 'Modifier département existant', module: 'departments' },
      { code: 'departments.delete', name: 'Supprimer département', module: 'departments' },
      // Checkout
      { code: 'checkout.view', name: 'Voir caisse', module: 'checkout' },
      { code: 'checkout.manage', name: 'Gérer sorties', module: 'checkout' },
      // Chat
      { code: 'chat.view', name: 'Voir messagerie', module: 'chat' },
      { code: 'chat.send', name: 'Envoyer messages', module: 'chat' },
      // Guards
      { code: 'guards.view', name: 'Voir gardes', module: 'guards' },
      { code: 'guards.manage', name: 'Gérer gardes', module: 'guards' },
      // Absences
      { code: 'absences.view', name: 'Voir absences', module: 'absences' },
      { code: 'absences.manage', name: 'Gérer absences', module: 'absences' },
      // Currencies
      { code: 'currencies.view', name: 'Voir devises', module: 'currencies' },
      { code: 'currencies.manage', name: 'Gérer devises', module: 'currencies' },
      // Notifications
      { code: 'notifications.view', name: 'Voir notifications', module: 'notifications' },
      { code: 'notifications.manage', name: 'Gérer notifications', module: 'notifications' },
    ];

    for (const p of defaultPermissions) {
      const perm = this.permissionRepo.create(p);
      await this.permissionRepo.save(perm);
    }

    // Seed role-permissions for common roles
    const roles = ['admin', 'doctor', 'secretary', 'nurse', 'accountant', 'supervisor'];
    for (const role of roles) {
      if (role === 'admin') {
        // Admin gets all automatically via hasPermission, but we can seed for visibility
        for (const p of defaultPermissions) {
           await this.rolePermissionRepo.save(this.rolePermissionRepo.create({
             role: role as any,
             permissionCode: p.code
           }));
        }
      }
    }
  }

  async getConsolidatedUserPermissions(userId: string): Promise<string[]> {
    // This is a placeholder. In a real system, you'd fetch roles for userId 
    // then fetch all permissions associated with those roles.
    // Since we want admin to have all, and simplify for now:
    return (await this.findAllPermissions()).map(p => p.code);
  }

  async findAllPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepo.find({
      order: { module: 'ASC', name: 'ASC' },
    });
    return permissions.map((p) => this.mapToResponse(p));
  }

  async findPermissionByCode(code: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepo.findOne({
      where: { code },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission avec le code ${code} non trouvée`,
      );
    }

    return this.mapToResponse(permission);
  }

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const existing = await this.permissionRepo.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existing) {
      throw new BadRequestException(
        `Une permission avec le code ${createPermissionDto.code} existe déjà`,
      );
    }

    const permissionData: Partial<Permission> = {
      code: createPermissionDto.code,
      name: createPermissionDto.name,
      module: createPermissionDto.module,
    };

    if (createPermissionDto.description) {
      permissionData.description = createPermissionDto.description;
    }

    const permission = this.permissionRepo.create(permissionData);
    await this.permissionRepo.save(permission);
    return this.mapToResponse(permission);
  }

  async getRolePermissions(role: string): Promise<RolePermissionsResponseDto> {
    const rolePermissions = await this.rolePermissionRepo.find({
      where: { role: role as any },
      relations: ['permission'],
    });

    return {
      role,
      permissions: rolePermissions.map((rp) =>
        this.mapToResponse(rp.permission),
      ),
    };
  }

  async assignPermissions(
    assignDto: AssignPermissionsDto,
  ): Promise<RolePermissionsResponseDto> {
    // Supprimer les anciennes permissions
    await this.rolePermissionRepo.delete({ role: assignDto.role as any });

    // Ajouter les nouvelles permissions
    for (const code of assignDto.permission_codes) {
      const permission = await this.permissionRepo.findOne({
        where: { code },
      });

      if (!permission) {
        throw new NotFoundException(`Permission ${code} non trouvée`);
      }

      const rolePermission = this.rolePermissionRepo.create({
        role: assignDto.role as any,
        permissionCode: code,
      });

      await this.rolePermissionRepo.save(rolePermission);
    }

    return this.getRolePermissions(assignDto.role);
  }

  async hasPermission(role: string, permissionCode: string): Promise<boolean> {
    // Admin a toutes les permissions
    if (role === 'admin') {
      return true;
    }

    const count = await this.rolePermissionRepo.count({
      where: {
        role: role as any,
        permissionCode,
      },
    });

    return count > 0;
  }

  async getPermissionsByRole(role: string): Promise<string[]> {
    const rolePermissions = await this.rolePermissionRepo.find({
      where: { role: role as any },
    });

    return rolePermissions.map((rp) => rp.permissionCode);
  }

  private mapToResponse(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description || null,
      module: permission.module,
      created_at: permission.createdAt,
    };
  }
}
