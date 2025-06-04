import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  OnboardingQuestionType,
  OnboardingQuestionOptionType,
  QuestionEnumType,
} from '../constants/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class OnboardingQuestion {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Onboarding question ID (Auto generated).',
  })
  id: number;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Onboarding question e.g When did your first period start?',
  })
  question: string;

  @Column({
    default: '[]',
    nullable: true,
  })
  @ApiPropertyOptional({
    description:
      'Multiple choice options as JSON array e.g ["Yes", "No", "Maybe"]',
  })
  options: string;

  @Column({
    nullable: true,
    default: '',
    enum: OnboardingQuestionType,
  })
  @ApiPropertyOptional({
    description:
      'Type of question options e.g multiple-choice, numeric-range, date-range',
  })
  questionType: OnboardingQuestionType;

  @Column({
    nullable: true,
    enum: OnboardingQuestionOptionType,
    default: OnboardingQuestionOptionType.TEXT,
  })
  optionType: OnboardingQuestionOptionType;

  @Column({
    nullable: true,
    enum: QuestionEnumType,
    // default: QuestionEnumType.PeriodSymptom,
  })
  @ApiPropertyOptional({
    description:
      'Enum type e.g PeriodSymptom, HealthCondition, AdditionalTracking, BirthControlMethod, ReminderType, CycleGoal',
  })
  enumType: QuestionEnumType;

  @Column({
    nullable: true,
    default: 0,
  })
  @ApiPropertyOptional({
    description: 'Position of the question in the onboarding process',
  })
  position: number;

  @Column({
    nullable: true,
    default: false,
  })
  @ApiPropertyOptional({
    description: 'Is the question user input?',
  })
  isUserInput: boolean;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}

export class OnboardingQuestionInfo {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'When did your first period start?' })
  question: string;

  @ApiProperty({ example: 'multiple-choice' })
  questionType: OnboardingQuestionType;

  @ApiProperty({ example: 'text' })
  optionType: OnboardingQuestionOptionType;

  @ApiProperty({ example: 'PeriodSymptom' })
  enumType: QuestionEnumType;

  @ApiProperty({ example: ['Yes', 'No', 'Maybe'], isArray: true })
  options: string[];

  @ApiProperty({ example: false })
  isUserInput: boolean;

  @ApiProperty({ example: 1 })
  position: number;
}