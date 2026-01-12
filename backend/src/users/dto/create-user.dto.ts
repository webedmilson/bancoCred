import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'O nome do usuário' })
  name: string;

  @ApiProperty({ example: 'joao@example.com', description: 'O e-mail do usuário' })
  email: string;

  @ApiProperty({ example: '12345678901', description: 'O CPF do usuário' })
  cpf: string;

  @ApiProperty({ example: '123456', description: 'A senha do usuário' })
  password: string;

  @ApiProperty({ example: '11999998888', required: false })
  phone?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  birthDate?: string;

  @ApiProperty({ example: '01001000', required: false })
  zipCode?: string;

  @ApiProperty({ example: 'Rua Exemplo', required: false })
  street?: string;

  @ApiProperty({ example: '100', required: false })
  number?: string;

  @ApiProperty({ example: 'Apto 101', required: false })
  complement?: string;

  @ApiProperty({ example: 'Centro', required: false })
  neighborhood?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  city?: string;

  @ApiProperty({ example: 'SP', required: false })
  state?: string;
}
