import { Module } from '@nestjs/common';
import { RpcController } from './rpc.controller';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [UsersModule, SettingsModule],
  controllers: [RpcController],
})
export class RpcModule {}
