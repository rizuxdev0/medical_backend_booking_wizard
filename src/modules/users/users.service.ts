import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from './entities/profile.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
  ) {}

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
