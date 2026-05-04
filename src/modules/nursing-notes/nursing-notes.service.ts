import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NursingNote } from './entities/nursing-note.entity';

@Injectable()
export class NursingNotesService {
  constructor(
    @InjectRepository(NursingNote)
    private repo: Repository<NursingNote>,
  ) {}

  findAllByPatient(patientId: string) {
    return this.repo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  create(data: Partial<NursingNote>) {
    const note = this.repo.create(data);
    return this.repo.save(note);
  }
}
