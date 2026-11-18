import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types';
import { CreateTransactionDto, ListTransactionsDto, UpdateTransactionDto } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() q: ListTransactionsDto) {
    return this.transactions.list(user.id, q);
  }

  // Deve vir antes de ":id" para não ser capturada como id.
  @Get('export')
  async export(@CurrentUser() user: AuthUser, @Query() q: ListTransactionsDto, @Res() res: Response) {
    const csv = await this.transactions.exportCsv(user.id, q);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="finora-transacoes.csv"');
    res.send(csv);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTransactionDto) {
    return this.transactions.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.transactions.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactions.update(user.id, id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.transactions.remove(user.id, id);
  }
}
