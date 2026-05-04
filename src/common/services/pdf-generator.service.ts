import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';

@Injectable()
export class PdfGeneratorService {
  /**
   * Génère un PDF à partir d'un template HTML et de données
   * @param templateHtml Le contenu HTML (souvent un template Handlebars)
   * @param data Les données à injecter dans le template
   */
  async generatePdf(templateHtml: string, data: any): Promise<Buffer> {
    // 1. Compiler le template avec Handlebars
    const template = handlebars.compile(templateHtml);
    const html = template(data);

    // 2. Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // 3. Charger le contenu HTML
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // 4. Générer le PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '10mm',
          bottom: '20mm',
          left: '10mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
