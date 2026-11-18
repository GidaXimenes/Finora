import { BudgetPeriod } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { MAX_CENTS, MONTH_RE } from '../../common/constants';

export class CreateBudgetDto {
  @IsString()
  @MaxLength(64)
  categoryId: string;

  @IsInt()
  @Min(1, { message: 'O limite deve ser maior que zero' })
  @Max(MAX_CENTS)
  limitCents: number;

  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_CENTS)
  limitCents?: number;

  @IsOptional()
  @IsEnum(BudgetPeriod)
  period?: BudgetPeriod;
}

export class ListBudgetsDto {
  @IsOptional()
  @Matches(MONTH_RE, { message: 'Mês inválido (use AAAA-MM)' })
  month?: string;
}
