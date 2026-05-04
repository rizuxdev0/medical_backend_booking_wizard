import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import {
  InvoiceResponseDto,
  PaymentResponseDto,
  BillingDashboardDto,
} from './dto/invoice-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Permissions('billing.view')
  @ApiOperation({ summary: 'Liste des factures avec filtres' })
  findAll(
    @Query() query: InvoiceQueryDto,
  ): Promise<InvoiceResponseDto[]> {
    return this.invoicesService.findAll(query);
  }

  @Get('patients/:patientId')
  @Permissions('billing.view')
  @ApiOperation({ summary: "Liste des factures d'un patient" })
  findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<InvoiceResponseDto[]> {
    return this.invoicesService.findByPatient(patientId);
  }

  @Get('unpaid')
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Liste des factures impayées' })
  getUnpaid(): Promise<InvoiceResponseDto[]> {
    return this.invoicesService.getUnpaidInvoices();
  }

  @Get('stats')
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Tableau de bord de facturation' })
  getStats(): Promise<BillingDashboardDto> {
    return this.invoicesService.getStats();
  }

  @Post('reminders/auto')
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Déclencher les relances automatiques pour impayés' })
  autoSendReminders() {
    return this.invoicesService.autoSendReminders();
  }

  @Get('reports/profitability')
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Rapport de rentabilité par praticien' })
  getProfitabilityReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.invoicesService.getProfitabilityReport(from, to);
  }

  @Patch(':id/status')
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une facture' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.updateStatus(id, status);
  }

  @Get(':id')
  @Permissions('billing.view')
  @ApiOperation({ summary: "Détail d'une facture" })
  findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Créer une nouvelle facture' })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(createInvoiceDto, user.id);
  }

  @Patch(':id')
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Modifier une facture' })
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Post(':id/payments')
  @Permissions('billing.manage')
  @ApiOperation({ summary: 'Ajouter un paiement à une facture' })
  addPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user,
  ): Promise<PaymentResponseDto> {
    return this.invoicesService.addPayment(id, createPaymentDto, user.id);
  }

  @Get(':id/payments')
  @Permissions('billing.view')
  @ApiOperation({ summary: "Liste des paiements d'une facture" })
  getPayments(@Param('id') id: string): Promise<PaymentResponseDto[]> {
    return this.invoicesService.getPayments(id);
  }
}

}
