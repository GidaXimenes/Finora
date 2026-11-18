'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { currentMonth, monthLabel, shiftMonth } from '@/lib/dates';

export function MonthPicker({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  const isCurrent = value === currentMonth();
  return (
    <div data-tour="month" className="inline-flex items-center gap-1">
      <div className="inline-flex items-center rounded-xl border border-line bg-white p-1">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => onChange(shiftMonth(value, -1))}
          className="rounded-lg p-1.5 text-ink-soft transition hover:bg-brand-50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <span className="min-w-[9rem] px-2 text-center text-sm font-medium capitalize">{monthLabel(value)}</span>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => onChange(shiftMonth(value, 1))}
          className="rounded-lg p-1.5 text-ink-soft transition hover:bg-brand-50"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {!isCurrent && (
        <button
          type="button"
          onClick={() => onChange(currentMonth())}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
        >
          Mês atual
        </button>
      )}
    </div>
  );
}
