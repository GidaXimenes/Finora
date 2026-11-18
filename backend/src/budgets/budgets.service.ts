import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryType, Prisma, TransactionType } from '@prisma/client';
import { budgetProgress } from '../common/balance';
import { periodRange } from '../common/dates';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';

const categorySelect = { select: { id: true, name: true, color: true, icon: true } } as const;

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  /** RN11: valor usado = despesas da categoria dentro do período do orçamento. */
  async findAll(userId: string, month?: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { category: categorySelect },
      orderBy: { createdAt: 'asc' },
    });

    return Promise.all(
      budgets.map(async (b) => {
        const { start, end } = periodRange(b.period, month);
        const agg = await this.prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.EXPENSE,
            categoryId: b.categoryId,
            date: { gte: start, lt: end },
          },
          _sum: { amountCents: true },
        });
        const spentCents = agg._sum.amountCents ?? 0;
        return { ...b, spentCents, ...budgetProgress(spentCents, b.limitCents) };
      }),
    );
  }

  private async assertExpenseCategory(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, OR: [{ userId: null }, { userId }] },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (category.type !== CategoryType.EXPENSE) {
      throw new BadRequestException('Orçamentos só podem ser criados para categorias de despesa');
    }
    if (!category.active) throw new BadRequestException('A categoria selecionada está inativa');
  }

  private mapError(e: unknown): unknown {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return new ConflictException('Já existe um orçamento para esta categoria e período');
    }
    return e;
  }

  async create(userId: string, dto: CreateBudgetDto) {
    await this.assertExpenseCategory(userId, dto.categoryId);
    try {
      return await this.prisma.budget.create({
        data: { userId, categoryId: dto.categoryId, limitCents: dto.limitCents, period: dto.period },
        include: { category: categorySelect },
      });
    } catch (e) {
      throw this.mapError(e);
    }
  }

  private async findOwned(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Orçamento não encontrado');
    return budget;
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    await this.findOwned(userId, id);
    try {
      return await this.prisma.budget.update({
        where: { id },
        data: dto,
        include: { category: categorySelect },
      });
    } catch (e) {
      throw this.mapError(e);
    }
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.budget.delete({ where: { id } });
  }
}
