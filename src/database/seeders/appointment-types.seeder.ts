import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentType } from '../../modules/appointments/entities/appointment-type.entity';

export async function seedAppointmentTypes(app: INestApplication) {
  const appointmentTypeRepo = app.get<Repository<AppointmentType>>(
    getRepositoryToken(AppointmentType),
  );

  const count = await appointmentTypeRepo.count();
  if (count > 0) {
    console.log('📅 Types de rendez-vous déjà existants');
    return;
  }

  const types = [
    {
      name: 'Consultation générale',
      description: 'Consultation médicale standard',
      duration_minutes: 30,
      color: '#3B82F6',
    },
    {
      name: 'Consultation spécialisée',
      description: 'Consultation avec un spécialiste',
      duration_minutes: 45,
      color: '#8B5CF6',
    },
    {
      name: 'Suivi',
      description: 'Consultation de suivi',
      duration_minutes: 20,
      color: '#10B981',
    },
    {
      name: 'Urgence',
      description: "Consultation d'urgence",
      duration_minutes: 15,
      color: '#EF4444',
    },
    {
      name: 'Examen',
      description: 'Examen médical',
      duration_minutes: 60,
      color: '#F59E0B',
    },
  ];

  for (const type of types) {
    const appointmentType = appointmentTypeRepo.create({
      name: type.name,
      description: type.description,
      durationMinutes: type.duration_minutes,
      color: type.color,
      isActive: true,
    });
    await appointmentTypeRepo.save(appointmentType);
  }

  console.log('✅ Types de rendez-vous créés avec succès');
}
