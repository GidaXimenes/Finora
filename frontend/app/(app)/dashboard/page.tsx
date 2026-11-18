'use client';

import { ArrowRightLeft, Check, PieChart as PieIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { EvolutionChart, ExpenseDonut } from '@/components/features/charts';
import { TransactionRow } from '@/components/features/transaction-row';
import { MonthPicker } from '@/components/ui/month-picker';
import { EmptyState, Loading, PageHeader, ProgressBar } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { currentMonth } from '@/lib/dates';
import { formatBRL } from '@/lib/money';
import { useDashboard, useMe } from '@/lib/queries';
import type { Dashboard } from '@/lib/types';

function Checklist({ counts }: { counts: Dashboard['counts'] }) {
  const steps = [
    { done: counts.accounts > 0, title: 'Cadastre sua primeira conta', text: 'Banco, carteira ou poupança.', href: '/accounts', cta: 'Cadastrar conta' },
    { done: counts.transactions > 0, title: 'Registre uma transação', text: 'Um gasto ou uma entrada de hoje.', href: '/transactions', cta: 'Ver transações' },
    { done: counts.budgets > 0, title: 'Defina um orçamento', text: 'Um limite para uma categoria.', href: '/budgets', cta: 'Criar orçamento' },
  ];
  if (steps.every((s) => s.done)) return null;
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section className="card mb-6 p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">Primeiros passos</h2>
        <span className="text-sm text-ink-muted">{doneCount} de {steps.length} concluídos</span>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.title} className={cn('flex items-start gap-3 rounded-xl border p-4', s.done ? 'border-brand-200 bg-brand-50/60' : 'border-line')}>
            <span
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                s.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-line',
              )}
            >
              {s.done && <Check className="h-3 w-3" aria-hidden />}
            </span>
            <div className="min-w-0">
              <p className={cn('text-sm font-medium', s.done && 'text-ink-muted line-through')}>{s.title}</p>
              <p className="text-xs text-ink-muted">{s.text}</p>
              {!s.done && (
                <Link href={s.href} className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">
                  {s.cta}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'income' | 'expense' }) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-4 md:py-5">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className={cn('num text-base font-semibold', tone === 'income' && 'text-income', tone === 'expense' && 'text-expense')}>
        {value}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useDashboard(month);
  const { data: me } = useMe();

  return (
    <>
      <PageHeader
        title={`Olá, ${me?.name.split(' ')[0] ?? ''}`}
        description="Um resumo calmo de como estão suas finanças."
        actions={<MonthPicker value={month} onChange={setMonth} />}
      />

      {isLoading || !data ? (
        <Loading />
      ) : (
        <>
          <Checklist counts={data.counts} />

          <section data-tour="summary" className="card mb-6 overflow-hidden">
            <div className="grid md:grid-cols-[1.3fr_1fr]">
              <div className="p-6 md:p-8">
                <p className="text-sm text-ink-muted">Saldo total</p>
                <p className="num mt-1 text-4xl font-semibold tracking-tight md:text-5xl">{formatBRL(data.totalBalanceCents)}</p>
                <p className="mt-3 text-sm text-ink-muted">
                  {data.counts.accounts === 0
                    ? 'Cadastre uma conta para começar a acompanhar seu saldo.'
                    : `Soma de ${data.counts.accounts} ${data.counts.accounts === 1 ? 'conta ativa' : 'contas ativas'}.`}
                </p>
              </div>
              <div className="divide-y divide-line border-t border-line bg-canvas/60 md:border-l md:border-t-0">
                <Stat label="Receitas do mês" value={formatBRL(data.incomeCents)} tone="income" />
                <Stat label="Despesas do mês" value={formatBRL(data.expenseCents)} tone="expense" />
                <Stat label="Resultado do mês" value={formatBRL(data.resultCents)} tone={data.resultCents >= 0 ? 'income' : 'expense'} />
              </div>
            </div>
          </section>

          <div className="mb-6 grid gap-6 lg:grid-cols-5">
            <section className="card p-5 lg:col-span-3">
              <h2 className="mb-4 font-semibold">Receitas e despesas nos últimos 6 meses</h2>
              <EvolutionChart data={data.evolution} />
            </section>

            <section data-tour="chart" className="card p-5 lg:col-span-2">
              <h2 className="mb-4 font-semibold">Despesas por categoria</h2>
              {data.expensesByCategory.length === 0 ? (
                <EmptyState
                  icon={<PieIcon className="h-6 w-6" aria-hidden />}
                  title="Nenhuma despesa neste mês"
                  description="Quando você registrar despesas, elas aparecem aqui, organizadas por categoria."
                />
              ) : (
                <div className="flex flex-col items-center gap-5">
                  <ExpenseDonut data={data.expensesByCategory} totalCents={data.expenseCents} />
                  <ul className="w-full space-y-2.5">
                    {data.expensesByCategory.slice(0, 5).map((c) => (
                      <li key={c.categoryId ?? c.name} className="flex items-center gap-2.5 text-sm">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-xs text-ink-muted">{c.percent.toLocaleString('pt-BR')}%</span>
                        <span className="num w-24 text-right font-medium">{formatBRL(c.totalCents)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <section data-tour="budgets" className="card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Orçamentos</h2>
                <Link href="/budgets" className="text-sm font-medium text-brand-700 hover:underline">
                  Ver todos
                </Link>
              </div>
              {data.budgets.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-muted">
                  Defina limites por categoria para acompanhar seus gastos.
                </p>
              ) : (
                <ul className="space-y-4">
                  {data.budgets.map((b) => (
                    <li key={b.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{b.category.name}</span>
                        <span className="num shrink-0 text-xs text-ink-muted">
                          {formatBRL(b.spentCents)} de {formatBRL(b.limitCents)}
                        </span>
                      </div>
                      <ProgressBar percent={b.percent} status={b.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card lg:col-span-3">
              <div className="flex items-center justify-between px-5 pb-1 pt-5">
                <h2 className="font-semibold">Últimas transações</h2>
                <Link href="/transactions" className="text-sm font-medium text-brand-700 hover:underline">
                  Ver todas
                </Link>
              </div>
              {data.recentTransactions.length === 0 ? (
                <EmptyState
                  icon={<ArrowRightLeft className="h-6 w-6" aria-hidden />}
                  title="Nada por aqui ainda"
                  description="Use o botão Nova transação para registrar seu primeiro gasto ou receita."
                />
              ) : (
                <div className="divide-y divide-line">
                  {data.recentTransactions.map((t) => (
                    <TransactionRow key={t.id} t={t} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
