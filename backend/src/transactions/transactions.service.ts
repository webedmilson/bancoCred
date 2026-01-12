import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Account } from '../accounts/entities/account.entity';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private accountsService: AccountsService,
    private dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    const { type, amount, sourceAccountId, targetAccountId } = createTransactionDto;

    if (amount <= 0) {
      throw new BadRequestException('O valor deve ser maior que zero');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let transactionResult: Transaction;

      // Handle Deposit
      if (type === TransactionType.DEPOSIT) {
        if (!targetAccountId) {
          throw new BadRequestException('ID da conta de destino é obrigatório para depósito');
        }
        
        const account = await queryRunner.manager.findOne(Account, { where: { id: targetAccountId } });
        if (!account) {
          throw new NotFoundException(`Conta de destino com ID ${targetAccountId} não encontrada`);
        }

        // Update balance
        account.balance = Number(account.balance) + Number(amount);
        await queryRunner.manager.save(account);

        const transaction = this.transactionsRepository.create({
          ...createTransactionDto,
          targetAccount: account
        });
        
        transactionResult = await queryRunner.manager.save(transaction);
      }

      // Handle Withdraw
      else if (type === TransactionType.WITHDRAW) {
        if (!sourceAccountId) {
          throw new BadRequestException('ID da conta de origem é obrigatório para saque');
        }
        
        const account = await queryRunner.manager.findOne(Account, { 
          where: { id: sourceAccountId },
          relations: ['user'] 
        });
        if (!account) {
          throw new NotFoundException(`Conta de origem com ID ${sourceAccountId} não encontrada`);
        }

        if (account.user.id !== userId) {
          throw new BadRequestException('Você não é o dono desta conta');
        }

        if (Number(account.balance) < Number(amount)) {
          throw new BadRequestException('Saldo insuficiente');
        }

        account.balance = Number(account.balance) - Number(amount);
        await queryRunner.manager.save(account);

        const transaction = this.transactionsRepository.create({
          ...createTransactionDto,
          sourceAccount: account
        });
        
        transactionResult = await queryRunner.manager.save(transaction);
      }

      // Handle Transfer
      else if (type === TransactionType.TRANSFER) {
        if (!sourceAccountId || !targetAccountId) {
          throw new BadRequestException('IDs das contas de origem e destino são obrigatórios para transferência');
        }

        if (Number(sourceAccountId) === Number(targetAccountId)) {
          throw new BadRequestException('Não é possível realizar transferência para a mesma conta');
        }
        
        const sourceAccount = await queryRunner.manager.findOne(Account, {  
          where: { id: sourceAccountId },
          relations: ['user']
        });
        const targetAccount = await queryRunner.manager.findOne(Account, { where: { id: targetAccountId } });

        if (!sourceAccount) {
          throw new NotFoundException(`Source account with ID ${sourceAccountId} not found`);
        }
        if (!targetAccount) {
          throw new NotFoundException(`Target account with ID ${targetAccountId} not found`);
        }

        if (sourceAccount.user.id !== userId) {
          throw new BadRequestException('You are not the owner of the source account');
        }

        if (Number(sourceAccount.balance) < Number(amount)) {
          throw new BadRequestException('Insufficient funds');
        }

        sourceAccount.balance = Number(sourceAccount.balance) - Number(amount);
        targetAccount.balance = Number(targetAccount.balance) + Number(amount);

        await queryRunner.manager.save(sourceAccount);
        await queryRunner.manager.save(targetAccount);

        const transaction = this.transactionsRepository.create({
          ...createTransactionDto,
          sourceAccount,
          targetAccount
        });
        
        transactionResult = await queryRunner.manager.save(transaction);
      } else {
        throw new BadRequestException('Invalid transaction type');
      }

      await queryRunner.commitTransaction();
      return transactionResult;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(userId?: number) {
    if (userId) {
      return this.transactionsRepository.find({
        where: [
          { sourceAccount: { user: { id: userId } } },
          { targetAccount: { user: { id: userId } } }
        ],
        relations: ['sourceAccount', 'targetAccount']
      });
    }
    return this.transactionsRepository.find({ relations: ['sourceAccount', 'targetAccount'] });
  }

  findOne(id: number) {
    return this.transactionsRepository.findOne({ where: { id }, relations: ['sourceAccount', 'targetAccount'] });
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsRepository.update(id, updateTransactionDto);
  }

  remove(id: number) {
    return this.transactionsRepository.delete(id);
  }
}
