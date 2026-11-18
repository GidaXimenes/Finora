import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { CategoryIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import type { BudgetStatus } from '@/lib/types';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Loading({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-muted" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function ProgressBar({ percent, status }: { percent: number; status: BudgetStatus }) {
  const color = status === 'exceeded' ? 'bg-expense' : status === 'warning' ? 'bg-warn' : 'bg-brand-500';
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-brand-50"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}

export function CategoryBadge({ color, icon, className }: { color: string; icon: string; className?: string }) {
  return (
    <span
      className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', className)}
      style={{ backgroundColor: `${color}26`, color }}
    >
      <CategoryIcon name={icon} className="h-[18px] w-[18px]" />
    </span>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tone === 'neutral' && 'bg-canvas text-ink-muted ring-1 ring-line',
        tone === 'brand' && 'bg-brand-50 text-brand-700',
        tone === 'warn' && 'bg-warn-soft text-warn',
      )}
    >
      {children}
    </span>
  );
}

export function ColorPicker({
  value,
  onChange,
  choices,
}: {
  value: string;
  onChange: (c: string) => void;
  choices: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor">
      {choices.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn(
            'h-7 w-7 rounded-full ring-offset-2 transition',
            value === c ? 'ring-2 ring-ink-soft' : 'hover:scale-110',
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}
