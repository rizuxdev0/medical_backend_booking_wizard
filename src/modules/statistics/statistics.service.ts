import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { QueueEntry } from '../queue/entities/queue-entry.entity';
import { InpatientBed } from '../inpatient-beds/entities/inpatient-bed.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(QueueEntry)
    private queueRepo: Repository<QueueEntry>,
    @InjectRepository(InpatientBed)
    private bedRepo: Repository<InpatientBed>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async getOccupancyStats() {
    const total = await this.bedRepo.count();
    const occupied = await this.bedRepo.count({ where: { status: 'occupied' } });
    const cleaning = await this.bedRepo.count({ where: { status: 'cleaning' } });
    const available = total - occupied - cleaning;

    return {
      total,
      occupied,
      cleaning,
      available,
      rate: total > 0 ? (occupied / total) * 100 : 0
    };
  }

  async getAppointmentsStats(start: string, end: string, practitionerId?: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const where: any = {
      scheduledAt: Between(startDate as any, endDate as any),
    };

    if (practitionerId && practitionerId !== 'all') {
      where.practitionerId = practitionerId;
    }

    const appointments = await this.appointmentRepo.find({ 
      where,
      relations: ['practitioner', 'appointmentType'], 
      order: { scheduledAt: 'ASC' }
    });

    // Assurer la compatibilité avec le frontend qui attend du snake_case et des noms pluriels
    return appointments.map(a => ({
      ...a,
      scheduled_at: a.scheduledAt,
      practitioners: a.practitioner ? {
        ...a.practitioner,
        first_name: a.practitioner.firstName,
        last_name: a.practitioner.lastName,
        consultation_fee: Number(a.practitioner.consultationFee) || 0,
        specialty: a.practitioner.specialty
      } : null,
      appointment_types: a.appointmentType ? {
        ...a.appointmentType,
        name: a.appointmentType.name
      } : null
    }));
  }



  async getQueueStats(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return this.queueRepo.find({
      where: {
        createdAt: Between(startDate as any, endDate as any),
      },
    });
  }

  async getFinancialSummary(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const invoices = await this.invoiceRepo.find({
      where: {
        issueDate: Between(startDate as any, endDate as any),
      },
    });

    const summary = {
      totalRevenue: 0,
      totalPaid: 0,
      totalDue: 0,
      totalInsurance: 0,
      invoiceCount: invoices.length,
      paidCount: invoices.filter(i => i.status === 'paid').length,
      pendingCount: invoices.filter(i => i.status === 'sent' || i.status === 'partial').length,
    };

    invoices.forEach(inv => {
      summary.totalRevenue += Number(inv.totalAmount) || 0;
      summary.totalPaid += Number(inv.amountPaid) || 0;
      summary.totalDue += Number(inv.amountDue) || 0;
      summary.totalInsurance += Number(inv.insuranceAmount) || 0;
    });

    return summary;
  }

  async getClinicalActivity(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const patientsCount = await this.patientRepo.count();
    const newPatients = await this.patientRepo.count({
      where: { createdAt: Between(startDate as any, endDate as any) }
    });

    const appointmentsCount = await this.appointmentRepo.count({
      where: { scheduledAt: Between(startDate as any, endDate as any) }
    });

    const bedAdmissions = await this.bedRepo.count({
      where: { status: 'occupied' } // Simplified proxy for current occupancy
    });

    return {
      totalPatients: patientsCount,
      newPatients,
      totalConsultations: appointmentsCount,
      currentHospitalizations: bedAdmissions,
    };
  }
}

