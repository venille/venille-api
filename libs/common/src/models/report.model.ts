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
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Report {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @ApiPropertyOptional({
    description: 'Order ID (Auto generated).',
  })
  id: number;

  @Column({
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Report prompt e.g "What are the various types of weather forecasts"',
  })
  prompt: string;

  @Column({
    nullable: true,
  })
  @ApiPropertyOptional({
    description: 'Report title e.g "OFFENSIVE"',
  })
  responseType: string;

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
