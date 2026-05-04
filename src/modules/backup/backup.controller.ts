import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  @Roles('admin') // Only admins should see backup logs
  getLogs() {
    return this.backupService.getLogs();
  }

  @Post('trigger')
  @Roles('admin') // Only admins can trigger backups manually
  triggerBackup() {
    // Fire and forget so we don't block the request if it takes long
    this.backupService.triggerBackup();
    return { message: 'Sauvegarde démarrée en arrière-plan' };
  }
}
