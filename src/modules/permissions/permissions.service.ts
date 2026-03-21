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
      { code: 'patients.view', name: 'Voir les patients', module: 'patients' },
      { code: 'patients.create', name: 'Créer des patients', module: 'patients' },
      { code: 'patients.edit', name: 'Modifier des patients', module: 'patients' },
      { code: 'patients.delete', name: 'Supprimer des patients', module: 'patients' },
      // Appointments
      { code: 'appointments.view', name: 'Voir les rendez-vous', module: 'appointments' },
      { code: 'appointments.create', name: 'Créer des rendez-vous', module: 'appointments' },
      { code: 'appointments.edit', name: 'Modifier des rendez-vous', module: 'appointments' },
      { code: 'appointments.delete', name: 'Supprimer des rendez-vous', module: 'appointments' },
      // Billing
      { code: 'billing.view', name: 'Voir les factures', module: 'billing' },
      { code: 'billing.create', name: 'Créer des factures', module: 'billing' },
      { code: 'billing.manage', name: 'Gérer la facturation', module: 'billing' },
      // Queue
      { code: 'queue.manage', name: 'Gérer la file d\'attente', module: 'queue' },
      { code: 'queue.view', name: 'Voir la file d\'attente', module: 'queue' },
      // Admin/Users
      { code: 'users.manage', name: 'Gérer les utilisateurs', module: 'users' },
      { code: 'settings.manage', name: 'Gérer les paramètres', module: 'settings' },
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
      // Add more specific role mappings here if needed
    }
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
