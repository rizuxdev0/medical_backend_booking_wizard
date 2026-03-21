import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Profile } from '../../users/entities/profile.entity';
import { UserRole } from '../../users/entities/user-role.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    console.log(`[JWT] Strategy initialized. Secret loaded: ${!!secret} (length: ${secret?.length || 0})`);
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'default-secret',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log(`[JWT] Validating payload for sub: ${payload.sub}`);
    const user = await this.profileRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      console.warn(`[JWT] User not found for id: ${payload.sub}`);
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    if (!user.is_active) {
      console.warn(`[JWT] User ${user.email} is inactive`);
      throw new UnauthorizedException('Compte inactif');
    }

    const roles = await this.roleRepo.find({
      where: { user_id: user.id },
    });

    return {
      id: user.id,
      email: user.email,
      roles: roles.map((r) => r.role),
    };
  }
}
