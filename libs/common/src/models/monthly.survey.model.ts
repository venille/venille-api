import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.model';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MonthlySurveyPeriodDuration } from '../constants/enums';

@Entity()
export class MonthlySurvey {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Monthly survey ID (Auto generated).',
  })
  id: number;

  @Column({
    default: false,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'User has access to pad e.g false',
  })
  hasAccessToPad: boolean;

  @Column({
    nullable: true,
    enum: MonthlySurveyPeriodDuration,
    default: MonthlySurveyPeriodDuration.None,
  })
  @ApiPropertyOptional({
    description: 'Monthly survey days managing period.',
  })
  daysManagingPeriod: MonthlySurveyPeriodDuration;

  @Column({
    default: '[ ]',
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Monthly survey challengesFaced.',
  })
  challengesFaced: string;

  @ManyToOne(() => Account, {
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

export class MonthlySurveyInfo {
  @ApiPropertyOptional({
    description: 'Monthly survey ID (Auto generated).',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Monthly survey days managing period.',
  })
  daysManagingPeriod: string;

  @ApiPropertyOptional({
    type: [String],
    isArray: true,
    description: 'Monthly survey challengesFaced.',
  })
  challengesFaced: string[];

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Monthly survey hasAccessToPad.',
  })
  hasAccessToPad: boolean;
}

export class MonthlySurveyHistoryResponse {
  @ApiProperty({
    isArray: true,
    type: MonthlySurveyInfo,
    description: 'Monthly survey history.',
  })
  surveys: MonthlySurveyInfo[];

  @ApiProperty({
    description: 'Total number of pages.',
  })
  totalPages: number;

  @ApiProperty({
    description: 'Has next page.',
  })
  hasNext: boolean;
}
