import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Profile } from './profile.entity';

@Entity('user_invitations')
export class UserInvitation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  profile: Profile;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column({ name: 'otp_code' })
  otpCode: string;

  @ApiProperty()
  @Column({ name: 'temp_password' })
  tempPassword: string;

  @ApiProperty({ example: '2026-03-31T23:59:59Z' })
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @ApiProperty()
  @Column({ default: false })
  used: boolean;

  @ApiProperty()
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
