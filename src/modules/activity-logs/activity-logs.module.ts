import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { Profile } from '../users/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog, Profile])],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
