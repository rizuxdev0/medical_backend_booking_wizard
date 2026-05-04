import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NursingCarePlan } from './entities/nursing-care-plan.entity';

@Injectable()
export class NursingCarePlansService {
  constructor(
    @InjectRepository(NursingCarePlan)
    private repo: Repository<NursingCarePlan>,
  ) {}

  create(createDto: any): Promise<NursingCarePlan> {
    const data = {
      ...createDto,
      scheduledAt: createDto.scheduledAt || new Date(),
    };
    const entity = this.repo.create(data);
    return (this.repo.save(entity) as any) as Promise<NursingCarePlan>;
  }

  async findAll() {
    const plans = await this.repo.find({ order: { scheduledAt: 'ASC' } });
    if (plans.length === 0) {
      const now = new Date();
      const defaults = [
        { scheduledAt: new Date(now.setHours(8, 0)), task: 'Prise de Constantes (Temp, TA)', status: 'done', patientName: 'Alain Martin', bedId: '101A', type: 'monitoring' },
        { scheduledAt: new Date(now.setHours(9, 0)), task: 'Pansement post-opératoire', status: 'pending', patientName: 'Marie Dubois', bedId: '102A', type: 'care' },
        { scheduledAt: new Date(now.setHours(12, 0)), task: "Perfusion d'Amoxicilline 1g", status: 'pending', patientName: 'Alain Martin', bedId: '101A', type: 'medication' },
        { scheduledAt: new Date(now.setHours(14, 30)), task: "Injection Insuline SC", status: 'pending', patientName: 'Yao Kouadio', bedId: '201B', type: 'medication' },
        { scheduledAt: new Date(now.setHours(18, 0)), task: 'Surveillance Glycémique', status: 'pending', patientName: 'Yao Kouadio', bedId: '201B', type: 'monitoring' },
        { scheduledAt: new Date(now.setHours(10, 0)), task: 'Toilette et aide à la marche', status: 'pending', patientName: 'Koffi Amenan', bedId: '101B', type: 'care' },
      ];
      await this.repo.save(defaults);
      return this.repo.find({ order: { scheduledAt: 'ASC' } });
    }
    return plans;
  }

  async update(id: string, updateDto: any) {
    if (updateDto.status === 'done') {
      updateDto.performedAt = new Date();
    }
    await this.repo.update(id, updateDto);
    return this.repo.findOne({ where: { id } });
  }

  findByPatient(patientId: string) {
    return this.repo.find({ where: { patientId }, order: { scheduledAt: 'DESC' } });
  }
}
