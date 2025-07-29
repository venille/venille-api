import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.model';
import { ApiProperty } from '@nestjs/swagger';

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

  @Column({ nullable: true, default: 0 })
  lutealPhaseLengthDays: number;

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

export class CycleOvulationInfo {
  @ApiProperty({ type: Number, example: 12 })
  cycleLength: number;
  
  @ApiProperty({ type: Number, example: 9 })
  periodLength: number;
  
  @ApiProperty({ type: Number, example: 8 })
  lutealPhaseLength: number;
}