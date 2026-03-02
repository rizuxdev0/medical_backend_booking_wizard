import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from '../../modules/users/entities/profile.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';

export async function createAdminUser(app: INestApplication) {
  const profileRepo = app.get<Repository<Profile>>(getRepositoryToken(Profile));
  const roleRepo = app.get<Repository<UserRole>>(getRepositoryToken(UserRole));

  try {
    // Vérifier si un admin existe déjà
    const adminRole = await roleRepo.findOne({
      where: { role: 'admin' },
      relations: ['user'],
    });

    if (adminRole) {
      console.log('👤 Un administrateur existe déjà');
      return;
    }

    // Créer l'utilisateur admin par défaut
    const adminEmail = 'admin@medagenda.com';
    const adminPassword = 'Admin123!';

    const existingUser = await profileRepo.findOne({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // Ajouter le rôle admin à l'utilisateur existant
      const role = roleRepo.create({
        user_id: existingUser.id,
        role: 'admin',
      });
      await roleRepo.save(role);
      console.log("👑 Rôle admin ajouté à l'utilisateur existant");
      return;
    }

    // Créer un nouvel utilisateur admin
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = profileRepo.create({
      email: adminEmail,
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'System',
      is_active: true,
    });

    await profileRepo.save(admin);

    const role = roleRepo.create({
      user_id: admin.id,
      role: 'admin',
    });

    await roleRepo.save(role);

    console.log('✅ Utilisateur admin créé avec succès');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Mot de passe:', adminPassword);
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error.message);
  }
}
