import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  CycleGoal,
  HealthCondition,
  PeriodSymptomEnum,
  BirthControlMethod,
} from '../constants/enums';
import { Account } from './account.model';

@Entity()
export class PeriodTracker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: true })
  lastPeriodStartDate: Date;

  @Column({ nullable: true, default: 0 })
  periodLengthDays: number;

  @Column({ nullable: true, default: 0 })
  cycleLengthDays: number;

  @Column({ nullable: true, default: false })
  irregularPeriods: boolean;

  @Column({
    default: '',
    nullable: true,
  })
  periodSymptoms: string;

  @Column({ nullable: true, default: false })
  trackingOvulation: boolean;

  @Column({ nullable: true, default: 0 })
  age: number;

  @Column({
    default: '',
    nullable: true,
  })
  birthControlMethods: string;

  @Column({
    default: '',
    nullable: true,
  })
  healthConditions: string;

  @Column({ nullable: true, default: false })
  wantReminders: boolean;

  @OneToOne(() => Account, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'account' })
  account: Account;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
