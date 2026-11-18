import { budgetProgress, computeBalance } from './balance';

describe('computeBalance', () => {
  it('soma receitas e subtrai despesas (RN07/RN08)', () => {
    expect(
      computeBalance({ initialCents: 10_000, incomeCents: 5_000, expenseCents: 2_500, transferOutCents: 0, transferInCents: 0 }),
    ).toBe(12_500);
  });

  it('considera transferências enviadas e recebidas', () => {
    expect(
      computeBalance({ initialCents: 0, incomeCents: 0, expenseCents: 0, transferOutCents: 3_000, transferInCents: 0 }),
    ).toBe(-3_000);
    expect(
      computeBalance({ initialCents: 0, incomeCents: 0, expenseCents: 0, transferOutCents: 0, transferInCents: 3_000 }),
    ).toBe(3_000);
  });

  it('aceita saldo inicial negativo', () => {
    expect(
      computeBalance({ initialCents: -5_000, incomeCents: 1_000, expenseCents: 0, transferOutCents: 0, transferInCents: 0 }),
    ).toBe(-4_000);
  });
});

describe('budgetProgress (RN11)', () => {
  it('calcula percentual e restante', () => {
    expect(budgetProgress(30_000, 60_000)).toEqual({ percent: 50, remainingCents: 30_000, status: 'ok' });
  });

  it('marca atenção a partir de 80%', () => {
    expect(budgetProgress(48_000, 60_000).status).toBe('warning');
  });

  it('marca estouro a partir de 100%', () => {
    const r = budgetProgress(66_000, 60_000);
    expect(r.status).toBe('exceeded');
    expect(r.percent).toBe(110);
    expect(r.remainingCents).toBe(-6_000);
  });

  it('não divide por zero', () => {
    expect(budgetProgress(100, 0).percent).toBe(0);
  });
});
