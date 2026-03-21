import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillableItem } from '../invoices/entities/billable-item.entity';

@Injectable()
export class BillableItemsService {
  constructor(
    @InjectRepository(BillableItem)
    private readonly billableItemRepo: Repository<BillableItem>,
  ) {}

  async findAll() {
    return this.billableItemRepo.find({
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.billableItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Article non trouvé');
    return item;
  }

  async create(data: any) {
    const item = this.billableItemRepo.create(data);
    return this.billableItemRepo.save(item);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.billableItemRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.billableItemRepo.remove(item);
    return { success: true };
  }
}
