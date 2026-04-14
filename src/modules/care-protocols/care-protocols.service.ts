import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareProtocol } from './entities/care-protocol.entity';
import { NursingCarePlansService } from '../nursing-care-plans/nursing-care-plans.service';
import { NursingCarePlan } from '../nursing-care-plans/entities/nursing-care-plan.entity';

@Injectable()
export class CareProtocolsService {
  constructor(
    @InjectRepository(CareProtocol)
    private repo: Repository<CareProtocol>,
    private nursingService: NursingCarePlansService,
  ) {}

  async findAll() {
    const protocols = await this.repo.find({ order: { name: 'ASC' } });
    if (protocols.length === 0) {
      // Seed some default protocols
      const defaults = [
        { 
          name: 'Surveillance Post-Opératoire Standard', 
          category: 'Chirurgie',
          tasks: [
            { title: 'Constantes vitales toutes les 2h', category: 'monitoring', frequency: '2h', instructions: 'Temp, TA, Pouls, SaO2' },
            { title: 'Surveillance du pansement', category: 'care', frequency: '4h', instructions: 'Vérifier saignement ou suintement' },
            { title: 'Évaluation de la douleur (EVA)', category: 'monitoring', frequency: '4h', instructions: 'Administrer antalgique si EVA > 3' },
          ]
        },
        { 
          name: 'Protocole Diabétique (Insulinodépendant)', 
          category: 'Endocrino',
          tasks: [
            { title: 'Glycémie capillaire pré-prandiale', category: 'monitoring', frequency: 'before_meals', instructions: 'Noter dans le carnet' },
            { title: 'Injection insuline rapide', category: 'medication', frequency: 'before_meals', instructions: 'Selon protocole mobile' },
            { title: 'Surveillance des membres inférieurs', category: 'care', frequency: 'daily', instructions: 'Vérifier plaies ou rougeurs' },
          ]
        }
      ];
      await this.repo.save(defaults);
      return this.repo.find({ order: { name: 'ASC' } });
    }
    return protocols;
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: any) {
    const p = this.repo.create(dto);
    return this.repo.save(p);
  }

  async applyToPatient(id: string, patientId: string) {
    const protocol = await this.findOne(id);
    if (!protocol) throw new Error('Protocole non trouvé');

    const createdTasks: NursingCarePlan[] = [];
    for (const taskTemplate of protocol.tasks) {
      const newTask = await this.nursingService.create({
        patientId,
        title: taskTemplate.title,
        category: taskTemplate.category,
        description: taskTemplate.instructions || '',
        scheduledAt: new Date(),
        status: 'pending'
      });
      createdTasks.push(newTask);
    }
    return { protocol: protocol.name, tasksCount: createdTasks.length };
  }
}
