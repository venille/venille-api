import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Account } from './account.model';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({
    nullable: true,
    default: '',
  })
  title: string;

  @Column({
    nullable: true,
    default: '',
  })
  message: string;

  @Column({ default: false })
  isRead: boolean;


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

export class NotificationProductInfo {
  @ApiPropertyOptional({ example: '75' })
  id: string;

  @ApiPropertyOptional({ example: 'Name of the product' })
  name: string;

  @ApiPropertyOptional({ example: 'Description of the product' })
  description: string;

  @ApiPropertyOptional({ example: 'Description of the product' })
  price: string;
}

export class NotificationInfo {
  @ApiProperty({ example: '75' })
  id: string;

  @ApiProperty({ example: 'New message from user' })
  title: string;

  @ApiProperty({ example: 'New message from user' })
  message: string;

  @ApiProperty({ example: 'New message from user' })
  isRead: boolean;

  @ApiProperty({ example: 'New message from user' })
  createdAt: Date;

  @ApiPropertyOptional({ type: NotificationProductInfo })
  product: NotificationProductInfo;
}

export class NotificationsResponse {
  @ApiProperty({ isArray: true, type: NotificationInfo })
  notifications: NotificationInfo[];

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;
}
