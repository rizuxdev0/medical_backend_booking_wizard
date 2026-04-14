import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InpatientBed } from './entities/inpatient-bed.entity';

@Injectable()
export class InpatientBedsService {
  constructor(
    @InjectRepository(InpatientBed)
    private repo: Repository<InpatientBed>,
  ) {}

  create(createDto: any) {
    const entity = this.repo.create(createDto as Partial<InpatientBed>);
    return this.repo.save(entity);
  }

  async findAll() {
    const beds = await this.repo.find({ order: { id: 'ASC' } });
    
    // Seed default beds if none exist
    if (beds.length === 0) {
      const defaultBeds = [
        { id: '101A', room: '101', type: 'Standard', status: 'available' },
        { id: '101B', room: '101', type: 'Standard', status: 'available' },
        { id: '102A', room: '102', type: 'Isolement', status: 'available' },
        { id: '201A', room: '201', type: 'Soins Intensifs (USI)', status: 'available' },
        { id: '201B', room: '201', type: 'Soins Intensifs (USI)', status: 'available' },
      ];
      await this.repo.save(defaultBeds);
      return this.repo.find({ order: { id: 'ASC' } });
    }
    
    return beds;
  }

  async findOne(id: string) {
    const bed = await this.repo.findOne({ where: { id } });
    if (!bed) throw new NotFoundException('Bed not found');
    return bed;
  }

  async update(id: string, updateDto: any) {
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  async transfer(sourceId: string, targetId: string) {
    const sourceBed = await this.findOne(sourceId);
    const targetBed = await this.findOne(targetId);

    if (targetBed.status !== 'available') {
      throw new Error('Target bed is not available');
    }

    // Move patient data
    const patientData = {
      patientId: sourceBed.patientId,
      patient: sourceBed.patient,
      doctor: sourceBed.doctor,
      admission_date: sourceBed.admission_date,
      status: 'occupied',
    };

    // Update target
    await this.repo.update(targetId, patientData);

    // Clear source
    await this.repo.update(sourceId, {
      patientId: null,
      patient: null,
      doctor: null,
      admission_date: null,
      status: 'cleaning',
    });

    return { sourceId, targetId };
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
