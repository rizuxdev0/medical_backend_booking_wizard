import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbulanceTransfer } from './entities/ambulance-transfer.entity';

@Injectable()
export class AmbulanceTransfersService {
  constructor(
    @InjectRepository(AmbulanceTransfer)
    private repo: Repository<AmbulanceTransfer>,
  ) {}

  create(createDto: any) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { scheduledAt: 'DESC' } });
  }

  async update(id: string, updateDto: any) {
    await this.repo.update(id, updateDto);
    return this.repo.findOne({ where: { id } });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
