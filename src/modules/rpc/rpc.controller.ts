import { Controller, Get, Post, Req, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { SettingsService } from '../settings/settings.service';
import { RpcService } from './rpc.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('rpc')
@Controller('rpc')
export class RpcController {
  constructor(
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
    private readonly rpcService: RpcService,
  ) {}

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Vérifier le statut du système' })
  async getStatus() {
    return this.rpcService.getSystemStatus();
  }

  @Public()
  @Get('admin-exists')
  @ApiOperation({ summary: 'Vérifier si un admin existe' })
  async adminExists() {
    const exists = await this.usersService.adminExists();
    return { result: exists };
  }

  @Public()
  @Get('is-setup-completed')
  @ApiOperation({ summary: 'Vérifier si le setup est terminé' })
  async setupCompleted() {

    const completed = await this.rpcService.isSetupCompleted();
    return { completed };
  }

  @Post('complete-setup')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Terminer la configuration initiale' })
  async completeSetup() {
    return this.rpcService.completeSetup();
  }
  
  @Public()
  @Post('bootstrap-admin')
  @ApiOperation({ summary: 'Initialiser le premier compte admin (Public si vide)' })
  async bootstrapPublic() {
    const exists = await this.usersService.adminExists();
    if (exists) {
      return { success: false, message: 'Admin already exists' };
    }
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
