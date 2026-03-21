import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { LogQueryDto } from './dto/log-query.dto';
import { ActivityLogResponseDto } from './dto/log-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('activity-logs')
@ApiBearerAuth()
@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: "Liste des logs d'activité" })
  findAll(
    @Query() query: LogQueryDto,
  ): Promise<{
    logs: ActivityLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.activityLogsService.findAll(query);
  }


  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: "Détail d'un log" })
  findOne(@Param('id') id: string): Promise<ActivityLogResponseDto> {
    return this.activityLogsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un log (usage interne)' })
  create(@Body() createLogDto: CreateLogDto): Promise<ActivityLogResponseDto> {
    return this.activityLogsService.create(createLogDto);
  }
}
