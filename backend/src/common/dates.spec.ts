import { BadRequestException } from '@nestjs/common';
import { addMonths, monthRange, parseDateOnly, periodRange } from './dates';

describe('dates', () => {
  it('monthRange devolve [início, início do mês seguinte)', () => {
    const r = monthRange('2025-02');
    expect(r.start.toISOString()).toBe('2025-02-01T00:00:00.000Z');
    expect(r.end.toISOString()).toBe('2025-03-01T00:00:00.000Z');
  });

  it('monthRange vira o ano em dezembro', () => {
    expect(monthRange('2025-12').end.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('periodRange anual cobre o ano inteiro', () => {
    const r = periodRange('YEARLY', '2025-06');
    expect(r.start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('addMonths cruza anos nos dois sentidos', () => {
    expect(addMonths('2025-01', -1)).toBe('2024-12');
    expect(addMonths('2025-11', 3)).toBe('2026-02');
  });

  it('parseDateOnly rejeita datas impossíveis', () => {
    expect(parseDateOnly('2024-02-29').toISOString()).toBe('2024-02-29T00:00:00.000Z');
    expect(() => parseDateOnly('2025-02-31')).toThrow(BadRequestException);
  });
});
