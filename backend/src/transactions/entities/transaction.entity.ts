import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
  EXCHANGE_BUY = 'EXCHANGE_BUY',
  EXCHANGE_SELL = 'EXCHANGE_SELL'
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType
  })
  type: TransactionType;

  @ManyToOne(() => Account, account => account.transactionsSent, { nullable: true })
  sourceAccount: Account;

  @ManyToOne(() => Account, account => account.transactionsReceived, { nullable: true })
  targetAccount: Account;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
