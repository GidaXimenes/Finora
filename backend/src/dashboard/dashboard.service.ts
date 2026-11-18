import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { AccountsService } from '../accounts/accounts.service';
import { BudgetsService } from '../budgets/budgets.service';
import { addMonths, monthRange } from '../common/dates';
import { PrismaService } from '../prisma/prisma.service';
import { transactionInclude } from '../transactions/transaction.include';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: AccountsService,
    private readonly budgets: BudgetsService,
  ) {}

  private async totalsFor(userId: string, start: Date, end: Date) {
    const sums = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, type: { in: [TransactionType.INCOME, TransactionType.EXPENSE] }, date: { gte: start, lt: end } },
      _sum: { amountCents: true },
    });
    const of = (t: TransactionType) => sums.find((s) => s.type === t)?._sum.amountCents ?? 0;
    return { incomeCents: of(TransactionType.INCOME), expenseCents: of(TransactionType.EXPENSE) };
  }

  async get(userId: string, month?: string) {
    const { key, start, end } = monthRange(month);
    const months = Array.from({ length: 6 }, (_, i) => addMonths(key, i - 5));

    const [accounts, totals, byCategory, evolution, recent, budgets, txCount] = await Promise.all([
      this.accounts.findAll(userId),
      this.totalsFor(userId, start, end),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
        _sum: { amountCents: true },
      }),
      Promise.all(
        months.map(async (m) => {
          const r = monthRange(m);
          return { month: m, ...(await this.totalsFor(userId, r.start, r.end)) };
        }),
      ),
      this.prisma.transaction.findMany({
        where: { userId },
        include: transactionInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),
      this.budgets.findAll(userId, key),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    const categoryIds = byCategory.map((r) => r.categoryId).filter((id): id is string => !!id);
    const categories = await this.prisma.category.findMany({ where: { id: { in: categoryIds } } });
    const totalExpense = totals.expenseCents;

    const expensesByCategory = byCategory
      .map((r) => {
        const c = categories.find((x) => x.id === r.categoryId);
        const totalCents = r._sum.amountCents ?? 0;
        return {
          categoryId: r.categoryId,
          name: c?.name ?? 'Sem categoria',
          color: c?.color ?? '#9AA8A4',
          icon: c?.icon ?? 'tag',
          totalCents,
          percent: totalExpense > 0 ? Math.round((totalCents / totalExpense) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => b.totalCents - a.totalCents);

    return {
      month: key,
      totalBalanceCents: accounts.reduce((acc, a) => acc + a.balanceCents, 0),
      incomeCents: totals.incomeCents,
      expenseCents: totals.expenseCents,
      resultCents: totals.incomeCents - totals.expenseCents,
      expensesByCategory,
      evolution,
      recentTransactions: recent,
      budgets: [...budgets].sort((a, b) => b.percent - a.percent).slice(0, 4),
      counts: { accounts: accounts.length, transactions: txCount, budgets: budgets.length },
    };
  }
}
