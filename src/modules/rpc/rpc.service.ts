import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SettingsService } from '../settings/settings.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../users/entities/user-role.entity';
import { Profile } from '../users/entities/profile.entity';

@Injectable()
export class RpcService {
  private readonly logger = new Logger(RpcService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
    @InjectRepository(UserRole)
    private readonly roleRepo: Repository<UserRole>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async isSetupCompleted(): Promise<boolean> {
    const adminExists = await this.usersService.adminExists();
    if (!adminExists) return false;

    // Si l'admin eric@gmail.com existe, on considère souvent le setup comme "avancé"
    // On vérifie quand même le flag ou la présence d'un nom de compagnie
    const setupSetting = await this.settingsService.findOne('setup_completed').catch(() => null);
    if (setupSetting?.value === true) return true;

    const company = await this.settingsService.findOne('company').catch(() => null);
    if (company && company.value && company.value.name) {
      return true;
    }

    return false;
  }


  async getSystemStatus() {
    const adminExists = await this.usersService.adminExists();
    const setupCompleted = await this.isSetupCompleted();
    const userCount = await this.profileRepo.count();
    
    return {
      adminExists,
      setupCompleted,
      userCount,
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }

  async completeSetup() {
    await this.settingsService.upsert({ key: 'setup_completed', value: true });
    this.logger.log('🏁 Initial Setup marked as completed.');
    return { success: true };
  }
}
