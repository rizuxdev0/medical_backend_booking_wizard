import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupLog, BackupStatus } from './entities/backup-log.entity';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(BackupLog)
    private readonly backupLogRepository: Repository<BackupLog>,
  ) {}

  onModuleInit() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Permet de déclencher une sauvegarde manuellement
  async triggerBackup(): Promise<BackupLog> {
    const filename = `backup-${Date.now()}.sql`;
    const filepath = path.join(this.backupDir, filename);

    // Create log entry
    const log = this.backupLogRepository.create({
      filename,
      status: BackupStatus.IN_PROGRESS,
    });
    await this.backupLogRepository.save(log);

    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const username = process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const database = process.env.DB_NAME || 'medical_app';
    const pgDumpPath = process.env.DB_BACKUP_COMMAND || 'pg_dump';

    // On utilise des guillemets autour du chemin au cas où il contient des espaces
    const cmd = `"${pgDumpPath}" -h ${host} -p ${port} -U ${username} -F c -b -v -f "${filepath}" ${database}`;

    try {
      this.logger.log(`Démarrage de la sauvegarde: ${filename}`);
      
      await execAsync(cmd, {
        env: { ...process.env, PGPASSWORD: password },
      });

      // Verification du fichier
      const stats = fs.statSync(filepath);
      
      log.status = BackupStatus.SUCCESS;
      log.size = stats.size;
      this.logger.log(`Sauvegarde terminée avec succès: ${filename} (${stats.size} bytes)`);

      await this.cleanOldBackups();
    } catch (error) {
      this.logger.error(`Erreur lors de la sauvegarde: ${error.message}`, error.stack);
      log.status = BackupStatus.FAILED;
      log.errorMessage = error.message;
    }

    return this.backupLogRepository.save(log);
  }

  // S'exécute automatiquement tous les jours à minuit
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Déclenchement automatique de la sauvegarde (CRON)');
    await this.triggerBackup();
  }

  async getLogs() {
    return this.backupLogRepository.find({ order: { createdAt: 'DESC' } });
  }

  private async cleanOldBackups() {
    // Garder les 7 derniers jours (ou configurable)
    const retentionDays = 7;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - retentionDays);

    const oldLogs = await this.backupLogRepository.createQueryBuilder('log')
      .where('log.createdAt < :limitDate', { limitDate })
      .andWhere('log.status = :status', { status: BackupStatus.SUCCESS })
      .getMany();

    for (const oldLog of oldLogs) {
      const filepath = path.join(this.backupDir, oldLog.filename);
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
          this.logger.log(`Ancienne sauvegarde supprimée: ${oldLog.filename}`);
        } catch (err) {
          this.logger.error(`Impossible de supprimer le fichier: ${filepath}`, err);
        }
      }
      // On peut au choix supprimer la ligne de log, ou la garder en historique
      // await this.backupLogRepository.remove(oldLog);
    }
  }
}
