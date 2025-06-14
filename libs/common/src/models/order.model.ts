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
import { OrderDeliveryMethod } from '../constants/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Order {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Order ID (Auto generated).',
  })
  id: number;

  @Column({
    default: 0,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Order ID (Custom generated).',
  })
  orderId: string;

  @Column({
    default: 0,
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Order quantity e.g 1',
  })
  quantity: number;

  @Column({
    nullable: true,
    enum: OrderDeliveryMethod,
    default: OrderDeliveryMethod.Delivery,
  })
  @ApiPropertyOptional({
    description: 'Order delivery method e.g PickUp.',
  })
  deliveryMethod: OrderDeliveryMethod;

  @Column({
    nullable: true,
    default: false,
  })
  @ApiPropertyOptional({
    description: 'Order completed status e.g false.',
  })
  isCompleted: boolean;

  @Column({
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Order building number e.g 123.',
  })
  buildingNumber: string;

  @Column({
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Order address e.g 123 Main St, Anytown, USA.',
  })
  address: string;

  @Column({
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Order nearest landmark e.g 123 Main St, Anytown, USA.',
  })
  nearestLandmark: string;

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

export class OrderInfo {
  @ApiProperty({
    type: String,
    description: 'Order ID (Auto generated).',
  })
  id: string;
  
  @ApiProperty({
    type: String,
    description: 'Order ID (Custom generated).',
  })
  orderId: string;

  @ApiProperty({
    type: Number,
    description: 'Order quantity e.g 1',
  })
  quantity: number;

  @ApiProperty({
    enum: OrderDeliveryMethod,
    description: 'Order delivery method e.g PickUp.',
  })
  deliveryMethod: OrderDeliveryMethod;

  @ApiProperty({
    type: Boolean,
    description: 'Order completed status e.g false.',
  })
  isCompleted: boolean;

  @ApiProperty({
    type: String,
    description: 'Order building number e.g 123.',
  })
  buildingNumber: string;

  @ApiProperty({
    type: String,
    description: 'Order address e.g 123 Main St, Anytown, USA.',
  })
  address: string;

  @ApiProperty({
    type: String,
    description: 'Order nearest landmark e.g 123 Main St, Anytown, USA.',
  })
  nearestLandmark: string;
}

export class OrderHistoryResponse {
  @ApiProperty({
    isArray: true,
    type: OrderInfo,
    description: 'Order history.',
  })
  orders: OrderInfo[];

  @ApiProperty({
    description: 'Total number of pages.',
  })
  totalPages: number;

  @ApiProperty({
    description: 'Has next page.',
  })
  hasNext: boolean;
}
