import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum BackupStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
}

@Entity('backup_logs')
export class BackupLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ type: 'enum', enum: BackupStatus, default: BackupStatus.IN_PROGRESS })
  status: BackupStatus;

  @Column({ type: 'numeric', nullable: true })
  size: number; // in bytes

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
