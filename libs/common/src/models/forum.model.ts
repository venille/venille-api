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
import { ForumCategory } from '../constants/enums';

@Entity()
export class Forum {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Forum ID (Auto generated).',
  })
  id: number;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Forum title e.g Tunde.',
  })
  title: string;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Forum description e.g Omotayo.',
  })
  description: string;

  @Column({
    nullable: true,
    enum: ForumCategory,
    default: ForumCategory.GENERAL,
  })
  @ApiPropertyOptional({
    description: 'Forum category e.g Omotayo.',
  })
  category: ForumCategory;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Forum image e.g Omotayo.',
  })
  image: string;

  @Column({
    nullable: true,
    default: '[0]',
  })
  @ApiPropertyOptional({
    description: 'Forum likes e.g 10.',
  })
  likes: string;

  @Column({
    nullable: true,
    default: 0,
  })
  @ApiPropertyOptional({
    description: 'Forum likes e.g 10.',
  })
  comments: number;

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

export class ForumInfo {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Tunde' })
  title: string;

  @ApiProperty({ example: 'Tunde' })
  description: string;

  @ApiProperty({ example: 'general' })
  category: ForumCategory;

  @ApiProperty({
    example: 'https://medexer.s3.amazonaws.com/avatars/avatar.png',
  })
  image: string;

  @ApiProperty({
    example: 'https://medexer.s3.amazonaws.com/avatars/avatar.png',
  })
  authorPhoto: string;

  @ApiProperty({ example: [10], isArray: true, type: Number })
  likes: number[];

  @ApiProperty({ example: 10 })
  likeCount: number;

  @ApiProperty({ example: 10 })
  comments: number;

  @ApiProperty({ example: '2024-01-01' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01' })
  updatedAt: Date;
}

@Entity()
export class ForumComment {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Forum comment ID (Auto generated).',
  })
  id: number;

  @Column({
    nullable: true,
    default: '',
  })
  @ApiPropertyOptional({
    description: 'Forum comment content e.g Tunde.',
  })
  content: string;

  @ManyToOne(() => Account, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'account' })
  account: Account;

  @ManyToOne(() => Forum, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'forum' })
  forum: Forum;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;
}

export class ForumCommentInfo {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Tunde' })
  content: string;

  @ApiProperty({
    example: 'https://medexer.s3.amazonaws.com/avatars/avatar.png',
  })
  authorPhoto: string;

  @ApiProperty({ example: '2024-01-01' })
  createdAt: Date;
}

export class ForumFeedResponse {
  @ApiProperty({
    isArray: true,
    type: ForumInfo,
  })
  forums: ForumInfo[];

  @ApiProperty({
    example: 1,
  })
  totalPages: number;

  @ApiProperty({
    example: true,
  })
  hasNextPage: boolean;
}

export class ForumCommentsResponse {
  @ApiProperty({
    isArray: true,
    type: ForumCommentInfo,
  })
  comments: ForumCommentInfo[];

  @ApiProperty({
    example: 1,
  })
  totalPages: number;

  @ApiProperty({
    example: true,
  })
  hasNextPage: boolean;
}
