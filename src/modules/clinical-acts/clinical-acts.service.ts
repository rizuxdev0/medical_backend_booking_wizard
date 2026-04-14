import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalAct } from './entities/clinical-act.entity';

@Injectable()
export class ClinicalActsService {
  constructor(
    @InjectRepository(ClinicalAct)
    private repo: Repository<ClinicalAct>,
  ) {}

  create(createDto: any) {
    const entity = this.repo.create(createDto);
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
