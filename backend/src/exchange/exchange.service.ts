import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../accounts/entities/account.entity';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';
import { ExchangeDto } from './dto/exchange.dto';
import axios from 'axios';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getExchangeRate(currency: string): Promise<number> {
    try {
      console.log(`Buscando cotação para ${currency}...`);
      
      // Tenta AwesomeAPI primeiro (padrão)
      // https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL
      try {
        const awesomeResponse = await axios.get(`https://economia.awesomeapi.com.br/last/${currency}-BRL`, { timeout: 3000 });
        console.log(`Resposta AwesomeAPI para ${currency}:`, awesomeResponse.data);
        const key = `${currency}BRL`;
        if (awesomeResponse.data[key]) {
          return parseFloat(awesomeResponse.data[key].bid);
        }
      } catch (err) {
        console.warn(`Falha na AwesomeAPI: ${err.message}. Tentando fallback...`);
      }

      // Fallback: ExchangeRate-API (não requer chave no endpoint aberto, mas tem limite)
      // https://api.exchangerate-api.com/v4/latest/BRL
      try {
        // Nota: A API retorna baseada em BRL, então pegamos o inverso (1 / rate)
        // Ex: BRL -> USD = 0.20, então USD -> BRL = 5.0
        const fallbackResponse = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`, { timeout: 3000 });
        console.log(`Resposta Fallback API para ${currency}:`, fallbackResponse.data);
        
        if (fallbackResponse.data && fallbackResponse.data.rates && fallbackResponse.data.rates.BRL) {
          return fallbackResponse.data.rates.BRL;
        }
      } catch (err) {
        console.warn(`Falha na API de Fallback: ${err.message}`);
      }
      
      // Se tudo falhar, lança erro
      throw new Error('Todas as APIs de cotação falharam.');

    } catch (error) {
      console.error(`Erro crítico ao buscar cotação para ${currency}:`, error.message);
      
      // Último recurso: Cotação fixa de segurança para não travar o app em dev (apenas exemplo)
      // throw new BadRequestException('Serviço de cotação indisponível no momento.');
      
      // Em produção, isso não é ideal, mas para o teste da VPS:
      if (currency === 'USD') return 5.80; // Valor fixo temporário
      if (currency === 'EUR') return 6.20; // Valor fixo temporário
      
      throw new BadRequestException('Erro ao obter cotação. Tente novamente mais tarde.');
    }
  }

  async buyCurrency(userId: number, exchangeDto: ExchangeDto) {
    const { amountBrl, targetCurrency } = exchangeDto;

    // 1. Buscar conta do usuário
    const account = await this.accountRepository.findOne({ 
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!account) {
      throw new BadRequestException('Conta não encontrada.');
    }

    // 2. Verificar saldo em BRL
    if (Number(account.balance) < amountBrl) {
      throw new BadRequestException('Saldo insuficiente em Reais.');
    }

    // 3. Obter cotação atual
    const rate = await this.getExchangeRate(targetCurrency);
    
    // 4. Calcular valor convertido
    // Se 1 USD = 5 BRL, então X USD = amountBrl / 5
    const amountForeign = amountBrl / rate;

    // 5. Atualizar saldos
    // Debita BRL
    account.balance = Number(account.balance) - amountBrl;
    
    // Credita Moeda Estrangeira
    if (targetCurrency === 'USD') {
      account.balanceUsd = Number(account.balanceUsd) + amountForeign;
    } else if (targetCurrency === 'EUR') {
      account.balanceEur = Number(account.balanceEur) + amountForeign;
    }

    // 6. Salvar Transação
    const transaction = this.transactionRepository.create({
      amount: amountBrl, // Valor original da transação em BRL
      type: TransactionType.EXCHANGE_BUY,
      sourceAccount: account,
      description: `Compra de ${amountForeign.toFixed(2)} ${targetCurrency} (Cotação: ${rate.toFixed(4)})`,
    });

    await this.transactionRepository.save(transaction);
    await this.accountRepository.save(account);

    return {
      message: 'Compra realizada com sucesso!',
      spentBrl: amountBrl,
      purchased: amountForeign,
      currency: targetCurrency,
      rate: rate,
      newBalanceBrl: account.balance,
      newBalanceForeign: targetCurrency === 'USD' ? account.balanceUsd : account.balanceEur
    };
  }
}
