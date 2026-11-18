import { describe, expect, it } from 'vitest';
import { formatCompact, formatNumber } from './money';
import { monthBounds, shiftMonth } from './dates';

describe('money', () => {
  it('formata centavos em pt-BR', () => {
    expect(formatNumber(123456)).toBe('1.234,56');
    expect(formatNumber(5)).toBe('0,05');
  });

  it('abrevia valores de eixo', () => {
    expect(formatCompact(250_000)).toBe('2,5 mil');
    expect(formatCompact(30_000)).toBe('300');
  });
});

describe('dates', () => {
  it('shiftMonth atravessa anos', () => {
    expect(shiftMonth('2025-01', -1)).toBe('2024-12');
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
  });

  it('monthBounds respeita ano bissexto', () => {
    expect(monthBounds('2024-02')).toEqual({ from: '2024-02-01', to: '2024-02-29' });
  });
});
