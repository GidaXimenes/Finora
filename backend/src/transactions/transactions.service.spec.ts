import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

describe('TransactionsService (regras de negócio)', () => {
  const userId = 'user-1';
  let prisma: any;
  let service: TransactionsService;

  const base = {
    type: TransactionType.EXPENSE,
    amountCents: 1_000,
    description: ' Mercado ',
    date: '2025-03-10',
    accountId: 'acc-1',
    categoryId: 'cat-1',
  } as CreateTransactionDto;

  beforeEach(() => {
    prisma = {
      account: { findFirst: jest.fn() },
      category: { findFirst: jest.fn() },
      transaction: { create: jest.fn(), findFirst: jest.fn() },
    };
    service = new TransactionsService(prisma as unknown as PrismaService);
  });

  it('RN03: rejeita conta que não pertence ao usuário', async () => {
    prisma.account.findFirst.mockResolvedValue(null);
    await expect(service.create(userId, base)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.account.findFirst).toHaveBeenCalledWith({ where: { id: 'acc-1', userId } });
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it('RN05: rejeita categoria incompatível com o tipo', async () => {
    prisma.account.findFirst.mockResolvedValue({ id: 'acc-1', active: true });
    prisma.category.findFirst.mockResolvedValue({ id: 'cat-1', type: 'INCOME', active: true });
    await expect(service.create(userId, base)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it('exige categoria para receitas e despesas', async () => {
    prisma.account.findFirst.mockResolvedValue({ id: 'acc-1', active: true });
    await expect(service.create(userId, { ...base, categoryId: undefined })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejeita conta inativa', async () => {
    prisma.account.findFirst.mockResolvedValue({ id: 'acc-1', active: false });
    await expect(service.create(userId, base)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cria despesa válida normalizando a descrição', async () => {
    prisma.account.findFirst.mockResolvedValue({ id: 'acc-1', active: true });
    prisma.category.findFirst.mockResolvedValue({ id: 'cat-1', type: 'EXPENSE', active: true });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });

    await service.create(userId, base);

    const arg = prisma.transaction.create.mock.calls[0][0];
    expect(arg.data).toMatchObject({
      userId,
      type: 'EXPENSE',
      amountCents: 1_000,
      description: 'Mercado',
      accountId: 'acc-1',
      categoryId: 'cat-1',
      destinationAccountId: null,
    });
    expect(arg.data.date.toISOString()).toBe('2025-03-10T00:00:00.000Z');
  });

  it('transferência: exige destino diferente da origem', async () => {
    prisma.account.findFirst.mockResolvedValue({ id: 'acc-1', active: true });
    const transfer = { ...base, type: TransactionType.TRANSFER, categoryId: undefined };

    await expect(service.create(userId, transfer)).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create(userId, { ...transfer, destinationAccountId: 'acc-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('transferência válida não grava categoria', async () => {
    prisma.account.findFirst
      .mockResolvedValueOnce({ id: 'acc-1', active: true })
      .mockResolvedValueOnce({ id: 'acc-2', active: true });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-2' });

    await service.create(userId, {
      ...base,
      type: TransactionType.TRANSFER,
      categoryId: 'cat-1',
      destinationAccountId: 'acc-2',
    });

    expect(prisma.transaction.create.mock.calls[0][0].data).toMatchObject({
      categoryId: null,
      destinationAccountId: 'acc-2',
    });
  });

  it('RN01: busca por id sempre filtra pelo usuário', async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);
    await expect(service.findOne(userId, 'tx-x')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.transaction.findFirst.mock.calls[0][0].where).toEqual({ id: 'tx-x', userId });
  });
});
