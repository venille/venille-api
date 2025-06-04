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
  ReminderType,
  PeriodSymptom,
  HealthCondition,
  AdditionalTracking,
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

  @Column({ enum: PeriodSymptom, default: PeriodSymptom.ACNE, nullable: true })
  periodSymptoms: PeriodSymptom;

  @Column({ nullable: true, default: false })
  trackingOvulation: boolean;

  @Column({ nullable: true, default: 0 })
  age: number;

  @Column({
    enum: BirthControlMethod,
    default: BirthControlMethod.NONE,
    nullable: true,
  })
  birthControlMethods: BirthControlMethod;

  @Column({
    enum: HealthCondition,
    default: HealthCondition.OTHER,
    nullable: true,
  })
  healthConditions: HealthCondition;

  @Column({
    enum: AdditionalTracking,
    default: AdditionalTracking.OTHER,
    nullable: true,
  })
  additionalTracking: AdditionalTracking;

  @Column({ nullable: true, default: false })
  wantReminders: boolean;

  @Column({
    enum: ReminderType,
    default: ReminderType.PERIOD_START,
    nullable: true,
  })
  reminderTypes: ReminderType;

  @Column({
    enum: CycleGoal,
    default: CycleGoal.JUST_TRACKING,
    nullable: true,
  })
  cycleGoal: CycleGoal;

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
