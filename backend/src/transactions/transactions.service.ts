import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, Prisma, TransactionType } from '@prisma/client';
import { parseDateOnly } from '../common/dates';
import { PrismaService } from '../prisma/prisma.service';
import { buildCsv, formatCentsPtBr, formatDatePtBr } from './csv.util';
import { CreateTransactionDto, ListTransactionsDto, UpdateTransactionDto } from './dto/transaction.dto';
import { transactionInclude } from './transaction.include';

export interface TxInput {
  type: TransactionType;
  amountCents: number;
  description: string;
  date: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
}

const TYPE_LABEL: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  PIX: 'Pix',
  DEBIT: 'Débito',
  CASH: 'Dinheiro',
  TRANSFER: 'Transferência',
  OTHER: 'Outro',
};

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(userId: string, f: ListTransactionsDto): Prisma.TransactionWhereInput {
    const and: Prisma.TransactionWhereInput[] = [{ userId }];
    if (f.from || f.to) {
      and.push({
        date: {
          ...(f.from ? { gte: parseDateOnly(f.from) } : {}),
          ...(f.to ? { lte: parseDateOnly(f.to) } : {}),
        },
      });
    }
    if (f.type) and.push({ type: f.type });
    if (f.accountId) and.push({ OR: [{ accountId: f.accountId }, { destinationAccountId: f.accountId }] });
    if (f.categoryId) and.push({ categoryId: f.categoryId });
    if (f.search) and.push({ description: { contains: f.search, mode: 'insensitive' } });
    return { AND: and };
  }

  async list(userId: string, f: ListTransactionsDto) {
    const page = f.page ?? 1;
    const pageSize = f.pageSize ?? 20;
    const where = this.buildWhere(userId, f);

    const [items, total, sums] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.groupBy({ by: ['type'], where, _sum: { amountCents: true } }),
    ]);

    const sumOf = (t: TransactionType) => sums.find((s) => s.type === t)?._sum.amountCents ?? 0;
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      summary: { incomeCents: sumOf(TransactionType.INCOME), expenseCents: sumOf(TransactionType.EXPENSE) },
    };
  }

  /** Sempre filtra por userId: um usuário nunca enxerga dados de outro (RN01/RN03). */
  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({ where: { id, userId }, include: transactionInclude });
    if (!tx) throw new NotFoundException('Transação não encontrada');
    return tx;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const data = await this.validate(userId, dto, true);
    return this.prisma.transaction.create({ data: { userId, ...data }, include: transactionInclude });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);
    const merged: TxInput = {
      type: dto.type ?? existing.type,
      amountCents: dto.amountCents ?? existing.amountCents,
      description: dto.description ?? existing.description,
      date: dto.date ?? existing.date.toISOString().slice(0, 10),
      accountId: dto.accountId ?? existing.accountId,
      destinationAccountId: dto.destinationAccountId ?? existing.destinationAccountId ?? undefined,
      categoryId: dto.categoryId ?? existing.categoryId ?? undefined,
      paymentMethod: dto.paymentMethod ?? existing.paymentMethod ?? undefined,
    };
    const relationsChanged =
      merged.type !== existing.type ||
      merged.accountId !== existing.accountId ||
      merged.destinationAccountId !== (existing.destinationAccountId ?? undefined) ||
      merged.categoryId !== (existing.categoryId ?? undefined);

    const data = await this.validate(userId, merged, relationsChanged);
    return this.prisma.transaction.update({ where: { id }, data, include: transactionInclude });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
  }

  async exportCsv(userId: string, f: ListTransactionsDto): Promise<string> {
    const items = await this.prisma.transaction.findMany({
      where: this.buildWhere(userId, f),
      include: transactionInclude,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 50_000,
    });
    const header = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Conta destino', 'Forma de pagamento', 'Valor (R$)'];
    const rows = items.map((t) => [
      formatDatePtBr(t.date.toISOString()),
      TYPE_LABEL[t.type],
      t.description,
      t.category?.name ?? '',
      t.account.name,
      t.destinationAccount?.name ?? '',
      t.paymentMethod ? PAYMENT_LABEL[t.paymentMethod] : '',
      formatCentsPtBr(t.amountCents),
    ]);
    return buildCsv([header, ...rows]);
  }

  /**
   * Regras de negócio:
   *  RN03 - conta pertence ao usuário
   *  RN05 - categoria compatível com o tipo
   *  Transferência - exige conta de destino diferente, sem categoria
   */
  private async validate(userId: string, input: TxInput, checkActive: boolean) {
    const date = parseDateOnly(input.date);

    const account = await this.prisma.account.findFirst({ where: { id: input.accountId, userId } });
    if (!account) throw new NotFoundException('Conta não encontrada');
    if (checkActive && !account.active) throw new BadRequestException('A conta selecionada está inativa');

    let destinationAccountId: string | null = null;
    let categoryId: string | null = null;

    if (input.type === TransactionType.TRANSFER) {
      if (!input.destinationAccountId) throw new BadRequestException('Informe a conta de destino');
      if (input.destinationAccountId === input.accountId) {
        throw new BadRequestException('A conta de destino deve ser diferente da conta de origem');
      }
      const destination = await this.prisma.account.findFirst({
        where: { id: input.destinationAccountId, userId },
      });
      if (!destination) throw new NotFoundException('Conta de destino não encontrada');
      if (checkActive && !destination.active) {
        throw new BadRequestException('A conta de destino está inativa');
      }
      destinationAccountId = destination.id;
    } else {
      if (!input.categoryId) throw new BadRequestException('Informe a categoria');
      const category = await this.prisma.category.findFirst({
        where: { id: input.categoryId, OR: [{ userId: null }, { userId }] },
      });
      if (!category) throw new NotFoundException('Categoria não encontrada');
      if (category.type !== input.type) {
        throw new BadRequestException('A categoria não é compatível com o tipo da transação');
      }
      if (checkActive && !category.active) throw new BadRequestException('A categoria selecionada está inativa');
      categoryId = category.id;
    }

    return {
      type: input.type,
      amountCents: input.amountCents,
      description: input.description.trim(),
      date,
      accountId: account.id,
      destinationAccountId,
      categoryId,
      paymentMethod: input.paymentMethod ?? null,
    };
  }
}
