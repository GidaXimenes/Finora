import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { computeBalance } from '../common/balance';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Saldo calculado (não armazenado): garante consistência ao editar/excluir transações (RN09). */
  async getBalances(userId: string): Promise<Map<string, number>> {
    const [accounts, byAccount, byDestination] = await Promise.all([
      this.prisma.account.findMany({ where: { userId }, select: { id: true, initialBalanceCents: true } }),
      this.prisma.transaction.groupBy({
        by: ['accountId', 'type'],
        where: { userId },
        _sum: { amountCents: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['destinationAccountId'],
        where: { userId, type: TransactionType.TRANSFER, destinationAccountId: { not: null } },
        _sum: { amountCents: true },
      }),
    ]);

    const sum = (accountId: string, type: TransactionType) =>
      byAccount.find((r) => r.accountId === accountId && r.type === type)?._sum.amountCents ?? 0;

    const result = new Map<string, number>();
    for (const a of accounts) {
      result.set(
        a.id,
        computeBalance({
          initialCents: a.initialBalanceCents,
          incomeCents: sum(a.id, TransactionType.INCOME),
          expenseCents: sum(a.id, TransactionType.EXPENSE),
          transferOutCents: sum(a.id, TransactionType.TRANSFER),
          transferInCents: byDestination.find((r) => r.destinationAccountId === a.id)?._sum.amountCents ?? 0,
        }),
      );
    }
    return result;
  }

  async findAll(userId: string, includeInactive = false) {
    const [accounts, balances] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId, ...(includeInactive ? {} : { active: true }) },
        orderBy: [{ active: 'desc' }, { name: 'asc' }],
      }),
      this.getBalances(userId),
    ]);
    return accounts.map((a) => ({ ...a, balanceCents: balances.get(a.id) ?? a.initialBalanceCents }));
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!account) throw new NotFoundException('Conta não encontrada');
    const balances = await this.getBalances(userId);
    return { ...account, balanceCents: balances.get(id) ?? account.initialBalanceCents };
  }

  create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name.trim(),
        type: dto.type,
        initialBalanceCents: dto.initialBalanceCents,
        ...(dto.color ? { color: dto.color } : {}),
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id);
    return this.prisma.account.update({
      where: { id },
      data: { ...dto, ...(dto.name ? { name: dto.name.trim() } : {}) },
    });
  }

  /** Desativa se houver histórico; exclui de verdade se a conta nunca foi usada. */
  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    const used = await this.prisma.transaction.count({
      where: { userId, OR: [{ accountId: id }, { destinationAccountId: id }] },
    });
    if (used > 0) {
      await this.prisma.account.update({ where: { id }, data: { active: false } });
      return { deleted: false, deactivated: true };
    }
    await this.prisma.account.delete({ where: { id } });
    return { deleted: true, deactivated: false };
  }
}
