import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RpcController } from './rpc.controller';
import { RpcService } from './rpc.service';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';
import { UserRole } from '../users/entities/user-role.entity';
import { Profile } from '../users/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole, Profile]),
    UsersModule,
    SettingsModule
  ],
  controllers: [RpcController],
  providers: [RpcService],
})
export class RpcModule {}
