import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { SettingDto, SettingResponseDto } from './dto/setting.dto';

const SENSITIVE_KEYS = ['email_config', 'smtp_pass', 'smtp_user', 'smtp_host'];

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepo: Repository<Setting>,
  ) {}

  async findAll(filterSensitive: boolean = false): Promise<SettingResponseDto[]> {
    const settings = await this.settingsRepo.find({
      order: { key: 'ASC' },
    });
    
    let filtered = settings;
    if (filterSensitive) {
      filtered = settings.filter(s => !SENSITIVE_KEYS.includes(s.key.toLowerCase()));
    }
    
    return filtered.map((s) => this.mapToResponse(s));
  }

  async findOne(key: string): Promise<SettingResponseDto> {
    const setting = await this.settingsRepo.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Paramètre avec la clé ${key} non trouvé`);
    }

    return this.mapToResponse(setting);
  }

  async upsert(settingDto: SettingDto): Promise<SettingResponseDto> {
    const existing = await this.settingsRepo.findOne({
      where: { key: settingDto.key },
    });

    if (existing) {
      // Mettre à jour le paramètre existant
      await this.settingsRepo.update(existing.id, {
        value: settingDto.value,
      });

      // Récupérer le paramètre mis à jour
      const updated = await this.settingsRepo.findOne({
        where: { id: existing.id },
      });

      if (!updated) {
        throw new NotFoundException(
          `Paramètre avec l'ID ${existing.id} non trouvé après mise à jour`,
        );
      }

      return this.mapToResponse(updated);
    } else {
      // Créer un nouveau paramètre
      const setting = this.settingsRepo.create({
        key: settingDto.key,
        value: settingDto.value,
      });
      await this.settingsRepo.save(setting);
      return this.mapToResponse(setting);
    }
  }

  async delete(key: string): Promise<{ message: string }> {
    const setting = await this.settingsRepo.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Paramètre avec la clé ${key} non trouvé`);
    }

    await this.settingsRepo.remove(setting);
    return { message: `Paramètre ${key} supprimé avec succès` };
  }

  private mapToResponse(setting: Setting): SettingResponseDto {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      created_at: setting.createdAt,
      updated_at: setting.updatedAt,
    };
  }
}
