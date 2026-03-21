import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { QueueEntry } from '../queue/entities/queue-entry.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(QueueEntry)
    private queueRepo: Repository<QueueEntry>,
  ) {}

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

    // Assurer la compatibilité avec le frontend qui attend des noms pluriels
    return appointments.map(a => ({
      ...a,
      practitioners: a.practitioner,
      appointment_types: a.appointmentType
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

