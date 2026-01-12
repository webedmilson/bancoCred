import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeDto } from './dto/exchange.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('exchange')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post('buy')
  @ApiOperation({ summary: 'Comprar moeda estrangeira (USD ou EUR)' })
  buy(@Body() exchangeDto: ExchangeDto, @Request() req) {
    return this.exchangeService.buyCurrency(req.user.userId, exchangeDto);
  }

  @Get('rates')
  @ApiOperation({ summary: 'Obter cotações atuais' })
  async getRates() {
    const usd = await this.exchangeService.getExchangeRate('USD');
    const eur = await this.exchangeService.getExchangeRate('EUR');
    return {
      USD: usd,
      EUR: eur
    };
  }
}
