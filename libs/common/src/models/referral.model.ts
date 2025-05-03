import {
  Entity,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.model';

@Entity()
export class Referral {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @ManyToOne(() => Account, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @ManyToOne(() => Account, {
    onDelete: 'CASCADE',
  })
  referredUser: Account;

  @CreateDateColumn()
  createdAt: Date;
}
