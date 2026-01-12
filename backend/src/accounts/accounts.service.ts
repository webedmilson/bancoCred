import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, AccountType } from './entities/account.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    const account = this.accountsRepository.create(createAccountDto);
    return await this.accountsRepository.save(account);
  }

  async createForUser(user: User) {
    // Generate a simple account number (in production, use a more robust generator)
    const accountNumber = Math.floor(100000 + Math.random() * 900000).toString();
    
    const account = this.accountsRepository.create({
      agency: '0001',
      number: accountNumber,
      balance: 0,
      type: AccountType.CURRENT,
      user: user
    });

    return await this.accountsRepository.save(account);
  }

  findAll(userId?: number) {
    if (userId) {
      return this.accountsRepository.find({ 
        where: { user: { id: userId } },
        relations: ['user'] 
      });
    }
    return this.accountsRepository.find({ relations: ['user'] });
  }

  findOne(id: number) {
    return this.accountsRepository.findOne({ where: { id }, relations: ['user', 'transactionsSent', 'transactionsReceived'] });
  }

  findByNumber(number: string) {
    return this.accountsRepository.findOne({ where: { number } });
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return this.accountsRepository.update(id, updateAccountDto);
  }

  remove(id: number) {
    return this.accountsRepository.delete(id);
  }
}
