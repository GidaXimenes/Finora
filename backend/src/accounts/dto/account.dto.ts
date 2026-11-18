import { PartialType } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { HEX_COLOR_RE, MAX_CENTS } from '../../common/constants';

export class CreateAccountDto {
  @IsString()
  @MinLength(1, { message: 'Informe o nome da conta' })
  @MaxLength(60)
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  /** Saldo inicial em centavos (pode ser negativo). */
  @IsInt()
  @Min(-MAX_CENTS)
  @Max(MAX_CENTS)
  initialBalanceCents: number;

  @IsOptional()
  @Matches(HEX_COLOR_RE, { message: 'Cor inválida' })
  color?: string;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
