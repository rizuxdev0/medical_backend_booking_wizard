import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { UserInvitation } from '../users/entities/user-invitation.entity';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserInvitation,
      Profile,
      UserRole,
    ]),
    SettingsModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
