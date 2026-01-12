import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: 100.00, description: 'Valor para transferir, depositar ou sacar' })
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.DEPOSIT })
  type: TransactionType;

  @ApiProperty({ example: 1, required: false, description: 'ID da conta de origem (obrigatório para SAQUE e TRANSFERÊNCIA)' })
  sourceAccountId?: number;

  @ApiProperty({ example: 2, required: false, description: 'ID da conta de destino (obrigatório para DEPÓSITO e TRANSFERÊNCIA)' })
  targetAccountId?: number;

  @ApiProperty({ example: 'Descrição do pagamento', required: false })
  description?: string;
}
