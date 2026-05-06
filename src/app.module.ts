import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
// ... existing imports ...
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { PractitionersModule } from './modules/practitioners/practitioners.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { QueueModule } from './modules/queue/queue.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ConsultationNotesModule } from './modules/consultation-notes/consultation-notes.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { GuardsModule } from './modules/guards/guards.module';
import { HealthModule } from './modules/health/health.module';
import { SettingsModule } from './modules/settings/settings.module';
import { RpcModule } from './modules/rpc/rpc.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { ChatModule } from './modules/chat/chat.module';
import { BillableItemsModule } from './modules/billable-items/billable-items.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

import { MailerModule } from '@nestjs-modules/mailer';
import { LabRequestsModule } from './modules/lab-requests/lab-requests.module';
import { PharmacyPrescriptionsModule } from './modules/pharmacy-prescriptions/pharmacy-prescriptions.module';
import { PharmacyInventoryModule } from './modules/pharmacy-inventory/pharmacy-inventory.module';
import { InpatientBedsModule } from './modules/inpatient-beds/inpatient-beds.module';
import { NursingCarePlansModule } from './modules/nursing-care-plans/nursing-care-plans.module';
import { ClinicalActsModule } from './modules/clinical-acts/clinical-acts.module';
import { AmbulanceTransfersModule } from './modules/ambulance-transfers/ambulance-transfers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { VitalSignsModule } from './modules/vital-signs/vital-signs.module';
import { CareProtocolsModule } from './modules/care-protocols/care-protocols.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { BackupModule } from './modules/backup/backup.module';
import { NursingNotesModule } from './modules/nursing-notes/nursing-notes.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    CommonModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get('SMTP_PORT'),
          secure: config.get('SMTP_PORT') === '465',
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: config.get('SMTP_FROM') || '"MedAgenda" <noreply@medagenda.com>',
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    PractitionersModule,
    ResourcesModule,
    AppointmentsModule,
    InvoicesModule,
    QueueModule,
    ActivityLogsModule,
    DepartmentsModule,
    CurrenciesModule,
    GuardsModule,
    NotificationsModule,
    PermissionsModule,
    ConsultationNotesModule,
    HealthModule,
    SettingsModule,
    RpcModule,
    DocumentsModule,
    DashboardModule,
    InvitationsModule,
    ChatModule,
    StatisticsModule,
    BillableItemsModule,
    LabRequestsModule,
    PharmacyPrescriptionsModule,
    PharmacyInventoryModule,
    InpatientBedsModule,
    NursingCarePlansModule,
    ClinicalActsModule,
    AmbulanceTransfersModule,
    SuppliersModule,
    PurchaseOrdersModule,
    VitalSignsModule,
    CareProtocolsModule,
    ExpensesModule,
    BackupModule,
    NursingNotesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

      // Create BackupLogs table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "backup_logs" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "filename" character varying NOT NULL,
          "status" character varying NOT NULL DEFAULT 'IN_PROGRESS',
          "size" numeric,
          "errorMessage" text,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_backup_logs" PRIMARY KEY ("id")
        )
      `);

      // Create Suppliers table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "suppliers" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "email" character varying,
          "phone" character varying,
          "address" character varying,
          "taxId" character varying,
          "isActive" boolean NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
        )
      `);

      // Create Purchase Orders table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "purchase_orders" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "orderNumber" character varying NOT NULL,
          "supplierId" character varying NOT NULL,
          "supplierName" character varying NOT NULL,
          "status" character varying NOT NULL DEFAULT 'pending',
          "items" jsonb,
          "totalAmount" numeric(12,2) NOT NULL DEFAULT 0,
          "expectedArrivalDate" TIMESTAMP,
          "receivedDate" TIMESTAMP,
          "notes" text,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_purchase_orders" PRIMARY KEY ("id")
        )
      `);

      // Create Pharmacy Inventory table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "pharmacy_inventory" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "category" character varying,
          "itemType" character varying NOT NULL DEFAULT 'DRUG',
          "sku" character varying,
          "stock" numeric(10,2) NOT NULL DEFAULT 0,
          "min_stock" numeric(10,2) NOT NULL DEFAULT 10,
          "location" character varying,
          "unitPrice" numeric(12,2) DEFAULT 0,
          "unit" character varying,
          "batch_number" character varying,
          "expiry_date" DATE,
          "status" character varying NOT NULL DEFAULT 'ACTIVE',
          "preferredSupplierId" character varying,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_pharmacy_inventory" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_pharmacy_inventory_sku" UNIQUE ("sku")
        )
      `);

      // Create Stock Movements table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "stock_movements" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "item_id" uuid NOT NULL,
          "type" character varying NOT NULL,
          "quantity" numeric(12,2) NOT NULL,
          "reason" text,
          "performed_by_id" uuid,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_stock_movements" PRIMARY KEY ("id"),
          CONSTRAINT "FK_stock_movements_item" FOREIGN KEY ("item_id") REFERENCES "pharmacy_inventory"("id") ON DELETE CASCADE
        )
      `);

      // Create Pharmacy Prescriptions table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "pharmacy_prescriptions" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "patientId" character varying NOT NULL,
          "patientName" character varying NOT NULL,
          "ticketCode" character varying,
          "prescriptions" jsonb NOT NULL,
          "status" character varying NOT NULL DEFAULT 'pending',
          "prescribedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_pharmacy_prescriptions" PRIMARY KEY ("id")
        )
      `);

      // Create Vital Signs table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "vital_signs" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "patientId" character varying NOT NULL,
          "temperature" numeric(4,1),
          "systolicBP" integer,
          "diastolicBP" integer,
          "pulse" integer,
          "spO2" integer,
          "respiratoryRate" integer,
          "weight" numeric(5,2),
          "notes" text,
          "recordedById" character varying NOT NULL,
          "recordedByName" character varying NOT NULL,
          "recordedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_vital_signs" PRIMARY KEY ("id")
        )
      `);

      // Create Care Protocols table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "care_protocols" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "description" text,
          "category" character varying DEFAULT 'général',
          "tasks" jsonb NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_care_protocols" PRIMARY KEY ("id")
        )
      `);

      // Create Insurers table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "insurers" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "code" character varying,
          "coverage_rate" numeric(5,2) DEFAULT 0,
          "contact_name" character varying,
          "email" character varying,
          "phone" character varying,
          "address" character varying,
          "city" character varying,
          "postal_code" character varying,
          "website" character varying,
          "is_active" boolean DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_insurers" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_insurers_code" UNIQUE ("code")
        )
      `);

      // Add missing columns to insurers if they already exist
      await queryRunner.query(`
        ALTER TABLE "insurers" 
        ADD COLUMN IF NOT EXISTS "code" character varying,
        ADD COLUMN IF NOT EXISTS "address" character varying,
        ADD COLUMN IF NOT EXISTS "city" character varying,
        ADD COLUMN IF NOT EXISTS "postal_code" character varying,
        ADD COLUMN IF NOT EXISTS "website" character varying
      `);

      // Add insurance fields to invoices
      await queryRunner.query(`
        ALTER TABLE "invoices" 
        ADD COLUMN IF NOT EXISTS "insurer_id" uuid,
        ADD COLUMN IF NOT EXISTS "insurance_amount" numeric(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "patient_amount" numeric(12,2) DEFAULT 0
      `);

      // Add coverage_rate and health info to patients
      await queryRunner.query(`
        ALTER TABLE "patients" 
        ADD COLUMN IF NOT EXISTS "insurer_id" uuid,
        ADD COLUMN IF NOT EXISTS "coverage_rate" numeric(5,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "weight" numeric(5,2),
        ADD COLUMN IF NOT EXISTS "height" numeric(5,2),
        ADD COLUMN IF NOT EXISTS "blood_type" character varying,
        ADD COLUMN IF NOT EXISTS "nationality" character varying,
        ADD COLUMN IF NOT EXISTS "occupation" character varying,
        ADD COLUMN IF NOT EXISTS "marital_status" character varying,
        ADD COLUMN IF NOT EXISTS "chronic_diseases" text,
        ADD COLUMN IF NOT EXISTS "current_medications" text,
        ADD COLUMN IF NOT EXISTS "family_history" text,
        ADD COLUMN IF NOT EXISTS "vaccination_history" text,
        ADD COLUMN IF NOT EXISTS "allergies" text,
        ADD COLUMN IF NOT EXISTS "medical_notes" text,
        ADD COLUMN IF NOT EXISTS "emergency_contact_name" character varying,
        ADD COLUMN IF NOT EXISTS "emergency_contact_phone" character varying
      `);

      // Add preferredSupplierId to pharmacy_inventory if missing
      await queryRunner.query(`
        ALTER TABLE "pharmacy_inventory" 
        ADD COLUMN IF NOT EXISTS "preferredSupplierId" character varying;
      `);

      // Add signature fields to consultations and password change flag to profiles
      await queryRunner.query(`
        ALTER TABLE "consultation_notes" 
        ADD COLUMN IF NOT EXISTS "is_signed" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "signed_at" timestamptz,
        ADD COLUMN IF NOT EXISTS "signature_hash" text
      `);

      await queryRunner.query(`
        ALTER TABLE "profiles"
        ADD COLUMN IF NOT EXISTS "must_change_password" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "theme_mode" character varying DEFAULT 'light',
        ADD COLUMN IF NOT EXISTS "two_factor_secret" character varying,
        ADD COLUMN IF NOT EXISTS "is_two_factor_enabled" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "patient_id" uuid
      `);

      // Create supplier_prices table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "supplier_prices" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "supplierId" uuid NOT NULL,
          "productName" character varying NOT NULL,
          "negotiatedPrice" numeric(12,2) NOT NULL,
          "currency" character varying DEFAULT 'CFA',
          "validUntil" DATE,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_supplier_prices" PRIMARY KEY ("id")
        )
      `);

      // Create Documents table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "documents" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "patient_id" uuid NOT NULL,
          "practitioner_id" uuid,
          "name" character varying NOT NULL,
          "type" character varying,
          "file_url" character varying NOT NULL,
          "file_type" character varying,
          "file_size" integer,
          "notes" text,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_documents" PRIMARY KEY ("id")
        )
      `);

      // Create Nursing Notes table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "nursing_notes" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "patientId" character varying NOT NULL,
          "authorName" character varying NOT NULL,
          "content" text NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_nursing_notes" PRIMARY KEY ("id")
        )
      `);

      console.log('✅ Supply Chain, Documents & Nursing Notes tables verified/created');
    } catch (error) {
      console.error('❌ Error creating supply chain tables:', error);
    } finally {
      await queryRunner.release();
    }
  }
}
