import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, LessThanOrEqual, Like } from 'typeorm';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import {
  InvoiceResponseDto,
  PaymentResponseDto,
  BillingDashboardDto,
} from './dto/invoice-response.dto';
import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Invoice } from './entities/invoice.entity';
import { BillableItem } from './entities/billable-item.entity';
import { InvoiceInstallment } from './entities/invoice-installment.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment } from './entities/payment.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepo: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(InvoiceInstallment)
    private installmentRepo: Repository<InvoiceInstallment>,
    @InjectRepository(BillableItem)
    private billableItemRepo: Repository<BillableItem>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  // ==================== LISTE DES FACTURES ====================

  async findAll(
    query: InvoiceQueryDto,
  ): Promise<InvoiceResponseDto[]> {
    const {
      status,
      patient_id,
      practitioner_id,
      date_from,
      date_to,
    } = query;

    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }

    if (patient_id) {
      whereCondition.patientId = patient_id;
    }

    if (practitioner_id) {
      whereCondition.practitionerId = practitioner_id;
    }

    if (query.today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      whereCondition.issueDate = Between(startOfDay, endOfDay);
    } else if (date_from || date_to) {
      whereCondition.issueDate = Between(
        date_from ? new Date(date_from) : new Date('1900-01-01'),
        date_to ? new Date(date_to) : new Date('2100-12-31'),
      );
    }

    const invoices = await this.invoiceRepo.find({
      where: whereCondition,
      order: { issueDate: 'DESC', createdAt: 'DESC' },
      relations: ['patient', 'practitioner'],
    });

    return Promise.all(invoices.map((inv) => this.mapToResponse(inv)));
  }

  async findByPatient(patientId: string): Promise<InvoiceResponseDto[]> {
    const invoices = await this.invoiceRepo.find({
      where: { patientId },
      order: { issueDate: 'DESC' },
      relations: ['practitioner'],
    });

    return Promise.all(invoices.map((inv) => this.mapToResponse(inv)));
  }

  // ==================== DÉTAIL FACTURE ====================

  async findOne(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner', 'appointment'],
    });

    if (!invoice) {
      throw new NotFoundException(`Facture avec l'ID ${id} non trouvée`);
    }

    return this.mapToResponse(invoice, true);
  }

  // ==================== CRÉATION FACTURE ====================

  async create(
    createInvoiceDto: CreateInvoiceDto,
    createdBy: string,
  ): Promise<InvoiceResponseDto> {
    // 1. Vérifier que le patient existe
    const patient = await this.patientRepo.findOne({
      where: { id: createInvoiceDto.patient_id },
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient avec l'ID ${createInvoiceDto.patient_id} non trouvé`,
      );
    }

    // 2. Vérifier le praticien si fourni
    if (createInvoiceDto.practitioner_id) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: createInvoiceDto.practitioner_id },
      });
      if (!practitioner) {
        throw new NotFoundException(
          `Praticien avec l'ID ${createInvoiceDto.practitioner_id} non trouvé`,
        );
      }
    }

    // 3. Vérifier le rendez-vous si fourni
    if (createInvoiceDto.appointment_id) {
      const appointment = await this.appointmentRepo.findOne({
        where: { id: createInvoiceDto.appointment_id },
      });
      if (!appointment) {
        throw new NotFoundException(
          `Rendez-vous avec l'ID ${createInvoiceDto.appointment_id} non trouvé`,
        );
      }
    }

    // 4. Calculer les totaux
    let subtotal = 0;
    for (const item of createInvoiceDto.items) {
      subtotal += item.quantity * item.unit_price;
    }

    const taxRate = createInvoiceDto.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = createInvoiceDto.discount_amount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // 4b. Calculer Tiers-Payant
    let insuranceAmount = 0;
    let patientAmount = totalAmount;

    if (createInvoiceDto.insurer_id) {
      const coverageRate = createInvoiceDto.coverage_rate || 0;
      insuranceAmount = totalAmount * (coverageRate / 100);
      patientAmount = totalAmount - insuranceAmount;
    }

    // 5. Générer un numéro de facture unique
    const invoiceNumber = await this.generateInvoiceNumber();

    // 6. Créer la facture
    const invoiceData: Partial<Invoice> = {
      invoiceNumber,
      patientId: createInvoiceDto.patient_id,
      status: 'draft',
      issueDate: createInvoiceDto.issue_date
        ? new Date(createInvoiceDto.issue_date)
        : new Date(),
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      insuranceAmount,
      patientAmount,
      amountPaid: 0,
      amountDue: totalAmount,
      currency: createInvoiceDto.currency || 'XOF',
      isDeferred: createInvoiceDto.is_deferred || false,
      notes: createInvoiceDto.notes,
      createdBy,
      insurerId: createInvoiceDto.insurer_id,
    };

    // Ajouter les champs optionnels seulement s'ils sont définis
    if (createInvoiceDto.practitioner_id) {
      invoiceData.practitionerId = createInvoiceDto.practitioner_id;
    }

    if (createInvoiceDto.appointment_id) {
      invoiceData.appointmentId = createInvoiceDto.appointment_id;
    }

    if (createInvoiceDto.due_date) {
      invoiceData.dueDate = new Date(createInvoiceDto.due_date);
    }

    if (createInvoiceDto.installment_count !== undefined) {
      invoiceData.installmentCount = createInvoiceDto.installment_count;
    }

    const invoice = this.invoiceRepo.create(invoiceData);
    await this.invoiceRepo.save(invoice);

    // 7. Créer les items de facture
    for (const itemDto of createInvoiceDto.items) {
      const totalPrice = itemDto.quantity * itemDto.unit_price;

      const itemData: Partial<InvoiceItem> = {
        invoiceId: invoice.id,
        description: itemDto.description,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unit_price,
        totalPrice,
      };

      if (itemDto.billable_item_id) {
        const billableItem = await this.billableItemRepo.findOne({
          where: { id: itemDto.billable_item_id },
        });
        if (billableItem) {
          itemData.billableItemId = billableItem.id;
        }
      }

      if (itemDto.service_code) {
        itemData.serviceCode = itemDto.service_code;
      }

      const item = this.invoiceItemRepo.create(itemData);
      await this.invoiceItemRepo.save(item);
    }

    // 8. Créer les échéances si paiement différé
    if (
      createInvoiceDto.is_deferred &&
      createInvoiceDto.installment_count &&
      createInvoiceDto.installment_count > 1
    ) {
      await this.createInstallments(
        invoice.id,
        totalAmount,
        createInvoiceDto.installment_count,
      );
    }

    return this.findOne(invoice.id);
  }

  // ==================== MISE À JOUR FACTURE ====================

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException(`Facture avec l'ID ${id} non trouvée`);
    }

    // Empêcher la modification des factures payées
    if (invoice.status === 'paid') {
      throw new BadRequestException('Impossible de modifier une facture payée');
    }

    // Préparer les données de mise à jour
    const updateData: Partial<Invoice> = {};

    if (updateInvoiceDto.patient_id) {
      const patient = await this.patientRepo.findOne({
        where: { id: updateInvoiceDto.patient_id },
      });
      if (!patient) throw new NotFoundException('Patient non trouvé');
      updateData.patientId = updateInvoiceDto.patient_id;
    }

    if (updateInvoiceDto.practitioner_id !== undefined) {
      if (updateInvoiceDto.practitioner_id) {
        const practitioner = await this.practitionerRepo.findOne({
          where: { id: updateInvoiceDto.practitioner_id },
        });
        if (!practitioner) throw new NotFoundException('Praticien non trouvé');
        updateData.practitionerId = updateInvoiceDto.practitioner_id;
      } else {
        updateData.practitionerId = undefined;
      }
    }

    if (updateInvoiceDto.appointment_id !== undefined) {
      if (updateInvoiceDto.appointment_id) {
        const appointment = await this.appointmentRepo.findOne({
          where: { id: updateInvoiceDto.appointment_id },
        });
        if (!appointment) throw new NotFoundException('Rendez-vous non trouvé');
        updateData.appointmentId = updateInvoiceDto.appointment_id;
      } else {
        updateData.appointmentId = undefined;
      }
    }

    if (updateInvoiceDto.issue_date) {
      updateData.issueDate = new Date(updateInvoiceDto.issue_date);
    }

    if (updateInvoiceDto.due_date !== undefined) {
      updateData.dueDate = updateInvoiceDto.due_date
        ? new Date(updateInvoiceDto.due_date)
        : undefined;
    }

    if (updateInvoiceDto.tax_rate !== undefined) {
      updateData.taxRate = updateInvoiceDto.tax_rate;
      // Recalculer taxAmount
      updateData.taxAmount =
        invoice.subtotal * (updateInvoiceDto.tax_rate / 100);
      // Recalculer totalAmount et amountDue
      updateData.totalAmount =
        invoice.subtotal + updateData.taxAmount - invoice.discountAmount;
      updateData.amountDue = updateData.totalAmount - invoice.amountPaid;
    }

    if (updateInvoiceDto.discount_amount !== undefined) {
      updateData.discountAmount = updateInvoiceDto.discount_amount;
      // Recalculer totalAmount et amountDue
      updateData.totalAmount =
        invoice.subtotal + invoice.taxAmount - updateInvoiceDto.discount_amount;
      updateData.amountDue = updateData.totalAmount - invoice.amountPaid;
    }

    if (updateInvoiceDto.currency) {
      updateData.currency = updateInvoiceDto.currency;
    }

    if (updateInvoiceDto.is_deferred !== undefined) {
      updateData.isDeferred = updateInvoiceDto.is_deferred;
    }

    if (updateInvoiceDto.installment_count !== undefined) {
      updateData.installmentCount = updateInvoiceDto.installment_count;
    }

    if (updateInvoiceDto.notes !== undefined) {
      updateData.notes = updateInvoiceDto.notes;
    }

    if (Object.keys(updateData).length > 0) {
      await this.invoiceRepo.update(id, updateData);
    }

    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException('Facture non trouvée');

    await this.invoiceRepo.update(id, { status });
    return this.findOne(id);
  }

  // ==================== GESTION DES PAIEMENTS ====================

  async addPayment(
    invoiceId: string,
    createPaymentDto: CreatePaymentDto,
    receivedBy: string,
  ): Promise<PaymentResponseDto> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Facture avec l'ID ${invoiceId} non trouvée`);
    }

    // Vérifier que le montant du paiement n'est pas supérieur au montant dû
    if (createPaymentDto.amount > invoice.amountDue) {
      throw new BadRequestException(
        `Le montant du paiement (${createPaymentDto.amount}) est supérieur au montant dû (${invoice.amountDue})`,
      );
    }

    // Générer un numéro de paiement
    const paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Créer le paiement
    const paymentData: Partial<Payment> = {
      paymentNumber,
      invoiceId,
      amount: createPaymentDto.amount,
      paymentMethod: createPaymentDto.payment_method,
      paymentDate: createPaymentDto.payment_date
        ? new Date(createPaymentDto.payment_date)
        : new Date(),
      status: 'completed',
      currency: createPaymentDto.currency || invoice.currency,
      receivedBy,
    };

    if (createPaymentDto.reference) {
      paymentData.reference = createPaymentDto.reference;
    }

    if (createPaymentDto.notes) {
      paymentData.notes = createPaymentDto.notes;
    }

    const payment = this.paymentRepo.create(paymentData);
    await this.paymentRepo.save(payment);

    // Mettre à jour la facture
    const newAmountPaid = Number(invoice.amountPaid || 0) + Number(createPaymentDto.amount);
    const newAmountDue = Math.max(0, Number(invoice.totalAmount || 0) - newAmountPaid);

    let newStatus = invoice.status;
    if (newAmountDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    }

    await this.invoiceRepo.update(invoiceId, {
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: newStatus,
    });

    // Si c'est un paiement pour une échéance (deferred), mettre à jour les échéances dans l'ordre
    if (invoice.isDeferred) {
      const installments = await this.installmentRepo.find({
        where: { 
          invoiceId, 
          status: In(['pending', 'partial']) 
        },
        order: { dueDate: 'ASC' },
      });

      let remainingAmount = Number(createPaymentDto.amount);
      for (const installment of installments) {
        if (remainingAmount <= 0) break;

        const inst_amount = Number(installment.amount || 0);
        const inst_paid = Number(installment.paidAmount || 0);
        const inst_due = Math.max(0, inst_amount - inst_paid);
        
        if (inst_due > 0) {
          const paymentForThis = Math.min(remainingAmount, inst_due);
          const newPaidAmount = inst_paid + paymentForThis;
          const status = newPaidAmount >= inst_amount - 0.01 ? 'paid' : 'partial';

          await this.installmentRepo.update(installment.id, {
            paidAmount: newPaidAmount,
            status: status,
            paidAt: new Date(),
            paymentId: payment.id,
          });

          remainingAmount = Math.max(0, remainingAmount - paymentForThis);
        }
      }
    }

    return this.mapPaymentToResponse(payment);
  }

  async getPayments(invoiceId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepo.find({
      where: { invoiceId },
      order: { paymentDate: 'DESC' },
      relations: ['receiver'],
    });

    return payments.map((p) => this.mapPaymentToResponse(p));
  }

  // ==================== FACTURES IMPAYÉES ====================

  async getUnpaidInvoices(): Promise<InvoiceResponseDto[]> {
    const invoices = await this.invoiceRepo.find({
      where: [{ status: 'issued' }, { status: 'sent' }, { status: 'partial' }, { status: 'overdue' }],
      order: { dueDate: 'ASC' },
      relations: ['patient'],
    });

    return Promise.all(invoices.map((inv) => this.mapToResponse(inv)));
  }

  // ==================== TABLEAU DE BORD ====================

  async getStats(): Promise<BillingDashboardDto> {
    const today = new Date();

    const allInvoices = await this.invoiceRepo.find();
    const paidInvoices = allInvoices.filter((inv) => inv.status === 'paid');
    const unpaidInvoices = allInvoices.filter((inv) =>
      ['issued', 'sent', 'partial', 'overdue'].includes(inv.status),
    );
    const overdueInvoices = allInvoices.filter(
      (inv) =>
        inv.status !== 'paid' &&
        inv.status !== 'cancelled' &&
        inv.dueDate &&
        new Date(inv.dueDate) < today,
    );

    const totalInvoiced = allInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const totalPaid = allInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalUnpaid = allInvoices.reduce(
      (sum, inv) => sum + inv.amountDue,
      0,
    );
    const totalOverdue = overdueInvoices.reduce(
      (sum, inv) => sum + inv.amountDue,
      0,
    );

    const byStatus = {
      draft: allInvoices.filter((inv) => inv.status === 'draft').length,
      sent: allInvoices.filter((inv) => ['issued', 'sent'].includes(inv.status)).length,
      paid: allInvoices.filter((inv) => inv.status === 'paid').length,
      partial: allInvoices.filter((inv) => inv.status === 'partial').length,
      overdue: overdueInvoices.length,
      cancelled: allInvoices.filter((inv) => inv.status === 'cancelled').length,
    };

    return {
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      total_unpaid: totalUnpaid,
      total_overdue: totalOverdue,
      invoice_count: allInvoices.length,
      paid_count: paidInvoices.length,
      unpaid_count: unpaidInvoices.length,
      overdue_count: overdueInvoices.length,
      by_status: byStatus,
    };
  }

  // ==================== REPORTING ET RENTABILITÉ ====================

  async getProfitabilityReport(dateFrom: string, dateTo: string) {
    const rawData = await this.invoiceRepo.find({
      where: {
        issueDate: Between(new Date(dateFrom), new Date(dateTo)),
        status: In(['paid', 'partial'])
      },
      relations: ['practitioner', 'items']
    });

    const reportByPractitioner = {};
    rawData.forEach(inv => {
      const practitionerName = inv.practitioner ? `${inv.practitioner.firstName} ${inv.practitioner.lastName}` : 'Inconnu';
      if (!reportByPractitioner[practitionerName]) {
        reportByPractitioner[practitionerName] = { total: 0, count: 0 };
      }
      reportByPractitioner[practitionerName].total += Number(inv.amountPaid);
      reportByPractitioner[practitionerName].count += 1;
    });

    return {
      period: { from: dateFrom, to: dateTo },
      byPractitioner: reportByPractitioner,
      totalRevenue: rawData.reduce((sum, inv) => sum + Number(inv.amountPaid), 0)
    };
  }

  // ==================== RELANCE AUTOMATIQUE ====================

  async autoSendReminders() {
    const today = new Date();
    const overdueInvoices = await this.invoiceRepo.find({
      where: {
        status: In(['sent', 'partial', 'overdue']),
        dueDate: LessThanOrEqual(today)
      },
      relations: ['patient']
    });

    const results: any[] = [];
    for (const inv of overdueInvoices) {
      if (inv.amountDue > 0) {
        // Simulation d'envoi SMS/Email
        const message = `Rappel: Votre facture ${inv.invoiceNumber} de ${inv.amountDue} CFA est échue. Merci de régulariser.`;
        console.log(`[RELANCE] ${inv.patient.firstName} ${inv.patient.lastName} (${inv.patient.phone}): ${message}`);
        
        results.push({
          invoiceNumber: inv.invoiceNumber,
          patient: `${inv.patient.firstName} ${inv.patient.lastName}`,
          amountDue: inv.amountDue,
          status: 'SMS_SENT'
        });
      }
    }

    return { remindedCount: results.length, details: results };
  }

  // ==================== MÉTHODES PRIVÉES ====================
  // (mapToResponse and other private methods below...)

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const lastInvoice = await this.invoiceRepo.findOne({
      where: { invoiceNumber: Like(`${year}-${month}-%`) },
      order: { invoiceNumber: 'DESC' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${year}-${month}-${String(sequence).padStart(4, '0')}`;
  }

  private async createInstallments(
    invoiceId: string,
    totalAmount: number,
    count: number,
  ): Promise<void> {
    const amountPerInstallment = totalAmount / count;
    const today = new Date();

    for (let i = 0; i < count; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i + 1);

      const installmentData: Partial<InvoiceInstallment> = {
        invoiceId,
        installmentNumber: i + 1,
        amount: amountPerInstallment,
        dueDate,
        status: 'pending',
        paidAmount: 0,
      };

      const installment = this.installmentRepo.create(installmentData);
      await this.installmentRepo.save(installment);
    }
  }

  private async mapToResponse(
    invoice: Invoice,
    loadRelations: boolean = false,
  ): Promise<InvoiceResponseDto> {
    const response: InvoiceResponseDto = {
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      patient_id: invoice.patientId,
      practitioner_id: invoice.practitionerId || null,
      appointment_id: invoice.appointmentId || null,
      status: invoice.status,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate || null,
      subtotal: invoice.subtotal,
      tax_rate: invoice.taxRate,
      tax_amount: invoice.taxAmount,
      discount_amount: invoice.discountAmount,
      total_amount: invoice.totalAmount,
      amount_paid: invoice.amountPaid,
      amount_due: invoice.amountDue,
      currency: invoice.currency,
      is_deferred: invoice.isDeferred,
      installment_count: invoice.installmentCount,
      notes: invoice.notes || null,
      created_by: invoice.createdBy || null,
      created_at: invoice.createdAt,
      updated_at: invoice.updatedAt,
    };

    if (invoice.patient) {
      response.patient = {
        id: invoice.patient.id,
        first_name: invoice.patient.firstName,
        last_name: invoice.patient.lastName,
        phone: invoice.patient.phone || null,
      };
    }

    if (invoice.practitioner) {
      response.practitioner = {
        id: invoice.practitioner.id,
        first_name: invoice.practitioner.firstName || null,
        last_name: invoice.practitioner.lastName || null,
        specialty: invoice.practitioner.specialty,
      };
    }

    if (loadRelations) {
      const items = await this.invoiceItemRepo.find({
        where: { invoiceId: invoice.id },
      });
      response.items = items.map((item) => ({
        id: item.id,
        invoice_id: item.invoiceId,
        billable_item_id: item.billableItemId || null,
        description: item.description,
        service_code: item.serviceCode || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        created_at: item.createdAt,
      }));

      const payments = await this.paymentRepo.find({
        where: { invoiceId: invoice.id },
        order: { paymentDate: 'DESC' },
      });
      response.payments = payments.map((p) => this.mapPaymentToResponse(p));

      const installments = await this.installmentRepo.find({
        where: { invoiceId: invoice.id },
        order: { dueDate: 'ASC' },
      });
      response.installments = installments.map((i) => ({
        id: i.id,
        invoice_id: i.invoiceId,
        installment_number: i.installmentNumber,
        amount: i.amount,
        due_date: i.dueDate,
        status: i.status,
        paid_amount: i.paidAmount,
        paid_at: i.paidAt || null,
        payment_id: i.paymentId || null,
        created_at: i.createdAt,
        updated_at: i.updatedAt,
      }));
    }

    return response;
  }

  private mapPaymentToResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      payment_number: payment.paymentNumber,
      invoice_id: payment.invoiceId,
      amount: payment.amount,
      payment_method: payment.paymentMethod,
      payment_date: payment.paymentDate,
      reference: payment.reference || null,
      notes: payment.notes || null,
      status: payment.status,
      currency: payment.currency,
      received_by: payment.receivedBy || null,
      created_at: payment.createdAt,
    };
  }
}
