import { IsNumber, IsString, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeDto {
  @ApiProperty({ description: 'Valor em Reais (BRL) para converter', example: 100 })
  @IsNumber()
  @Min(1)
  amountBrl: number;

  @ApiProperty({ description: 'Moeda de destino', example: 'USD', enum: ['USD', 'EUR'] })
  @IsString()
  @IsIn(['USD', 'EUR'])
  targetCurrency: 'USD' | 'EUR';
}
