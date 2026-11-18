import { Controller, Get, Query } from '@nestjs/common';
import { IsOptional, Matches } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MONTH_RE } from '../common/constants';
import { AuthUser } from '../common/types';
import { DashboardService } from './dashboard.service';

class DashboardQuery {
  @IsOptional()
  @Matches(MONTH_RE, { message: 'Mês inválido (use AAAA-MM)' })
  month?: string;
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  get(@CurrentUser() user: AuthUser, @Query() q: DashboardQuery) {
    return this.dashboard.get(user.id, q.month);
  }
}
