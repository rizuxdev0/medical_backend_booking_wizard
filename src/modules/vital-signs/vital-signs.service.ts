import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VitalSign } from './entities/vital-sign.entity';

@Injectable()
export class VitalSignsService {
  constructor(
    @InjectRepository(VitalSign)
    private repo: Repository<VitalSign>,
  ) {}

  findAllByPatient(patientId: string) {
    return this.repo.find({
      where: { patientId },
      order: { recordedAt: 'DESC' },
      take: 50
    });
  }

  create(dto: any) {
    const sign = this.repo.create(dto);
    return this.repo.save(sign);
  }

  async getLatest(patientId: string) {
    return this.repo.findOne({
      where: { patientId },
      order: { recordedAt: 'DESC' }
    });
  }
}
