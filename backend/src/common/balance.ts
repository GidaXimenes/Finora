export interface BalanceParts {
  initialCents: number;
  incomeCents: number;
  expenseCents: number;
  transferOutCents: number;
  transferInCents: number;
}

/** Saldo = inicial + receitas - despesas - transferências enviadas + transferências recebidas. */
export function computeBalance(p: BalanceParts): number {
  return p.initialCents + p.incomeCents - p.expenseCents - p.transferOutCents + p.transferInCents;
}

export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export function budgetProgress(spentCents: number, limitCents: number) {
  const percent = limitCents > 0 ? Math.round((spentCents / limitCents) * 1000) / 10 : 0;
  const status: BudgetStatus = percent >= 100 ? 'exceeded' : percent >= 80 ? 'warning' : 'ok';
  return { percent, remainingCents: limitCents - spentCents, status };
}
