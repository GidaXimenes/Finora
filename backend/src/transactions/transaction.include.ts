import { Prisma } from '@prisma/client';

export const transactionInclude = {
  account: { select: { id: true, name: true, color: true } },
  destinationAccount: { select: { id: true, name: true, color: true } },
  category: { select: { id: true, name: true, color: true, icon: true } },
} satisfies Prisma.TransactionInclude;
