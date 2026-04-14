import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { LogQueryDto } from './dto/log-query.dto';
import { ActivityLogResponseDto } from './dto/log-response.dto';
import { Profile } from '../users/entities/profile.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private logRepo: Repository<ActivityLog>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<ActivityLogResponseDto> {
    const logData: Partial<ActivityLog> = {
      action: createLogDto.action,
      entityType: createLogDto.entity_type,
    };

    if (createLogDto.user_id) {
      logData.userId = createLogDto.user_id;
    }

    if (createLogDto.entity_id) {
      logData.entityId = createLogDto.entity_id;
    }

    if (createLogDto.entity_name) {
      logData.entityName = createLogDto.entity_name;
    }

    if (createLogDto.old_data) {
      logData.oldData = createLogDto.old_data;
    }

    if (createLogDto.new_data) {
      logData.newData = createLogDto.new_data;
    }

    if (createLogDto.metadata) {
      logData.metadata = createLogDto.metadata;
    }

    if (createLogDto.ip_address) {
      logData.ipAddress = createLogDto.ip_address;
    }

    if (createLogDto.user_agent) {
      logData.userAgent = createLogDto.user_agent;
    }

    const log = this.logRepo.create(logData);
    await this.logRepo.save(log);

    return this.findOne(log.id);
  }

  async findAll(
    query: LogQueryDto,
  ): Promise<{
    logs: ActivityLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let {
      entity_type,
      entity_id,
      user_id,
      action,
      page = 1,
      limit = 50,
      perPage,
      start,
      end,
    } = query;

    if (perPage) limit = perPage;
    const effectivePage = page <= 0 ? 1 : page;
    const skip = (effectivePage - 1) * limit;

    const whereCondition: any = {};

    if (entity_type) whereCondition.entityType = entity_type;
    if (entity_id) whereCondition.entityId = entity_id;
    if (user_id) whereCondition.userId = user_id;
    if (action) whereCondition.action = action;

    if (start && end) {
      const { Between } = require('typeorm');
      whereCondition.createdAt = Between(new Date(start), new Date(end));
    }

    const [logs, total] = await this.logRepo.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return {
      logs: logs.map((log) => this.mapToResponse(log)),
      total,
      page: effectivePage,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ActivityLogResponseDto> {
    const log = await this.logRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!log) {
      throw new NotFoundException(`Log avec l'ID ${id} non trouvé`);
    }

    return this.mapToResponse(log);
  }

  async archiveOldLogs(): Promise<{ deleted: number }> {
    const context = 'ActivityLogsArchiver';
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const { LessThan } = require('typeorm');
    const logsToDelete = await this.logRepo.count({
      where: { createdAt: LessThan(twelveMonthsAgo) },
    });

    if (logsToDelete > 0) {
      await this.logRepo.delete({
        createdAt: LessThan(twelveMonthsAgo),
      });
    }

    return { deleted: logsToDelete };
  }

  private mapToResponse(log: ActivityLog): ActivityLogResponseDto {
    const response: ActivityLogResponseDto = {
      id: log.id,
      user_id: log.userId || null,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId || null,
      entity_name: log.entityName || null,
      old_data: log.oldData,
      new_data: log.newData,
      metadata: log.metadata,
      ip_address: log.ipAddress || null,
      user_agent: log.userAgent || null,
      created_at: log.createdAt,
    };

    if (log.user) {
      response.profile = {
        id: log.user.id,
        email: log.user.email,
        first_name: log.user.first_name || null,
        last_name: log.user.last_name || null,
      };
    }

    return response;
  }
}
