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
const { authenticator } = require('otplib');
import * as qrcode from 'qrcode';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: { email: string; password: string; code?: string }) {
    console.log(`[AUTH] Login attempt for email: ${loginDto.email}`);
    const user = await this.profileRepo.findOne({
      where: { email: loginDto.email.toLowerCase().trim() },
    });

    if (!user) {
      console.warn(`[AUTH] User not found: ${loginDto.email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password_hash);
    console.log(`[AUTH] Password match for ${user.email}: ${isMatch}`);

    if (!isMatch) {
      console.warn(`[AUTH] Password MISMATCH for ${user.email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.is_two_factor_enabled) {
      if (!loginDto.code) {
        return { requiresTwoFactor: true, email: user.email };
      }
      const isCodeValid = authenticator.verify({
        token: loginDto.code,
        secret: user.two_factor_secret,
      });

      if (!isCodeValid) {
        throw new UnauthorizedException('Code 2FA invalide');
      }
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

    // Create a corresponding patient record if role is 'patient'
    const patientRecord = this.patientRepo.create({
      firstName: firstName || 'Patient',
      lastName: lastName || 'New',
      email: email,
      userId: user.id,
    });
    const savedPatient = await this.patientRepo.save(patientRecord);

    // Link the patient ID to the profile
    await this.profileRepo.update(user.id, { patient_id: savedPatient.id });

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

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) {
      console.warn(`[AUTH] verifyPassword: User ${userId} not found`);
      return false;
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log(`[AUTH] verifyPassword for ${user.email}: ${isValid}`);
    return isValid;
  }

  async updateProfile(userId: string, data: { first_name?: string; last_name?: string; phone?: string }) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    await this.profileRepo.update(userId, data);
    
    // If user is a patient, sync some info to patient table if needed
    if (user.patient_id) {
       await this.patientRepo.update(user.patient_id, {
         firstName: data.first_name || user.first_name,
         lastName: data.last_name || user.last_name,
         phone: data.phone || user.phone
       });
    }

    return this.getProfile(userId);
  }

  async changePassword(userId: string, data: { current: string; new: string }) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const isMatch = await bcrypt.compare(data.current, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Mot de passe actuel incorrect');

    const passwordHash = await bcrypt.hash(data.new, 12);
    await this.profileRepo.update(userId, { password_hash: passwordHash });

    return { message: 'Mot de passe mis à jour avec succès' };
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'MedAgenda', secret);

    await this.profileRepo.update(userId, { two_factor_secret: secret });

    return {
      secret,
      qrCodeUrl: await qrcode.toDataURL(otpauthUrl),
    };
  }

  async turnOnTwoFactorAuth(userId: string, code: string) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (!user.two_factor_secret) {
      throw new UnauthorizedException('Secret 2FA non généré');
    }

    const isCodeValid = authenticator.verify({
      token: code,
      secret: user.two_factor_secret,
    });

    if (!isCodeValid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    await this.profileRepo.update(userId, { is_two_factor_enabled: true });
    return { message: '2FA activé avec succès' };
  }

  async turnOffTwoFactorAuth(userId: string, code: string) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const isCodeValid = authenticator.verify({
      token: code,
      secret: user.two_factor_secret,
    });

    if (!isCodeValid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    await this.profileRepo.update(userId, {
      is_two_factor_enabled: false,
      two_factor_secret: null as any,
    });
    return { message: '2FA désactivé avec succès' };
  }

  private sanitizeUser(user: Profile) {
    const { password_hash, two_factor_secret, ...rest } = user;
    return rest;
  }
}
