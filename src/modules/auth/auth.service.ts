// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { Profile } from '../users/entities/profile.entity';
// import { UserRole } from '../users/entities/user-role.entity';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(Profile)
//     private profileRepo: Repository<Profile>,
//     @InjectRepository(UserRole)
//     private roleRepo: Repository<UserRole>,
//     private jwtService: JwtService,
//   ) {}

//   async login(email: string, password: string) {
//     const user = await this.profileRepo.findOne({
//       where: { email },
//     });

//     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
//       throw new UnauthorizedException('Email ou mot de passe incorrect');
//     }

//     const roles = await this.roleRepo.find({
//       where: { user_id: user.id },
//     });

//     const token = this.jwtService.sign({
//       sub: user.id,
//       email: user.email,
//     });

//     // Update last login
//     await this.profileRepo.update(user.id, { last_login_at: new Date() });

//     return {
//       user: this.sanitizeUser(user),
//       roles: roles.map((r) => ({
//         id: r.id,
//         user_id: r.user_id,
//         role: r.role,
//       })),
//       token,
//     };
//   }

//   async register(
//     email: string,
//     password: string,
//     firstName?: string,
//     lastName?: string,
//   ) {
//     const exists = await this.profileRepo.findOne({
//       where: { email },
//     });

//     if (exists) {
//       throw new UnauthorizedException('Cet email est déjà utilisé');
//     }

//     const passwordHash = await bcrypt.hash(password, 12);

//     const user = this.profileRepo.create({
//       email,
//       password_hash: passwordHash,
//       first_name: firstName || null,
//       last_name: lastName || null,
//     });

//     await this.profileRepo.save(user);

//     // Default role: patient
//     const role = this.roleRepo.create({
//       user_id: user.id,
//       role: 'patient',
//     });

//     await this.roleRepo.save(role);

//     const token = this.jwtService.sign({
//       sub: user.id,
//       email: user.email,
//     });

//     return {
//       user: this.sanitizeUser(user),
//       roles: [
//         {
//           id: role.id,
//           user_id: role.user_id,
//           role: role.role,
//         },
//       ],
//       token,
//     };
//   }

//   async getProfile(userId: string) {
//     const user = await this.profileRepo.findOne({
//       where: { id: userId },
//     });

//     if (!user) {
//       throw new UnauthorizedException();
//     }

//     const roles = await this.roleRepo.find({
//       where: { user_id: userId },
//     });

//     return {
//       user: this.sanitizeUser(user),
//       roles: roles.map((r) => ({
//         id: r.id,
//         user_id: r.user_id,
//         role: r.role,
//       })),
//     };
//   }

//   private sanitizeUser(user: Profile) {
//     const { password_hash, ...rest } = user;
//     return rest;
//   }
// }
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.profileRepo.findOne({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const roles = await this.roleRepo.find({
      where: { user_id: user.id },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    // Update last login
    await this.profileRepo.update(user.id, { last_login_at: new Date() });

    return {
      user: this.sanitizeUser(user),
      roles: roles.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
      })),
      token,
    };
  }

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) {
    const exists = await this.profileRepo.findOne({
      where: { email },
    });

    if (exists) {
      throw new UnauthorizedException('Cet email est déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'objet user avec les noms de colonnes corrects
    const userData: Partial<Profile> = {
      email,
      password_hash: passwordHash,
    };

    if (firstName) userData.first_name = firstName;
    if (lastName) userData.last_name = lastName;

    const user = this.profileRepo.create(userData);
    await this.profileRepo.save(user);

    // Default role: patient
    const role = this.roleRepo.create({
      user_id: user.id,
      role: 'patient',
    });

    await this.roleRepo.save(role);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      roles: [
        {
          id: role.id,
          user_id: role.user_id,
          role: role.role,
        },
      ],
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.profileRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const roles = await this.roleRepo.find({
      where: { user_id: userId },
    });

    return {
      user: this.sanitizeUser(user),
      roles: roles.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
      })),
    };
  }

  private sanitizeUser(user: Profile) {
    const { password_hash, ...rest } = user;
    return rest;
  }
}
