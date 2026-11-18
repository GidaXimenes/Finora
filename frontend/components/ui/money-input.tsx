'use client';

import { useState, type ChangeEvent } from 'react';
import { cn } from '@/lib/cn';
import { MAX_CENTS, formatNumber } from '@/lib/money';

/**
 * Campo de valor estilo app de banco: você digita apenas números e o campo vira 0,00 / 12,50 / 1.234,56.
 * O valor sai sempre em centavos (inteiro), nunca em float.
 */
export function MoneyInput({
  id,
  valueCents,
  onChange,
  allowNegative = false,
  invalid = false,
}: {
  id?: string;
  valueCents: number;
  onChange: (cents: number) => void;
  allowNegative?: boolean;
  invalid?: boolean;
}) {
  const [negative, setNegative] = useState(valueCents < 0);
  const abs = Math.abs(valueCents);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    const next = Math.min(digits ? parseInt(digits, 10) : 0, MAX_CENTS);
    onChange(negative ? -next : next);
  }

  function toggleSign() {
    const next = !negative;
    setNegative(next);
    onChange(next ? -abs : abs);
  }

  return (
    <div className="flex gap-2">
      {allowNegative && (
        <button
          type="button"
          onClick={toggleSign}
          aria-pressed={negative}
          className={cn(
            'shrink-0 rounded-xl border px-3 text-sm font-medium transition',
            negative ? 'border-expense/40 bg-expense-soft text-expense' : 'border-line bg-white text-ink-soft hover:bg-brand-50',
          )}
        >
          {negative ? 'Negativo' : 'Positivo'}
        </button>
      )}
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
          {negative ? '- R$' : 'R$'}
        </span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={formatNumber(abs)}
          onChange={handleChange}
          aria-invalid={invalid}
          className={cn('input num pl-12 text-right', invalid && 'border-expense')}
        />
      </div>
    </div>
  );
}
