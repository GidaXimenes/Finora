import { BadRequestException } from '@nestjs/common';
import { MONTH_RE } from './constants';

export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? 'America/Manaus';

/** Data de hoje (AAAA-MM-DD) no fuso do app. */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function currentMonth(): string {
  return todayISO().slice(0, 7);
}

/** Intervalo [start, end) de um mês "AAAA-MM". Datas tratadas como "somente data" em UTC. */
export function monthRange(month?: string): { key: string; start: Date; end: Date } {
  const key = month && MONTH_RE.test(month) ? month : currentMonth();
  const [y, m] = key.split('-').map(Number);
  return { key, start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
}

export function periodRange(period: 'MONTHLY' | 'YEARLY', month?: string): { start: Date; end: Date } {
  const { key, start, end } = monthRange(month);
  if (period === 'MONTHLY') return { start, end };
  const year = Number(key.slice(0, 4));
  return { start: new Date(Date.UTC(year, 0, 1)), end: new Date(Date.UTC(year + 1, 0, 1)) };
}

export function addMonths(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Converte "AAAA-MM-DD" em Date (UTC) validando datas impossíveis como 2025-02-31. */
export function parseDateOnly(iso: string): Date {
  const d = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) {
    throw new BadRequestException('Data inválida');
  }
  return d;
}
