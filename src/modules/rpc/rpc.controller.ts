import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { SettingsService } from '../settings/settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('rpc')
@Controller('rpc')
export class RpcController {
  constructor(
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('admin-exists')
  @ApiOperation({ summary: 'Vérifier si un admin existe' })
  async adminExists() {
    const exists = await this.usersService.adminExists();
    return { result: exists };
  }

  @Get('is-setup-completed')
  @ApiOperation({ summary: 'Vérifier si le setup est terminé' })
  async setupCompleted() {
    // 1. Check if an admin user actually exists
    const adminExists = await this.usersService.adminExists();
    if (!adminExists) return { completed: false };

    // 2. Check if setup_completed flag is set in settings
    const setupStep = await this.settingsService.findOne('setup_completed').catch(() => null);
    if (setupStep && setupStep.value === true) {
      return { completed: true };
    }

    // Default to true if admin exists but setting is missing (legacy)
    return { completed: adminExists };
  }

  @Post('bootstrap-admin')
  @ApiOperation({ summary: 'Initialiser le premier compte admin (Public si vide)' })
  async bootstrapPublic() {
    const exists = await this.usersService.adminExists();
    if (exists) {
      return { success: false, message: 'Admin already exists' };
    }
    
    // Create default admin: admin@example.com / admin123
    await this.usersService.createDefaultAdmin();
    return { success: true, message: 'Admin account created' };
  }

  @Post('bootstrap-first-admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rendre le premier utilisateur admin' })
  async bootstrapFirstAdmin(@Req() req) {
    const result = await this.usersService.bootstrapFirstAdmin(req.user.id);
    return { result };
  }

  @Post('ensure-user-initialized')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initialiser le profil utilisateur' })
  async ensureUserInitialized(@Req() req) {
    await this.usersService.ensureInitialized(req.user.id, req.user.email);
    return { success: true };
  }
}
