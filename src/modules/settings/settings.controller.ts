import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MailerService } from '@nestjs-modules/mailer';
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
  constructor(
    private readonly settingsService: SettingsService,
    private readonly mailerService: MailerService,
  ) {}

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

  @Post('test-email')
  @Roles('admin')
  @ApiOperation({ summary: 'Envoyer un email de test' })
  async testEmail(@Body() body: { to: string }): Promise<{ message: string }> {
    await this.mailerService.sendMail({
      to: body.to,
      subject: 'Email De Test - MedAgenda',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #0070f3; text-align: center;">Test de configuration SMTP</h2>
          <p>Ceci est un email de test envoyé depuis votre application <strong>MedAgenda</strong>.</p>
          <p>Si vous recevez cet email, c'est que votre configuration SMTP est correcte !</p>
          <hr />
          <p style="font-size: 12px; color: #666; text-align: center;">Envoyé le ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      `,
    });
    return { message: 'Email de test envoyé avec succès' };
  }

  @Put(':key')
  @Roles('admin')
  @ApiOperation({ summary: 'Mettre à jour un paramètre par sa clé' })
  upsert(
    @Param('key') key: string,
    @Body() settingDto: SettingDto,
  ): Promise<SettingResponseDto> {
    settingDto.key = key;
    return this.settingsService.upsert(settingDto);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer ou mettre à jour un paramètre' })
  upsertRoot(
    @Body() settingDto: SettingDto,
  ): Promise<SettingResponseDto> {
    return this.settingsService.upsert(settingDto);
  }

  @Delete(':key')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un paramètre' })
  delete(@Param('key') key: string): Promise<{ message: string }> {
    return this.settingsService.delete(key);
  }
}
