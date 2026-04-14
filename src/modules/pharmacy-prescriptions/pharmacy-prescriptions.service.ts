import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PharmacyPrescription } from './entities/pharmacy-prescription.entity';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class PharmacyPrescriptionsService {
  constructor(
    @InjectRepository(PharmacyPrescription)
    private repo: Repository<PharmacyPrescription>,
    private patientsService: PatientsService,
  ) {}

  async create(createDto: any) {
    // 1. Check for drug-allergy interactions
    if (createDto.patientId) {
      const patient = await this.patientsService.findOne(createDto.patientId);
      if (patient && patient.allergies) {
        const patientAllergies = patient.allergies.toLowerCase();
        const drugs = createDto.prescriptions || [];
        
        for (const drug of drugs) {
          if (patientAllergies.includes(drug.medication.toLowerCase())) {
            throw new BadRequestException(
              `ALERTE ALLERGIE : Le patient est allergique à "${drug.medication}". Prescription refusée.`
            );
          }
        }
      }
    }

    const entity = this.repo.create(createDto as Partial<PharmacyPrescription>);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { prescribedAt: 'DESC' } });
  }

  async findOne(id: string) {
    const pre = await this.repo.findOne({ where: { id } });
    if (!pre) throw new NotFoundException('Prescription not found');
    return pre;
  }

  async update(id: string, updateDto: any) {
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
