import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class MenstrualPhase {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase ID (Auto generated).',
  })
  id: number;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase title e.g Menstrual phase 1.',
  })
  title: string;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase cover photo.',
  })
  coverPhoto: string;

  @Column({
    default: 0,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase position e.g 1.',
  })
  position: number;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}

@Entity()
export class MenstrualPhaseDescription {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase info ID (Auto generated).',
  })
  id: number;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase info title e.g Menstrual phase info 1.',
  })
  title: string;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase info description e.g Menstrual phase info 1.',
  })
  description: string;

  @Column({
    default: 0,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Menstrual phase info position e.g 1.',
  })
  position: number;

  @ManyToOne(() => MenstrualPhase, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'menstrual_phase' })
  menstrualPhase: MenstrualPhase;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}

export class MenstrualPhaseDescriptionInfo {
  @ApiProperty({
    description: 'Menstrual phase info ID (Auto generated).',
  })
  id: string;

  @ApiProperty({
    description: 'Menstrual phase info title e.g Menstrual phase info 1.',
  })
  title: string;

  @ApiProperty({
    description:
      'Menstrual phase info descriptions e.g Menstrual phase info 1.',
  })
  description: string;
}

export class MenstrualPhaseInfo {
  @ApiProperty({
    description: 'Menstrual phase info ID (Auto generated).',
  })
  id: string;

  @ApiProperty({
    description: 'Menstrual phase info title e.g Menstrual phase info 1.',
  })
  title: string;

  @ApiProperty({
    description:
      'Menstrual phase info cover photo e.g https://example.com/cover-photo.jpg.',
  })
  coverPhoto: string;

  @ApiProperty({
    isArray: true,
    type: MenstrualPhaseDescriptionInfo,
    description:
      'Menstrual phase info descriptions e.g Menstrual phase info 1.',
  })
  descriptions: MenstrualPhaseDescriptionInfo[];
}
