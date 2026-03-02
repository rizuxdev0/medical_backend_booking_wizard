import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BillableItem } from 'src/modules/invoices/entities/billable-item.entity';
import { Repository } from 'typeorm';

export async function seedBillableItems(app: INestApplication) {
  const billableItemRepo = app.get<Repository<BillableItem>>(
    getRepositoryToken(BillableItem),
  );

  const count = await billableItemRepo.count();
  if (count > 0) {
    console.log('💰 Items facturables déjà existants');
    return;
  }

  const items = [
    {
      name: 'Consultation générale',
      code: 'CONS-GEN',
      category: 'consultation',
      unit_price: 30000,
      tax_rate: 18,
    },
    {
      name: 'Consultation spécialisée',
      code: 'CONS-SPE',
      category: 'consultation',
      unit_price: 50000,
      tax_rate: 18,
    },
    {
      name: 'Consultation de suivi',
      code: 'CONS-SUI',
      category: 'consultation',
      unit_price: 20000,
      tax_rate: 18,
    },
    {
      name: 'Examen sanguin',
      code: 'LAB-SANG',
      category: 'laboratoire',
      unit_price: 15000,
      tax_rate: 18,
    },
    {
      name: 'Radiographie',
      code: 'RADIO',
      category: 'imagerie',
      unit_price: 25000,
      tax_rate: 18,
    },
    {
      name: 'Échographie',
      code: 'ECHO',
      category: 'imagerie',
      unit_price: 35000,
      tax_rate: 18,
    },
    {
      name: 'Scanner',
      code: 'SCAN',
      category: 'imagerie',
      unit_price: 75000,
      tax_rate: 18,
    },
    {
      name: 'IRM',
      code: 'IRM',
      category: 'imagerie',
      unit_price: 100000,
      tax_rate: 18,
    },
    {
      name: 'Hospitalisation (jour)',
      code: 'HOSP-JOUR',
      category: 'hospitalisation',
      unit_price: 50000,
      tax_rate: 18,
    },
    {
      name: 'Forfait maternité',
      code: 'MATERN',
      category: 'forfait',
      unit_price: 150000,
      tax_rate: 0,
    },
  ];

  for (const item of items) {
    const billableItem = billableItemRepo.create({
      name: item.name,
      code: item.code,
      category: item.category,
      unitPrice: item.unit_price,
      taxRate: item.tax_rate,
      isActive: true,
    });
    await billableItemRepo.save(billableItem);
  }

  console.log('✅ Items facturables créés avec succès');
}
