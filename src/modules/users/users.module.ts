import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Profile } from './entities/profile.entity';
import { UserRole } from './entities/user-role.entity';
import { Patient } from '../patients/entities/patient.entity';
import { InvitationsModule } from '../invitations/invitations.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, UserRole, Patient]),
    forwardRef(() => InvitationsModule),
    PermissionsModule,
    SettingsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
