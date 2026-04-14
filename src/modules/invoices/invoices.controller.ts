import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles('admin', 'accountant', 'secretary')
  @ApiOperation({ summary: 'Liste des factures avec filtres' })
  findAll(
    @Query() query: InvoiceQueryDto,
  ): Promise<InvoiceResponseDto[]> {
    return this.invoicesService.findAll(query);
  }

  @Get('patients/:patientId')
  @Roles('admin', 'accountant', 'secretary', 'doctor')
  @ApiOperation({ summary: "Liste des factures d'un patient" })
  findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<InvoiceResponseDto[]> {
    return this.invoicesService.findByPatient(patientId);
  }

  @Get('unpaid')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Liste des factures impayées' })
  getUnpaid(): Promise<InvoiceResponseDto[]> {
    return this.invoicesService.getUnpaidInvoices();
  }

  @Get('stats')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Tableau de bord de facturation' })
  getStats(): Promise<BillingDashboardDto> {
    return this.invoicesService.getStats();
  }

  @Post('reminders/auto')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Déclencher les relances automatiques pour impayés' })
  autoSendReminders() {
    return this.invoicesService.autoSendReminders();
  }

  @Get('reports/profitability')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Rapport de rentabilité par praticien' })
  getProfitabilityReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.invoicesService.getProfitabilityReport(from, to);
  }

  @Patch(':id/status')
  @Roles('admin', 'accountant', 'secretary')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une facture' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.updateStatus(id, status);
  }

  @Get(':id')
  @Roles('admin', 'accountant', 'secretary', 'doctor')
  @ApiOperation({ summary: "Détail d'une facture" })
  findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @Roles('admin', 'accountant', 'secretary')
  @ApiOperation({ summary: 'Créer une nouvelle facture' })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(createInvoiceDto, user.id);
  }

  @Patch(':id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Modifier une facture' })
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Post(':id/payments')
  @Roles('admin', 'accountant', 'secretary')
  @ApiOperation({ summary: 'Ajouter un paiement à une facture' })
  addPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user,
  ): Promise<PaymentResponseDto> {
    return this.invoicesService.addPayment(id, createPaymentDto, user.id);
  }

  @Get(':id/payments')
  @Roles('admin', 'accountant', 'secretary')
  @ApiOperation({ summary: "Liste des paiements d'une facture" })
  getPayments(@Param('id') id: string): Promise<PaymentResponseDto[]> {
    return this.invoicesService.getPayments(id);
  }
}
