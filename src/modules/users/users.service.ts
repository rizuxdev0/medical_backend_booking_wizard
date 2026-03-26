import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from './entities/profile.entity';
import { UserRole } from './entities/user-role.entity';
import { InvitationsService } from '../invitations/invitations.service';
import { forwardRef, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SettingsService } from '../settings/settings.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RoleResponseDto } from './dto/role-response.dto';

import { DataSource } from 'typeorm';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
    private settingsService: SettingsService,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Correctif pour l'erreur de type app_role (Enum Postgres bloquant)
    try {
      console.log('--- EXECUTING DB SCHEMA FIX FOR app_role ENUM ---');
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // On convertit les colonnes en varchar manuellement pour débloquer TypeORM
      await queryRunner.query(`
        DO $$ 
        BEGIN 
          -- Fix user_roles
          BEGIN
            ALTER TABLE "user_roles" ALTER COLUMN "role" TYPE character varying(50);
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'user_roles.role already varchar'; END;
          
          -- Fix role_permissions
          BEGIN
            ALTER TABLE "role_permissions" ALTER COLUMN "role" TYPE character varying(50);
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'role_permissions.role already varchar'; END;
          
          -- Fix resources
          BEGIN
            ALTER TABLE "resources" ALTER COLUMN "type" TYPE character varying(50);
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'resources.type already varchar'; END;
          
          BEGIN
            ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT NOW();
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'resources.updated_at error'; END;

          -- Fix appointments
          BEGIN
            ALTER TABLE "appointments" ALTER COLUMN "status" TYPE character varying(50);
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'appointments.status already varchar'; END;

          -- Fix notifications
          BEGIN
            ALTER TABLE "notifications" ALTER COLUMN "status" TYPE character varying(50);
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'notifications.status already varchar'; END;

          BEGIN
            ALTER TABLE "notifications" ALTER COLUMN "type" TYPE character varying(50);
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'notifications.type already varchar'; END;
          
          -- Drop problematic types
          BEGIN DROP TYPE IF EXISTS "public"."app_role" CASCADE; EXCEPTION WHEN OTHERS THEN END;
          BEGIN DROP TYPE IF EXISTS "public"."resource_type" CASCADE; EXCEPTION WHEN OTHERS THEN END;
          BEGIN DROP TYPE IF EXISTS "public"."appointment_status" CASCADE; EXCEPTION WHEN OTHERS THEN END;
          BEGIN DROP TYPE IF EXISTS "public"."notification_status" CASCADE; EXCEPTION WHEN OTHERS THEN END;
          BEGIN DROP TYPE IF EXISTS "public"."notification_type" CASCADE; EXCEPTION WHEN OTHERS THEN END;
        END $$;
      `);

      await queryRunner.release();
      console.log('--- DB SCHEMA FIX COMPLETED ---');
    } catch (error) {
      console.warn(
        '--- DB SCHEMA FIX FAILED (Potentially already fixed) ---',
        error.message,
      );
    }

    // S'assurer que l'admin par défaut existe avec le bon mot de passe
    const passwordHash = await bcrypt.hash('Eric123456!', 10);
    const adminEmail = 'eric@gmail.com';

    const admin = await this.profileRepo.findOne({
      where: { email: adminEmail },
    });

    if (!admin) {
      console.log(`--- SEEDING DEFAULT ADMIN: ${adminEmail} ---`);
      await this.createDefaultAdmin(passwordHash);
    } else {
      console.log(`--- UPDATING ADMIN PASSWORD AND ROLES: ${adminEmail} ---`);
      await this.profileRepo.update(admin.id, {
        password_hash: passwordHash,
        is_active: true,
      });

      const adminRoleNames = [
        'admin',
        'doctor',
        'secretary',
        'patient',
        'nurse',
        'accountant',
        'supervisor',
      ];
      for (const roleName of adminRoleNames) {
        const existing = await this.roleRepo.findOne({
          where: { user_id: admin.id, role: roleName as any },
        });
        if (!existing) {
          await this.roleRepo.save(
            this.roleRepo.create({ user_id: admin.id, role: roleName as any }),
          );
        }
      }

      // Marquer le setup comme terminé
      await this.dataSource.query(`
        INSERT INTO "settings" (key, value) 
        VALUES ('setup_completed', 'true')
        ON CONFLICT (key) DO UPDATE SET value = 'true';
        
        INSERT INTO "settings" (key, value) 
        VALUES ('company', '{"name": "MedAgenda", "address": "", "phone": "", "email": "contact@medagenda.com"}')
        ON CONFLICT (key) DO NOTHING;

        INSERT INTO "settings" (key, value) 
        VALUES ('user_creation_config', '{"sendEmail": true}')
        ON CONFLICT (key) DO NOTHING;
      `);

      // S'assurer que le patient de test existe
      const patientEmail = 'patient@gmail.com';
      const patientHash = await bcrypt.hash('Patient123!', 10);
      let patient = await this.profileRepo.findOne({
        where: { email: patientEmail },
      });

      if (!patient) {
        console.log(`--- SEEDING TEST PATIENT: ${patientEmail} ---`);
        patient = await this.profileRepo.save(
          this.profileRepo.create({
            email: patientEmail,
            password_hash: patientHash,
            first_name: 'Jean',
            last_name: 'Patient',
            is_active: true,
          }),
        );
      } else {
        await this.profileRepo.update(patient.id, {
          password_hash: patientHash,
          is_active: true,
        });
      }

      const pRole = await this.roleRepo.findOne({
        where: { user_id: patient.id, role: 'patient' as any },
      });
      if (!pRole) {
        await this.roleRepo.save(
          this.roleRepo.create({ user_id: patient.id, role: 'patient' as any }),
        );
      }
    }
  }

  async findAll(
    query: UserQueryDto,
  ): Promise<{ data: UserResponseDto[]; meta: any }> {
    const where: any = {};
    if (query.active !== undefined) {
      where.is_active = query.active;
    }

    const findOptions: any = {
      where,
      skip: query.skip,
      take: query.limit,
      order: { created_at: 'DESC' },
    };

    // Gestion du champ fields=select pour alléger la réponse
    if (query.fields === 'select') {
      findOptions.select = ['id', 'first_name', 'last_name', 'email'];
    }

    const [users, total] = await this.profileRepo.findAndCount(findOptions);

    // Récupérer les rôles pour chaque utilisateur
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roles = await this.roleRepo.find({
          where: { user_id: user.id },
        });
        return this.mapToUserResponse(user, roles);
      }),
    );

    return {
      data: usersWithRoles,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.profileRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    const roles = await this.roleRepo.find({
      where: { user_id: user.id },
    });

    return this.mapToUserResponse(user, roles);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.profileRepo.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    // Créer l'utilisateur - UTILISER LES NOMS DE COLONNES EXACTS
    const userData: Partial<Profile> = {
      email: createUserDto.email,
      password_hash: passwordHash,
    };

    if (createUserDto.first_name)
      userData.first_name = createUserDto.first_name;
    if (createUserDto.last_name) userData.last_name = createUserDto.last_name;
    if (createUserDto.phone) userData.phone = createUserDto.phone;
    if (createUserDto.department)
      userData.department = createUserDto.department;
    if (createUserDto.job_title) userData.job_title = createUserDto.job_title;
    if (createUserDto.employee_id)
      userData.employee_id = createUserDto.employee_id;
    if (createUserDto.notes !== undefined) userData.notes = createUserDto.notes;
    if (createUserDto.is_active !== undefined)
      userData.is_active = createUserDto.is_active;

    const user = this.profileRepo.create(userData);
    await this.profileRepo.save(user);

    // Ajouter les rôles
    const rolesToAdd = createUserDto.roles?.length
      ? createUserDto.roles
      : ['patient'];

    const roles: UserRole[] = [];

    for (const roleName of rolesToAdd) {
      const role = this.roleRepo.create({
        user_id: user.id,
        role: roleName as any,
      });
      await this.roleRepo.save(role);
      roles.push(role);
    }

    // Récupérer la configuration pour savoir s'il faut envoyer l'email
    let sendEmail = true;
    try {
      const config = await this.settingsService.findOne('user_creation_config');
      sendEmail = config.value?.sendEmail !== false;
    } catch (e) {
      // Si le paramètre n'existe pas, on envoie par défaut
    }

    // Créer une invitation si l'utilisateur n'est pas déjà actif (ex: créé par admin)
    // Sauf si c'est un patient (qui s'inscrit lui-même typiquement, mais ici c'est admin-driven)
    const invitation = await this.invitationsService.createInvitation(
      user.email,
      user.id,
      sendEmail,
    );

    return this.mapToUserResponse(
      user,
      roles,
      invitation.tempPassword,
      invitation.otpCode,
    );
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.profileRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.profileRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
    }

    // Préparer les données de mise à jour - UTILISER LES NOMS DE COLONNES EXACTS
    const updateData: Partial<Profile> = {};

    if (updateUserDto.email !== undefined)
      updateData.email = updateUserDto.email;
    if (updateUserDto.first_name !== undefined)
      updateData.first_name = updateUserDto.first_name;
    if (updateUserDto.last_name !== undefined)
      updateData.last_name = updateUserDto.last_name;
    if (updateUserDto.phone !== undefined)
      updateData.phone = updateUserDto.phone;
    if (updateUserDto.department !== undefined)
      updateData.department = updateUserDto.department;
    if (updateUserDto.job_title !== undefined)
      updateData.job_title = updateUserDto.job_title;
    if (updateUserDto.employee_id !== undefined)
      updateData.employee_id = updateUserDto.employee_id;
    if (updateUserDto.notes !== undefined)
      updateData.notes = updateUserDto.notes;
    if (updateUserDto.is_active !== undefined)
      updateData.is_active = updateUserDto.is_active;

    // Mettre à jour l'utilisateur
    if (Object.keys(updateData).length > 0) {
      await this.profileRepo.update(id, updateData);
    }

    // Mettre à jour les rôles si fournis
    if (updateUserDto.roles) {
      // Supprimer les rôles existants
      await this.roleRepo.delete({ user_id: id });

      // Ajouter les nouveaux rôles
      if (updateUserDto.roles.length > 0) {
        const newRoles = updateUserDto.roles.map((role) =>
          this.roleRepo.create({
            user_id: id,
            role: role as any,
          }),
        );
        await this.roleRepo.save(newRoles);
      }
    }

    // Récupérer l'utilisateur mis à jour avec ses rôles
    const updatedUser = await this.profileRepo.findOne({
      where: { id },
    });
    if (!updatedUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    const roles = await this.roleRepo.find({
      where: { user_id: id },
    });

    return this.mapToUserResponse(updatedUser, roles);
  }

  async resetPassword(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    // 1. Trouver l'utilisateur avec profileRepo (pas usersRepository)
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // 2. Réutiliser le système d'invitation existant pour générer un nouveau mot de passe
    const invitation = await this.invitationsService.createInvitation(
      user.email,
      user.id,
      true, // sendEmail = true → envoie l'email automatiquement
    );

    return {
      success: true,
      message: `Email de réinitialisation envoyé à ${user.email}`,
    };
  }

  async addRole(id: string, roleName: string): Promise<RoleResponseDto> {
    const user = await this.profileRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Vérifier si le rôle existe déjà
    const existingRole = await this.roleRepo.findOne({
      where: { user_id: id, role: roleName as any },
    });

    if (existingRole) {
      throw new BadRequestException(`L'utilisateur a déjà le rôle ${roleName}`);
    }

    const role = this.roleRepo.create({
      user_id: id,
      role: roleName as any,
    });

    await this.roleRepo.save(role);

    return {
      id: role.id,
      user_id: role.user_id,
      role: role.role,
    };
  }

  async removeRole(id: string, roleName: string): Promise<{ message: string }> {
    const user = await this.profileRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Ne pas permettre de supprimer le dernier rôle
    const roles = await this.roleRepo.find({
      where: { user_id: id },
    });

    if (roles.length <= 1) {
      throw new BadRequestException(
        'Un utilisateur doit avoir au moins un rôle',
      );
    }

    const role = await this.roleRepo.findOne({
      where: { user_id: id, role: roleName as any },
    });

    if (!role) {
      throw new NotFoundException(
        `Rôle ${roleName} non trouvé pour cet utilisateur`,
      );
    }

    await this.roleRepo.remove(role);

    return { message: `Rôle ${roleName} supprimé avec succès` };
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.profileRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    await this.profileRepo.update(id, { is_active: false });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.profileRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    await this.profileRepo.delete(id);
    return { message: 'Utilisateur supprimé avec succès' };
  }

  async adminExists(): Promise<boolean> {
    const adminRole = await this.roleRepo.findOne({
      where: { role: 'admin' as any },
    });
    return !!adminRole;
  }

  async bootstrapFirstAdmin(userId: string): Promise<boolean> {
    // Vérifier si l'utilisateur existe
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si le rôle admin existe déjà pour CET utilisateur
    const existingRole = await this.roleRepo.findOne({
      where: { user_id: userId, role: 'admin' as any },
    });

    if (existingRole) {
      return true; // Déjà admin
    }

    // Ajouter TOUS les rôles administratifs pour un nouveau "Super Admin"
    const adminRoleNames = [
      'admin',
      'doctor',
      'secretary',
      'patient',
      'nurse',
      'accountant',
      'supervisor',
    ];

    for (const roleName of adminRoleNames) {
      const exists = await this.roleRepo.findOne({
        where: { user_id: userId, role: roleName as any },
      });
      if (!exists) {
        await this.roleRepo.save(
          this.roleRepo.create({
            user_id: userId,
            role: roleName as any,
          }),
        );
      }
    }

    return true;
  }

  async createDefaultAdmin(forcedHash?: string): Promise<UserResponseDto> {
    const passwordHash = forcedHash || (await bcrypt.hash('Eric123456!', 12));

    const admin = this.profileRepo.create({
      email: 'eric@gmail.com',
      password_hash: passwordHash,
      first_name: 'Eric',
      last_name: 'Admin',
      is_active: true,
    });

    await this.profileRepo.save(admin);

    const adminRoleNames = [
      'admin',
      'doctor',
      'secretary',
      'patient',
      'nurse',
      'accountant',
      'supervisor',
    ];
    const roles: UserRole[] = [];

    for (const roleName of adminRoleNames) {
      const role = this.roleRepo.create({
        user_id: admin.id,
        role: roleName as any,
      });
      await this.roleRepo.save(role);
      roles.push(role);
    }

    console.log(
      `ADMIN CREATED: eric@gmail.com / Eric123456! with roles: ${adminRoleNames.join(', ')}`,
    );
    return this.mapToUserResponse(admin, roles);
  }

  async ensureInitialized(userId: string, email: string): Promise<void> {
    const user = await this.profileRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      // Créer un profil de base si inexistant (pour auth externe comme Supabase)
      const newUser = this.profileRepo.create({
        id: userId,
        email: email,
        password_hash: 'EXTERNAL_AUTH', // Mot de passe bidon car géré en amont
        is_active: true,
      });
      await this.profileRepo.save(newUser);
    }
  }

  private sanitizeUser(user: Profile): Omit<Profile, 'password_hash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...rest } = user;
    return rest;
  }

  private mapToUserResponse(
    user: Profile,
    roles: UserRole[],
    tempPassword?: string,
    otpCode?: string,
  ): UserResponseDto {
    const sanitizedUser = this.sanitizeUser(user);
    return {
      ...sanitizedUser,
      roles: roles.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
      })),
      temp_password: tempPassword,
      otp_code: otpCode,
    };
  }
}
