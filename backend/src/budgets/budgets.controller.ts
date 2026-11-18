import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, ListBudgetsDto, UpdateBudgetDto } from './dto/budget.dto';

@ApiTags('budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() q: ListBudgetsDto) {
    return this.budgets.findAll(user.id, q.month);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBudgetDto) {
    return this.budgets.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgets.update(user.id, id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.budgets.remove(user.id, id);
  }
}
