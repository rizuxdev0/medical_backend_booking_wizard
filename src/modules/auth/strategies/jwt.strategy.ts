import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { UserRole } from '../../users/entities/user-role.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.profileRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException();
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
