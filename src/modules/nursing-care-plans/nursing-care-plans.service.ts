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
    const entity = this.repo.create(createDto);
    return (this.repo.save(entity) as any) as Promise<NursingCarePlan>;
  }

  async findAll() {
    const plans = await this.repo.find({ order: { time: 'ASC' } });
    if (plans.length === 0) {
      const defaults = [
        { time: '08:00', task: 'Prise de Constantes (Temp, TA)', status: 'done', patientName: 'Alain Martin', bedId: '101A', type: 'monitoring' },
        { time: '09:00', task: 'Pansement post-opératoire', status: 'pending', patientName: 'Marie Dubois', bedId: '102A', type: 'care' },
        { time: '12:00', task: "Perfusion d'Amoxicilline 1g", status: 'pending', patientName: 'Alain Martin', bedId: '101A', type: 'medication' },
        { time: '14:30', task: "Injection Insuline SC", status: 'pending', patientName: 'Yao Kouadio', bedId: '201B', type: 'medication' },
        { time: '18:00', task: 'Surveillance Glycémique', status: 'pending', patientName: 'Yao Kouadio', bedId: '201B', type: 'monitoring' },
        { time: '10:00', task: 'Toilette et aide à la marche', status: 'pending', patientName: 'Koffi Amenan', bedId: '101B', type: 'care' },
      ];
      await this.repo.save(defaults);
      return this.repo.find({ order: { time: 'ASC' } });
    }
    return plans;
  }

  async update(id: string, updateDto: any) {
    await this.repo.update(id, updateDto);
    return this.repo.findOne({ where: { id } });
  }
}
