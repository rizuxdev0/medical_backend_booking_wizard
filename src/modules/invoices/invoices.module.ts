import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';

import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { BillableItem } from './entities/billable-item.entity';
import { InvoiceInstallment } from './entities/invoice-installment.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { Insurer } from './entities/insurer.entity';
import { InsurersController } from './insurers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Payment,
      InvoiceInstallment,
      BillableItem,
      Patient,
      Practitioner,
      Appointment,
      Insurer,
    ]),
  ],
  controllers: [InvoicesController, InsurersController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
