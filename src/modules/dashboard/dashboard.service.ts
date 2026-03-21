import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { QueueEntry } from '../queue/entities/queue-entry.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(QueueEntry)
    private queueRepo: Repository<QueueEntry>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
  ) {}

  async getTodayAppointments(start: string, end: string) {
    return this.appointmentRepo.find({
      where: {
        scheduledAt: Between(new Date(start), new Date(end)),
      },
      relations: ['patient', 'practitioner'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async getAppointmentStats(start: string, end: string) {
    const appointments = await this.appointmentRepo.find({
      select: ['status'],
      where: {
        scheduledAt: Between(new Date(start), new Date(end)),
      },
    });

    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
      no_show: appointments.filter((a) => a.status === 'no_show').length,
    };
  }

  async getTotalPatients() {
    return this.patientRepo.count();
  }

  async getRecentPatients(since: string) {
    return this.patientRepo.find({
      where: {
        createdAt: MoreThanOrEqual(new Date(since)),
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  async getWeeklyTrends(start: string, end: string) {
    return this.appointmentRepo.find({
      select: ['scheduledAt', 'status'],
      where: {
        scheduledAt: Between(new Date(start), new Date(end)),
      },
    });
  }

  async getMonthlyRevenue(start: string, end: string) {
    const invoices = await this.invoiceRepo.find({
      select: ['totalAmount', 'amountPaid', 'status'],
      where: {
        issueDate: Between(new Date(start), new Date(end)),
      },
    });

    const total = invoices.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
    const paid = invoices.reduce((s, i) => s + (Number(i.amountPaid) || 0), 0);

    return {
      total,
      paid,
      pending: total - paid,
    };
  }

  async getUnpaidCount() {
    return this.invoiceRepo.count({
      where: {
        status: In(['issued', 'partial', 'overdue']),
      },
    });
  }

  async getPractitionerOccupancy(start: string, end: string) {
    const practitioners = await this.practitionerRepo.find({
      where: { isActive: true },
      take: 6,
    });

    const stats = await Promise.all(
      practitioners.map(async (prac) => {
        const count = await this.appointmentRepo.count({
          where: {
            practitionerId: prac.id,
            scheduledAt: Between(new Date(start), new Date(end)),
          },
        });
        return {
          id: prac.id,
          name: prac.firstName && prac.lastName ? `Dr. ${prac.firstName[0]}. ${prac.lastName}` : prac.specialty,
          specialty: prac.specialty,
          appointments: count,
        };
      }),
    );

    return stats.sort((a, b) => b.appointments - a.appointments);
  }

  async getQueueStats() {
    const entries = await this.queueRepo.find({
      select: ['status'],
      where: {
        status: In(['waiting', 'called', 'in_progress']),
      },
    });

    return {
      total: entries.length,
      waiting: entries.filter((e) => e.status === 'waiting').length,
      called: entries.filter((e) => e.status === 'called').length,
      inProgress: entries.filter((e) => e.status === 'in_progress').length,
    };
  }
}
