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
import { Repository, In } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { UserRole, AppRole } from '../users/entities/user-role.entity';
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
    @InjectRepository(UserPermission)
    private userPermissionRepo: Repository<UserPermission>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
  ) {}

  async onModuleInit() {
    console.log('--- SYNCING PERMISSIONS ---');
    await this.seedDefaultPermissions();
  }

  private async seedDefaultPermissions() {
    const defaultPermissions = [
      // Patients (Staff view)
      { code: 'patients.view', name: 'Voir dossiers patients', module: 'patients' },
      { code: 'patients.create', name: 'Créer dossier patient', module: 'patients' },
      { code: 'patients.edit', name: 'Modifier dossier patient', module: 'patients' },
      { code: 'patients.delete', name: 'Supprimer dossier patient', module: 'patients' },
      { code: 'patients.documents', name: 'Gérer documents dossiers', module: 'patients' },

      // Portal Patient (Actions a patient can do for themselves)
      { code: 'patient.dashboard.view', name: 'Voir mon tableau de bord', module: 'patient_portal' },
      { code: 'patient.appointments.view', name: 'Voir mes rendez-vous', module: 'patient_portal' },
      { code: 'patient.appointments.create', name: 'Prendre un rendez-vous', module: 'patient_portal' },
      { code: 'patient.consultations.view', name: 'Voir mes comptes-rendus', module: 'patient_portal' },
      { code: 'patient.documents.view', name: 'Voir mes documents médicaux', module: 'patient_portal' },
      { code: 'patient.billing.view', name: 'Voir mes factures', module: 'patient_portal' },
      { code: 'patient.profile.view', name: 'Voir mes informations personnelles', module: 'patient_portal' },
      { code: 'patient.profile.edit', name: 'Modifier mon profil', module: 'patient_portal' },
      { code: 'patient.practitioners.view', name: 'Voir mes praticiens habituels', module: 'patient_portal' },

      // Appointments (Staff)
      { code: 'appointments.view', name: 'Voir planning clinique', module: 'appointments' },
      { code: 'appointments.create', name: 'Créer RDV clinique', module: 'appointments' },
      { code: 'appointments.edit', name: 'Modifier RDV clinique', module: 'appointments' },
      { code: 'appointments.delete', name: 'Annuler RDV clinique', module: 'appointments' },
      { code: 'appointments.close', name: 'Clôturer RDV', module: 'appointments' },

      // Practitioners (Staff)
      { code: 'practitioners.view', name: 'Voir praticiens', module: 'practitioners' },
      { code: 'practitioners.create', name: 'Créer praticien', module: 'practitioners' },
      { code: 'practitioners.edit', name: 'Modifier praticien', module: 'practitioners' },
      { code: 'practitioners.delete', name: 'Supprimer praticien', module: 'practitioners' },

      // Queue (Staff)
      { code: 'queue.view', name: 'Voir file d\'attente', module: 'queue' },
      { code: 'queue.manage', name: 'Gérer file d\'attente', module: 'queue' },
      { code: 'practitioner.dashboard', name: 'Accès Bureau du Praticien', module: 'clinical' },

      // Pharmacy & Laboratory
      { code: 'pharmacy.view', name: 'Voir Pharmacie', module: 'pharmacy' },
      { code: 'laboratory.view', name: 'Voir Laboratoire', module: 'laboratory' },

      // Billing (Staff)
      { code: 'billing.view', name: 'Voir facturation clinique', module: 'billing' },
      { code: 'billing.create', name: 'Générer facture', module: 'billing' },
      { code: 'billing.edit', name: 'Modifier facture', module: 'billing' },
      { code: 'billing.delete', name: 'Supprimer facture', module: 'billing' },
      { code: 'payments.view', name: 'Voir flux paiements', module: 'billing' },
      { code: 'payments.create', name: 'Enregistrer un paiement', module: 'billing' },

      // Settings & Setup
      { code: 'settings.view', name: 'Voir paramètres globaux', module: 'settings' },
      { code: 'settings.edit', name: 'Gérer configuration système', module: 'settings' },
      { code: 'users.view', name: 'Gérer utilisateurs & accès', module: 'users' },
      { code: 'users.manage_roles', name: 'Modifier rôles et permissions', module: 'users' },

      // Reports & Tools
      { code: 'reports.view', name: 'Voir statistiques d\'activité', module: 'reports' },
      { code: 'audit.view', name: 'Consulter logs d\'audit', module: 'audit' },
      { code: 'resources.manage', name: 'Gérer ressources matérielles', module: 'resources' },
      { code: 'checkout.manage', name: 'Gérer la caisse physique', module: 'checkout' },
      { code: 'chat.view', name: 'Utiliser la messagerie interne', module: 'chat' },
    ];

    for (const p of defaultPermissions) {
      const existing = await this.permissionRepo.findOne({ where: { code: p.code } });
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(p));
      }
    }

    // Role -> Permissions Mapping
    const rolePermissions: Record<AppRole, string[]> = {
      admin: defaultPermissions.map(p => p.code),
      patient: [
        'patient.dashboard.view',
        'patient.appointments.view',
        'patient.appointments.create',
        'patient.consultations.view',
        'patient.documents.view',
        'patient.billing.view',
        'patient.profile.view',
        'patient.profile.edit',
        'patient.practitioners.view',
      ],
      doctor: [
        'patients.view', 'patients.edit', 'patients.documents',
        'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.close',
        'practitioners.view', 'queue.view', 'queue.manage',
        'billing.view', 'chat.view', 'reports.view',
        'practitioner.dashboard', 'pharmacy.view', 'laboratory.view'
      ],
      secretary: [
        'patients.view', 'patients.create', 'patients.edit', 'patients.documents',
        'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.delete',
        'practitioners.view', 'queue.view', 'queue.manage',
        'billing.view', 'billing.create', 'payments.create', 'checkout.manage',
        'chat.view', 'pharmacy.view', 'laboratory.view'
      ],
      nurse: [
        'patients.view', 'patients.documents', 'appointments.view', 'queue.view', 'chat.view'
      ],
      accountant: [
        'billing.view', 'billing.create', 'billing.edit', 'payments.view', 'payments.create', 'reports.view'
      ],
      supervisor: [
        'patients.view', 'appointments.view', 'practitioners.view', 'billing.view', 'reports.view', 'audit.view'
      ]
    };

    for (const [role, codes] of Object.entries(rolePermissions)) {
      for (const code of codes) {
        const existing = await this.rolePermissionRepo.findOne({ 
          where: { role: role as any, permissionCode: code } 
        });
        if (!existing) {
          await this.rolePermissionRepo.save(this.rolePermissionRepo.create({
            role: role as any,
            permissionCode: code
          }));
        }
      }
    }
  }

  async getConsolidatedUserPermissions(userId: string): Promise<string[]> {
    // 1. Get user roles
    const userRoles = await this.userRoleRepo.find({ where: { user_id: userId } });
    const roles = userRoles.map(ur => ur.role);

    if (roles.includes('admin')) {
      return (await this.findAllPermissions()).map(p => p.code);
    }

    // 2. Get permissions from roles
    const rolePerms = await this.rolePermissionRepo.find({
      where: { role: In(roles as any[]) }
    });
    const consolidated = new Set<string>(rolePerms.map(rp => rp.permissionCode));

    // 3. Apply direct user overrides (Extra Permissions)
    const directPerms = await this.userPermissionRepo.find({ where: { userId } });
    for (const dp of directPerms) {
      if (dp.is_granted) {
        consolidated.add(dp.permissionCode);
      } else {
        consolidated.delete(dp.permissionCode);
      }
    }

    return Array.from(consolidated);
  }

  async getUserDirectPermissions(userId: string): Promise<UserPermission[]> {
    return this.userPermissionRepo.find({
      where: { userId },
      relations: ['permission'],
    });
  }

  async assignUserPermission(userId: string, permissionCode: string, is_granted: boolean): Promise<UserPermission> {
    const permission = await this.permissionRepo.findOne({ where: { code: permissionCode } });
    if (!permission) throw new NotFoundException(`Permission ${permissionCode} non trouvée`);

    let userPerm = await this.userPermissionRepo.findOne({ where: { userId, permissionCode } });
    if (userPerm) {
      userPerm.is_granted = is_granted;
    } else {
      userPerm = this.userPermissionRepo.create({ userId, permissionCode, is_granted });
    }

    return this.userPermissionRepo.save(userPerm);
  }

  async removeUserPermission(userId: string, permissionCode: string): Promise<void> {
    await this.userPermissionRepo.delete({ userId, permissionCode });
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
