import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('care_protocols')
export class CareProtocol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'général' })
  category: string; // post-op, chronic, intake, etc.

  @Column('jsonb')
  tasks: any[]; // Array of { title: string, category: string, frequency: string, instructions: string }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
