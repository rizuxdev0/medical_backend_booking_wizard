// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   OneToMany,
// } from 'typeorm';
// import { UserRole } from './user-role.entity';

// @Entity('profiles')
// export class Profile {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ unique: true })
//   email: string;

//   @Column({ name: 'password_hash' })
//   passwordHash: string;

//   @Column({ name: 'first_name', nullable: true })
//   firstName: string;

//   @Column({ name: 'last_name', nullable: true })
//   lastName: string;

//   @Column({ nullable: true })
//   phone: string;

//   @Column({ name: 'avatar_url', nullable: true })
//   avatarUrl: string;

//   @Column({ nullable: true })
//   department: string;

//   @Column({ name: 'job_title', nullable: true })
//   jobTitle: string;

//   @Column({ name: 'employee_id', nullable: true })
//   employeeId: string;

//   @Column({ nullable: true })
//   notes: string;

//   @Column({ name: 'is_active', default: true })
//   isActive: boolean;

//   @Column({ name: 'last_login_at', nullable: true, type: 'timestamptz' })
//   lastLoginAt: Date;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;

//   @OneToMany(() => UserRole, (role) => role.user)
//   roles: UserRole[];
// }
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string; // Utilisez le nom exact de la colonne

  @Column({ name: 'first_name', nullable: true })
  first_name: string; // Utilisez first_name au lieu de firstName

  @Column({ name: 'last_name', nullable: true })
  last_name: string; // Utilisez last_name au lieu de lastName

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  department: string;

  @Column({ name: 'job_title', nullable: true })
  job_title: string;

  @Column({ name: 'employee_id', nullable: true })
  employee_id: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamptz' })
  last_login_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patient_id: string;

  @OneToMany(() => UserRole, (role) => role.user)
  roles: UserRole[];
}
