import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from './settings.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Envoie un email en utilisant la configuration SMTP stockée en base de données.
   */
  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    try {
      // 1. Récupérer la config email
      const configSetting = await this.settingsService.findOne('email_config');
      if (!configSetting || !configSetting.value) {
        throw new Error('Configuration SMTP (email_config) manquante en base de données');
      }

      const {
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_pass,
        from_name,
        from_email,
      } = configSetting.value as any;

      if (!smtp_host || !smtp_port) {
        throw new Error('Champs SMTP_HOST ou SMTP_PORT manquants dans la configuration');
      }

      // 2. Créer le transporter
      const transporter = nodemailer.createTransport({
        host: smtp_host,
        port: parseInt(smtp_port),
        secure: parseInt(smtp_port) === 465, // True for 465, false for other ports (587, 25)
        auth: (smtp_user && smtp_pass) ? {
          user: smtp_user,
          pass: smtp_pass,
        } : undefined,
        tls: {
          rejectUnauthorized: false // Permettre les certificats auto-signés si nécessaire
        }
      });

      // 3. Envoyer
      const info = await transporter.sendMail({
        from: options.from || `"${from_name || 'MedAgenda'}" <${from_email || 'noreply@medagenda.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Email envoyé à ${options.to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Erreur d'envoi d'email à ${options.to}: ${error.message}`);
      throw error;
    }
  }
}
