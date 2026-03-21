import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

export type AppRole =
  | 'admin'
  | 'doctor'
  | 'secretary'
  | 'patient'
  | 'nurse'
  | 'accountant'
  | 'supervisor';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  role: AppRole;


  @ManyToOne(() => Profile, (profile) => profile.roles)
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}
