import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierPrice } from './entities/supplier-price.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private repo: Repository<Supplier>,
    @InjectRepository(SupplierPrice)
    private priceRepo: Repository<SupplierPrice>,
  ) {}

  // Negotiated Prices Catalog
  async findPricesBySupplier(supplierId: string) {
    return this.priceRepo.find({ where: { supplierId } });
  }

  async addNegotiatedPrice(dto: any) {
    const price = this.priceRepo.create(dto);
    return this.priceRepo.save(price);
  }

  async findAll() {
    const suppliers = await this.repo.find({ order: { name: 'ASC' } });
    if (suppliers.length === 0) {
      // Seed some default suppliers
      const defaults = [
        { name: 'Pharmacie Centrale de Distribution', email: 'contact@pcd.ci', phone: '+225 27 00 00 00', address: 'Abidjan, Zone 4', taxId: 'CI-ABJ-001' },
        { name: 'Labo Services SARL', email: 'sales@laboservices.ci', phone: '+225 21 00 11 22', address: 'Abidjan, Yopougon', taxId: 'CI-ABJ-002' },
      ];
      await this.repo.save(defaults);
      return this.repo.find({ order: { name: 'ASC' } });
    }
    return suppliers;
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: any) {
    const s = this.repo.create(dto);
    return this.repo.save(s);
  }

  async update(id: string, dto: any) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
