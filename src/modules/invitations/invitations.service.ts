import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserInvitation } from '../users/entities/user-invitation.entity';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(UserInvitation)
    private invitationRepo: Repository<UserInvitation>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
  ) {}

  async createInvitation(email: string, userId: string, createdBy?: string) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tempPassword = Math.random().toString(36).slice(-10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24 * 7); // 7 days

    const invitation = this.invitationRepo.create({
      email: email.toLowerCase(),
      userId,
      otpCode,
      tempPassword,
      expiresAt,
      createdBy,
    });

    await this.invitationRepo.save(invitation);

    // MOCK: Send email here. In dev, log to console.
    console.log(`[INVITATION] Code for ${email}: ${otpCode}. Temp password: ${tempPassword}`);

    return { message: 'Invitation créée avec succès', invitation_id: invitation.id };
  }

  async verifyOtp(email: string, otpCode: string) {
    const invitation = await this.invitationRepo.findOne({
      where: {
        email: email.toLowerCase(),
        otpCode,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!invitation) {
      throw new UnauthorizedException('Code de vérification invalide ou expiré');
    }

    return {
      message: 'Code vérifié avec succès',
      userId: invitation.userId,
      tempPassword: invitation.tempPassword,
    };
  }

  async activateAccount(email: string, otpCode: string, newPassword: string) {
    const invitation = await this.invitationRepo.findOne({
      where: {
        email: email.toLowerCase(),
        otpCode,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['profile'],
    });

    if (!invitation) {
      throw new UnauthorizedException('Activation impossible : invitation non trouvée ou expirée');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.profileRepo.update(invitation.userId, {
      password_hash: passwordHash,
      is_active: true,
    });

    await this.invitationRepo.update(invitation.id, { used: true });

    return { message: 'Compte activé avec succès' };
  }
}
