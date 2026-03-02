import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'head_user_id', nullable: true })
  headUserId: string;

  @Column({ name: 'parent_department_id', nullable: true })
  parentDepartmentId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'head_user_id' })
  head: Profile;

  @ManyToOne(() => Department, (department) => department.children)
  @JoinColumn({ name: 'parent_department_id' })
  parent: Department;

  @OneToMany(() => Department, (department) => department.parent)
  children: Department[];
}
