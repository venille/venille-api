import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.model';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class PeriodTrackerRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, {
    eager: true,
    onDelete: 'CASCADE',
  })
  account: Account;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: false })
  isPredicted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class PeriodOvulationPrediction {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Account, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  account: Account;

  @Column({ type: 'date' })
  ovulationDate: Date;

  @Column({ default: false })
  isPredicted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class PeriodSymptomLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, {
    eager: true,
    onDelete: 'CASCADE',
  })
  account: Account;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ default: '[ ]', nullable: true })
  symptoms: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export class DailyInsightsSummary {
  @ApiProperty({ example: '2025-06-05', type: Date })
  date: Date;

  @ApiProperty({ example: false })
  isPredictedPeriodDay: boolean;

  @ApiProperty({ example: false })
  isPredictedOvulationDay: boolean;

  @ApiProperty({ example: false })
  isFertileDay: boolean;

  @ApiProperty({ example: 'You are not on your predicted period day' })
  todayInsights: string;
}

export class PeriodTrackerCalendarInfo {
  @ApiProperty({ example: 'June' })
  currentMonth: string; // e.g. "June"

  @ApiProperty({ example: 2025 })
  currentYear: number;

  @ApiProperty({
    example: ['2025-06-25', '2025-06-26'],
    type: String,
    isArray: true,
    items: { type: 'string' },
  })
  predictedPeriodDays: string[]; // for next cycle

  @ApiProperty({
    type: DailyInsightsSummary,
    isArray: true,
  })
  dailyInsights: DailyInsightsSummary[]; // for next cycle

  @ApiProperty({ example: '2025-06-18' })
  ovulationDate: string; // e.g. "2025-06-18"
}

export class PeriodTrackerOvulationCountdown {
  @ApiProperty({ example: 0 })
  ovulationInDays: number; // e.g. 0 if it's today

  @ApiProperty({ example: true })
  isToday: boolean;
}

export class PeriodTrackerReminderInfo {
  @ApiProperty({ example: 'Period Start' })
  title: string;

  @ApiProperty({ example: '2025-06-05T00:00:00.000Z' })
  reminderTime: string; // ISO timestamp

  @ApiProperty({ example: true })
  isRecurring: boolean;

  @ApiProperty({
    example: ['Monday', 'Wednesday'],
    type: String,
    isArray: true,
    items: { type: 'string' },
  })
  daysOfWeek: string[]; // optional if recurring
}

export class PeriodTrackerLastPeriodInfo {
  @ApiProperty({ example: '2025-06-05' })
  startDate: string;

  @ApiProperty({ example: '2025-06-06' })
  endDate: string;

  @ApiProperty({ example: true })
  isPredicted: boolean;
}

export class PeriodTrackerInfo {
  @ApiProperty({ example: '2025-06-05', type: String })
  today: string;

  @ApiProperty({ type: PeriodTrackerCalendarInfo })
  calendar: PeriodTrackerCalendarInfo;

  @ApiProperty({ type: PeriodTrackerOvulationCountdown })
  ovulationCountdown: PeriodTrackerOvulationCountdown;

  @ApiProperty({
    type: String,
    isArray: true,
    example: ['Cramps', 'Fatigue'],
    items: { type: 'string' },
  })
  symptomsLoggedToday: string[];

  @ApiProperty({
    type: PeriodTrackerReminderInfo,
    isArray: true,
    items: {
      type: 'object',
      $ref: '#/components/schemas/PeriodTrackerReminderInfo',
    },
  })
  reminders: PeriodTrackerReminderInfo[];

  @ApiProperty({ type: PeriodTrackerLastPeriodInfo })
  lastPeriod: PeriodTrackerLastPeriodInfo;

  @ApiProperty({ example: false })
  isCurrentMonth: boolean;
}

export class PeriodTrackerDayInfo {
  @ApiProperty({ example: '2025-06-05', type: Date })
  date: Date;

  @ApiProperty({ example: false, type: Boolean })
  isToday: boolean;

  @ApiProperty({ example: 1, type: Number })
  periodDayCount: number;

  @ApiProperty({ example: 1, type: Number })
  cycleDayCount: number;

  @ApiProperty({ example: false, type: Boolean })
  isPredictedPeriodDay: boolean;

  @ApiProperty({ example: false, type: Boolean })
  isFertileDay: boolean;

  @ApiProperty({ example: false, type: Boolean })
  isPredictedOvulationDay: boolean;

  @ApiProperty({
    type: String,
    example: 'You are not on your predicted period day',
  })
  insights: string;
}

export class PeriodTrackerWeekInfo {
  @ApiProperty({ example: 'April 2025', type: String })
  monthTitle: string;

  @ApiProperty({ type: PeriodTrackerDayInfo, isArray: true })
  days: PeriodTrackerDayInfo[];
}

export class DashboardTrackerInfo {
  @ApiProperty({ type: PeriodTrackerWeekInfo })
  previousWeek: PeriodTrackerWeekInfo;

  @ApiProperty({ type: PeriodTrackerWeekInfo })
  currentWeek: PeriodTrackerWeekInfo;

  @ApiProperty({ type: PeriodTrackerWeekInfo })
  nextWeek: PeriodTrackerWeekInfo;
}

export class PeriodLogInfo {
  @ApiProperty({ example: '2025-06-05', type: Date })
  startDate: Date;

  @ApiProperty({ example: '2025-06-06', type: Date })
  endDate: Date;

  @ApiProperty({ example: false, type: Boolean })
  isPredicted: boolean;
}