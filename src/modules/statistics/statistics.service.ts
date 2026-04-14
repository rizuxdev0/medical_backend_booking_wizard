import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { QueueEntry } from '../queue/entities/queue-entry.entity';
import { InpatientBed } from '../inpatient-beds/entities/inpatient-bed.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(QueueEntry)
    private queueRepo: Repository<QueueEntry>,
    @InjectRepository(InpatientBed)
    private bedRepo: Repository<InpatientBed>,
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

    // Returning the raw array of queue entries as per instruction 3
    return this.queueRepo.find({
      where: {
        createdAt: Between(startDate as any, endDate as any),
      },
    });
  }

}

