import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Insurer } from './entities/insurer.entity';
import { PdfGeneratorService } from '../../common/services/pdf-generator.service';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Insurer)
    private insurerRepo: Repository<Insurer>,
    private pdfService: PdfGeneratorService,
  ) {}

  /**
   * Génère un Bordereau de Réclamation (PDF) pour une assurance
   */
  async generateClaimBordereau(insurerId: string, dateFrom: Date, dateTo: Date): Promise<Buffer> {
    const insurer = await this.insurerRepo.findOne({ where: { id: insurerId } });
    if (!insurer) throw new NotFoundException('Assureur non trouvé');

    const invoices = await this.invoiceRepo.find({
      where: {
        insurerId,
        issueDate: Between(dateFrom, dateTo),
      },
      relations: ['patient', 'items'],
      order: { issueDate: 'ASC' },
    });

    const totalClaimed = invoices.reduce((sum, inv) => sum + Number(inv.insuranceAmount), 0);

    const template = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; font-size: 12px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { bg-color: #f2f2f2; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BORDEREAU DE RÉCLAMATION - TIERS PAYANT</h1>
            <h2>Assureur : ${insurer.name}</h2>
            <p>Période du ${dateFrom.toLocaleDateString()} au ${dateTo.toLocaleDateString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>N° Facture</th>
                <th>Patient</th>
                <th>Montant Total</th>
                <th>Part Patient</th>
                <th>Part Assurance (Réclamation)</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => `
                <tr>
                  <td>${inv.issueDate.toLocaleDateString()}</td>
                  <td>${inv.invoiceNumber}</td>
                  <td>${inv.patient.firstName} ${inv.patient.lastName}</td>
                  <td>${inv.totalAmount} ${inv.currency}</td>
                  <td>${inv.patientAmount} ${inv.currency}</td>
                  <td><strong>${inv.insuranceAmount} ${inv.currency}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            TOTAL RÉCLAMÉ : ${totalClaimed.toFixed(2)} ${invoices[0]?.currency || ''}
          </div>
        </body>
      </html>
    `;

    return this.pdfService.generatePdf(template, {});
  }

  /**
   * Export XML standard pour les télé-transmissions
   */
  async exportXmlClaim(insurerId: string, dateFrom: Date, dateTo: Date): Promise<string> {
    const insurer = await this.insurerRepo.findOne({ where: { id: insurerId } });
    const invoices = await this.invoiceRepo.find({
      where: { insurerId, issueDate: Between(dateFrom, dateTo) },
      relations: ['patient', 'items'],
    });

    if (!insurer) throw new NotFoundException('Assureur non trouvé');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<ClaimBatch insurer="${insurer.name}" code="${insurer.code}">\n`;
    
    invoices.forEach(inv => {
      xml += `  <Claim invoice="${inv.invoiceNumber}">\n`;
      xml += `    <Patient name="${inv.patient.firstName} ${inv.patient.lastName}" id="${inv.patient.id}" />\n`;
      xml += `    <Amount total="${inv.totalAmount}" insurance="${inv.insuranceAmount}" patient="${inv.patientAmount}" />\n`;
      xml += `    <Services>\n`;
      inv.items.forEach(item => {
        xml += `      <Service code="${item.serviceCode || 'N/A'}" description="${item.description}" qty="${item.quantity}" price="${item.unitPrice}" />\n`;
      });
      xml += `    </Services>\n`;
      xml += `  </Claim>\n`;
    });

    xml += `</ClaimBatch>`;
    return xml;
  }
}
