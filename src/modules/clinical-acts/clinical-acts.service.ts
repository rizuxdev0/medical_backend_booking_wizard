import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalAct } from './entities/clinical-act.entity';
import { CreateClinicalActDto } from './dto/create-clinical-act.dto';

@Injectable()
export class ClinicalActsService {
  constructor(
    @InjectRepository(ClinicalAct)
    private repo: Repository<ClinicalAct>,
  ) {}

  async create(createDto: CreateClinicalActDto) {
    const actData = {
      patientId: createDto.patientId,
      appointmentId: createDto.appointmentId,
      actName: createDto.description,
      price: createDto.amount,
      status: createDto.isBilled ? 'billed' : 'pending',
      patientName: 'Patient', // Fallback, would be better to fetch it or pass it
    };
    
    const entity = this.repo.create(actData);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { date: 'DESC' } });
  }

  findByPatient(patientId: string) {
    return this.repo.find({ where: { patientId, status: 'pending' } });
  }

  async markAsBilled(id: string) {
    return this.repo.update(id, { status: 'billed' });
  }
}
