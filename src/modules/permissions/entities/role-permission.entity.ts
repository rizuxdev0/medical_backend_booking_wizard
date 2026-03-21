import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

export type AppRole =
  | 'admin'
  | 'doctor'
  | 'secretary'
  | 'patient'
  | 'nurse'
  | 'accountant'
  | 'supervisor';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  role: AppRole;


  @Column({ name: 'permission_code' })
  permissionCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permission_code', referencedColumnName: 'code' })
  permission: Permission;
}
