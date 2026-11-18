'use client';

import { ArrowRightLeft, ChevronLeft, ChevronRight, Download, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { TransactionFormModal } from '@/components/features/transaction-form';
import { TransactionRow } from '@/components/features/transaction-row';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input, Select } from '@/components/ui/field';
import { MonthPicker } from '@/components/ui/month-picker';
import { EmptyState, Loading, PageHeader } from '@/components/ui/misc';
import { api, buildQuery } from '@/lib/api';
import { cn } from '@/lib/cn';
import { currentMonth, dayLabel, monthBounds } from '@/lib/dates';
import { TYPE_LABELS } from '@/lib/labels';
import { formatBRL } from '@/lib/money';
import { useAccounts, useAllCategories, useApiMutation, useTransactions } from '@/lib/queries';
import type { Transaction, TransactionType } from '@/lib/types';

function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export default function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [allTime, setAllTime] = useState(false);
  const [type, setType] = useState<TransactionType | ''>('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

  const search = useDebounced(searchText.trim());
  const accounts = useAccounts(true);
  const categories = useAllCategories();

  const filters = useMemo(
    () => ({
      ...(allTime ? {} : monthBounds(month)),
      type,
      accountId,
      categoryId,
      search,
      page,
      pageSize: 20,
    }),
    [allTime, month, type, accountId, categoryId, search, page],
  );

  const { data, isLoading, isFetching } = useTransactions(filters);
  const remove = useApiMutation((id: string) => api(`/transactions/${id}`, { method: 'DELETE' }), 'Transação excluída');

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    (data?.items ?? []).forEach((t) => {
      const day = t.date.slice(0, 10);
      map.set(day, [...(map.get(day) ?? []), t]);
    });
    return Array.from(map.entries());
  }, [data]);

  const exportHref = `/api/transactions/export${buildQuery({ ...filters, page: undefined, pageSize: undefined })}`;
  const hasFilters = !!(type || accountId || categoryId || search);

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <>
      <PageHeader
        title="Transações"
        description="Todas as suas receitas, despesas e transferências em um só lugar."
        actions={
          <>
            <a
              data-tour="tx-export"
              href={exportHref}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-brand-50"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exportar CSV
            </a>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nova transação
            </Button>
          </>
        }
      />

      <div data-tour="tx-filters" className="card mb-4 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {allTime ? (
            <button
              type="button"
              onClick={() => {
                setAllTime(false);
                setPage(1);
              }}
              className="rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50"
            >
              Todo o período (filtrar por mês)
            </button>
          ) : (
            <>
              <MonthPicker value={month} onChange={resetPage(setMonth)} />
              <button
                type="button"
                onClick={() => {
                  setAllTime(true);
                  setPage(1);
                }}
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Ver todo o período
              </button>
            </>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <Input
              aria-label="Buscar por descrição"
              placeholder="Buscar por descrição"
              className="pl-9"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select aria-label="Tipo" value={type} onChange={(e) => resetPage(setType)(e.target.value as TransactionType | '')}>
            <option value="">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select aria-label="Conta" value={accountId} onChange={(e) => resetPage(setAccountId)(e.target.value)}>
            <option value="">Todas as contas</option>
            {(accounts.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select aria-label="Categoria" value={categoryId} onChange={(e) => resetPage(setCategoryId)(e.target.value)}>
            <option value="">Todas as categorias</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {data && (
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 px-1 text-sm text-ink-muted">
          <span>
            {data.total} {data.total === 1 ? 'lançamento' : 'lançamentos'}
          </span>
          <span>
            Receitas <strong className="num font-semibold text-income">{formatBRL(data.summary.incomeCents)}</strong>
          </span>
          <span>
            Despesas <strong className="num font-semibold text-expense">{formatBRL(data.summary.expenseCents)}</strong>
          </span>
        </div>
      )}

      <div data-tour="tx-list" className={cn('card overflow-hidden transition-opacity', isFetching && !isLoading && 'opacity-70')}>
        {isLoading || !data ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={<ArrowRightLeft className="h-6 w-6" aria-hidden />}
            title={hasFilters ? 'Nenhum resultado para esses filtros' : 'Nenhuma transação neste período'}
            description={
              hasFilters
                ? 'Tente limpar a busca ou escolher outro tipo, conta ou categoria.'
                : 'Registre sua primeira movimentação para ver a lista ganhar vida.'
            }
            action={
              !hasFilters && (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  Nova transação
                </Button>
              )
            }
          />
        ) : (
          groups.map(([day, items]) => (
            <div key={day}>
              <p className="border-b border-line bg-canvas/70 px-4 py-2 text-xs font-medium capitalize text-ink-muted">
                {dayLabel(day)}
              </p>
              <div className="divide-y divide-line">
                {items.map((t) => (
                  <TransactionRow
                    key={t.id}
                    t={t}
                    onEdit={(tx) => {
                      setEditing(tx);
                      setFormOpen(true);
                    }}
                    onDelete={setToDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </Button>
          <span className="text-sm text-ink-muted">
            Página {data.page} de {data.totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
            Próxima
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}

      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} transaction={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir transação"
        message={`Excluir "${toDelete?.description ?? ''}"? O saldo da conta será ajustado automaticamente.`}
        confirmLabel="Excluir"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </>
  );
}
