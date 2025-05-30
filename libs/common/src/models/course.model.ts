import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseCategory } from '../constants/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Course {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Course ID (Auto generated).',
  })
  id: number;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Course title e.g Tunde.',
  })
  title: string;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Course description e.g Omotayo.',
  })
  description: string;

  @Column({
    nullable: true,
    enum: CourseCategory,
    default: CourseCategory.UNDERSTANDING_YOUR_BODY,
  })
  @ApiPropertyOptional({
    description: 'Course category e.g Omotayo.',
  })
  category: CourseCategory;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Course cover photo e.g Omotayo.',
  })
  coverPhoto: string;

  @Column({
    default: 0,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Course position e.g 1.',
  })
  position: number;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}

export class CourseInfo {
  @ApiProperty({
    description: 'Course ID (Auto generated).',
  })
  id: number;

  @ApiProperty({
    description: 'Course info title e.g Understanding Your Body.',
  })
  title: string;

  @ApiProperty({
    description:
      'Course info description e.g This course is about understanding your body.',
  })
  description: string;

  @ApiProperty({
    description:
      'Course info cover photo e.g https://example.com/cover-photo.jpg.',
  })
  coverPhoto: string;

  @ApiProperty({
    enum: CourseCategory,
    description: 'Course info category e.g understanding-your-body.',
  })
  category: CourseCategory;
}

export class CourseCategoryInfo {
  @ApiProperty({
    example: 'Understanding Your Body',
  })
  title: string;

  @ApiProperty({
    isArray: true,
    type: CourseInfo,
    description: 'Course info list.',
  })
  courses: CourseInfo[];
}
