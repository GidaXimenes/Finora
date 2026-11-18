import { PartialType } from '@nestjs/swagger';
import { PaymentMethod, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { DATE_RE, MAX_CENTS } from '../../common/constants';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  /** Valor em centavos, sempre positivo. O tipo define se soma ou subtrai. */
  @IsInt()
  @Min(1, { message: 'O valor deve ser maior que zero' })
  @Max(MAX_CENTS)
  amountCents: number;

  @IsString()
  @MinLength(1, { message: 'Informe uma descrição' })
  @MaxLength(120)
  description: string;

  @Matches(DATE_RE, { message: 'Data inválida (use AAAA-MM-DD)' })
  date: string;

  @IsString()
  @MaxLength(64)
  accountId: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  destinationAccountId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  categoryId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class ListTransactionsDto {
  @IsOptional()
  @Matches(DATE_RE)
  from?: string;

  @IsOptional()
  @Matches(DATE_RE)
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  accountId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  categoryId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
