import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { SettingDto, SettingResponseDto } from './dto/setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Récupérer tous les paramètres' })
  findAll(): Promise<SettingResponseDto[]> {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Récupérer un paramètre par sa clé' })
  findOne(@Param('key') key: string): Promise<SettingResponseDto> {
    return this.settingsService.findOne(key);
  }

  @Put(':key')
  @Roles('admin')
  @ApiOperation({ summary: 'Créer ou mettre à jour un paramètre' })
  upsert(
    @Param('key') key: string,
    @Body() settingDto: SettingDto,
  ): Promise<SettingResponseDto> {
    settingDto.key = key;
    return this.settingsService.upsert(settingDto);
  }

  @Delete(':key')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un paramètre' })
  delete(@Param('key') key: string): Promise<{ message: string }> {
    return this.settingsService.delete(key);
  }
}
