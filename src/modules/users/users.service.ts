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
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
  ) {}

  async onModuleInit() {
    const admin = await this.profileRepo.findOne({ where: { email: 'eric@gmail.com' } });
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Eric123456!', salt);

    if (!admin) {
      console.log('--- SEEDING INITIAL ADMIN: eric@gmail.com ---');
      await this.createDefaultAdmin(passwordHash);
    } else {
      console.log('--- RESETTING ADMIN PASSWORD: eric@gmail.com ---');
      await this.profileRepo.update(admin.id, { password_hash: passwordHash });
    }
  }

  async findAll(
    query: PaginationDto,
  ): Promise<{ data: UserResponseDto[]; meta: any }> {
    const [users, total] = await this.profileRepo.findAndCount({
      skip: query.skip,
      take: query.limit,
      order: { created_at: 'DESC' },
    });

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

    // Créer une invitation si l'utilisateur n'est pas déjà actif (ex: créé par admin)
    // Sauf si c'est un patient (qui s'inscrit lui-même typiquement, mais ici c'est admin-driven)
    await this.invitationsService.createInvitation(user.email, user.id);

    return this.mapToUserResponse(user, roles);
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

    // Mettre à jour l'utilisateur
    if (Object.keys(updateData).length > 0) {
      await this.profileRepo.update(id, updateData);
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

  async adminExists(): Promise<boolean> {
    const adminRole = await this.roleRepo.findOne({
      where: { role: 'admin' as any },
    });
    return !!adminRole;
  }

  async bootstrapFirstAdmin(userId: string): Promise<boolean> {
    // Vérifier si un admin existe déjà
    const exists = await this.adminExists();
    if (exists) {
      throw new BadRequestException('Un administrateur existe déjà');
    }

    // Ajouter le rôle admin à l'utilisateur
    const role = this.roleRepo.create({
      user_id: userId,
      role: 'admin' as any,
    });
    await this.roleRepo.save(role);
    return true;
  }

  async createDefaultAdmin(forcedHash?: string): Promise<UserResponseDto> {
    const passwordHash = forcedHash || await bcrypt.hash('Eric123456!', 12);

    const admin = this.profileRepo.create({
      email: 'eric@gmail.com',
      password_hash: passwordHash,
      first_name: 'Eric',
      last_name: 'Admin',
      is_active: true,
    });

    await this.profileRepo.save(admin);

    const adminRoleNames = ['admin', 'doctor', 'secretary', 'patient', 'nurse', 'accountant', 'supervisor'];
    const roles: UserRole[] = [];

    for (const roleName of adminRoleNames) {
      const role = this.roleRepo.create({
        user_id: admin.id,
        role: roleName as any,
      });
      await this.roleRepo.save(role);
      roles.push(role);
    }

    console.log(`ADMIN CREATED: eric@gmail.com / Eric123456! with roles: ${adminRoleNames.join(', ')}`);
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

  private mapToUserResponse(user: Profile, roles: UserRole[]): UserResponseDto {
    const sanitizedUser = this.sanitizeUser(user);
    return {
      ...sanitizedUser,
      roles: roles.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
      })),
    };
  }
}
