import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from '../settings/mail.service';
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
    private mailService: MailService,
  ) {}

  async createInvitation(
    email: string,
    userId: string,
    sendEmail: boolean = true,
    tempPasswordProvided?: string,
    createdBy?: string,
  ) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tempPassword =
      tempPasswordProvided || Math.random().toString(36).slice(-10);
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

    // Send Real Email if requested
    if (sendEmail) {
      try {
        await this.mailService.sendMail({
          to: email,
          subject: 'Vérification de votre compte MedAgenda',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #0070f3; text-align: center;">Bienvenue sur MedAgenda</h2>
              <p>Votre compte a été créé. Pour l'activer, veuillez utiliser le code suivant :</p>
              <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 30px 0; color: #000;">
                ${otpCode}
              </div>
              <p><strong>Mot de passe temporaire :</strong> <code style="background: #f4f4f4; padding: 2px 5px; border-radius: 4px;">${tempPassword}</code></p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">Ce code expire dans 7 jours.</p>
            </div>
          `,
        });
        console.log(`[INVITATION] Email envoyé à ${email}`);
      } catch (err) {
        console.error(`[INVITATION] Erreur d'envoi d'email à ${email}:`, err);
      }
    }

    return { 
      message: 'Invitation créée avec succès',
      invitation_id: invitation.id,
      otpCode,
      tempPassword
    };
  }

  async verifyOtp(email: string, otpCode: string) {
    if (otpCode === 'check') {
      const invitation = await this.invitationRepo.findOne({
        where: {
          email: email.toLowerCase(),
          used: false,
          expiresAt: MoreThan(new Date()),
        },
      });

      if (!invitation) {
        throw new NotFoundException(
          "Aucune invitation en attente pour cette adresse",
        );
      }

      return {
        message: 'Invitation en attente trouvée',
        exists: true,
      };
    }

    const invitation = await this.invitationRepo.findOne({
      where: {
        email: email.toLowerCase(),
        otpCode,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!invitation) {
      throw new UnauthorizedException(
        'Code de vérification invalide ou expiré',
      );
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
