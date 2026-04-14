import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabRequest } from './entities/lab-request.entity';

@Injectable()
export class LabRequestsService {
  constructor(
    @InjectRepository(LabRequest)
    private repo: Repository<LabRequest>,
  ) {}

  create(createDto: any) {
    const entity = this.repo.create(createDto as Partial<LabRequest>);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { prescribedAt: 'DESC' } });
  }

  async findOne(id: string) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Lab Request not found');
    return req;
  }

  async update(id: string, updateDto: any) {
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
