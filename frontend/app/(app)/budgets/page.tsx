'use client';

import { Pencil, PieChart, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BudgetFormModal } from '@/components/features/budget-form';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MonthPicker } from '@/components/ui/month-picker';
import { CategoryBadge, EmptyState, Loading, PageHeader, Pill, ProgressBar } from '@/components/ui/misc';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { currentMonth } from '@/lib/dates';
import { PERIOD_LABELS } from '@/lib/labels';
import { formatBRL } from '@/lib/money';
import { useApiMutation, useBudgets } from '@/lib/queries';
import type { Budget } from '@/lib/types';

const STATUS_TEXT = {
  ok: 'Dentro do limite',
  warning: 'Atenção: perto do limite',
  exceeded: 'Limite ultrapassado',
} as const;

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useBudgets(month);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Budget | null>(null);
  const remove = useApiMutation((id: string) => api(`/budgets/${id}`, { method: 'DELETE' }), 'Orçamento excluído');

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Orçamentos"
        description="Defina quanto quer gastar por categoria e acompanhe o quanto já foi usado."
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} />
            <Button data-tour="budgets-new" onClick={openNew}>
              <Plus className="h-4 w-4" aria-hidden />
              Novo orçamento
            </Button>
          </>
        }
      />

      {isLoading || !data ? (
        <Loading />
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<PieChart className="h-6 w-6" aria-hidden />}
            title="Nenhum orçamento ainda"
            description="Que tal começar por Alimentação ou Lazer? Escolha uma categoria e um limite mensal."
            action={<Button onClick={openNew}>Novo orçamento</Button>}
          />
        </div>
      ) : (
        <div data-tour="budgets-list" className="grid gap-4 md:grid-cols-2">
          {data.map((b) => (
            <article key={b.id} className="card p-5">
              <div className="flex items-center gap-3">
                <CategoryBadge color={b.category.color} icon={b.category.icon} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{b.category.name}</h3>
                  <Pill>{PERIOD_LABELS[b.period]}</Pill>
                </div>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    aria-label={`Editar orçamento de ${b.category.name}`}
                    onClick={() => {
                      setEditing(b);
                      setFormOpen(true);
                    }}
                    className="rounded-lg p-2 text-ink-muted transition hover:bg-brand-50 hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir orçamento de ${b.category.name}`}
                    onClick={() => setToDelete(b)}
                    className="rounded-lg p-2 text-ink-muted transition hover:bg-expense-soft hover:text-expense"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-baseline justify-between gap-2">
                <p className="num text-2xl font-semibold tracking-tight">{formatBRL(b.spentCents)}</p>
                <p className="num text-sm text-ink-muted">de {formatBRL(b.limitCents)}</p>
              </div>
              <div className="mt-3">
                <ProgressBar percent={b.percent} status={b.status} />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-sm">
                <span
                  className={cn(
                    'font-medium',
                    b.status === 'ok' && 'text-brand-700',
                    b.status === 'warning' && 'text-warn',
                    b.status === 'exceeded' && 'text-expense',
                  )}
                >
                  {STATUS_TEXT[b.status]}
                </span>
                <span className="num text-ink-muted">{b.percent.toLocaleString('pt-BR')}% usado</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {b.remainingCents >= 0
                  ? `Restam ${formatBRL(b.remainingCents)}`
                  : `${formatBRL(Math.abs(b.remainingCents))} acima do limite`}
              </p>
            </article>
          ))}
        </div>
      )}

      <BudgetFormModal open={formOpen} onClose={() => setFormOpen(false)} budget={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir orçamento"
        message={`Excluir o orçamento de "${toDelete?.category.name ?? ''}"? Suas transações não serão afetadas.`}
        confirmLabel="Excluir"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </>
  );
}
