import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum AccountType {
  CURRENT = 'CURRENT',
  SAVINGS = 'SAVINGS'
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  agency: string;

  @Column({ unique: true })
  number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceEur: number;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.CURRENT
  })
  type: AccountType;

  @ManyToOne(() => User, user => user.accounts)
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.sourceAccount)
  transactionsSent: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.targetAccount)
  transactionsReceived: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
