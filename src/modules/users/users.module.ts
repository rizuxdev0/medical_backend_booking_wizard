import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Profile } from './entities/profile.entity';
import { UserRole } from './entities/user-role.entity';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, UserRole]),
    forwardRef(() => InvitationsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
