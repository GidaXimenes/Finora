'use client';

import { Archive, Landmark, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AccountFormModal } from '@/components/features/account-form';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState, Loading, PageHeader, Pill } from '@/components/ui/misc';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ACCOUNT_TYPE_LABELS } from '@/lib/labels';
import { formatBRL } from '@/lib/money';
import { useAccounts, useApiMutation } from '@/lib/queries';
import { useToast } from '@/components/ui/toast';
import type { Account, RemoveResult } from '@/lib/types';

export default function AccountsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const { data, isLoading } = useAccounts(showInactive);
  const toast = useToast();
  const [editing, setEditing] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Account | null>(null);

  const remove = useApiMutation((id: string) => api<RemoveResult>(`/accounts/${id}`, { method: 'DELETE' }));
  const toggle = useApiMutation((a: Account) => api(`/accounts/${a.id}`, { method: 'PATCH', body: { active: !a.active } }));

  const active = (data ?? []).filter((a) => a.active);
  const total = active.reduce((sum, a) => sum + a.balanceCents, 0);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Contas"
        description="Os lugares onde seu dinheiro fica guardado. O saldo é calculado a partir do saldo inicial e das transações."
        actions={
          <Button data-tour="accounts-new" onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden />
            Nova conta
          </Button>
        }
      />

      {isLoading || !data ? (
        <Loading />
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Landmark className="h-6 w-6" aria-hidden />}
            title="Cadastre sua primeira conta"
            description="Comece com a conta que você mais usa. Informe quanto há nela hoje como saldo inicial."
            action={<Button onClick={openNew}>Nova conta</Button>}
          />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-sm text-ink-muted">
              Saldo total das contas ativas <strong className="num ml-1 text-base font-semibold text-ink">{formatBRL(total)}</strong>
            </p>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 rounded border-line accent-brand-600"
              />
              Mostrar contas desativadas
            </label>
          </div>

          <div data-tour="accounts-grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => (
              <article key={a.id} className={cn('card p-5', !a.active && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${a.color}26`, color: a.color }}
                  >
                    <Landmark className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  {!a.active && <Pill tone="warn">Desativada</Pill>}
                </div>
                <h3 className="mt-4 truncate font-semibold">{a.name}</h3>
                <p className="text-xs text-ink-muted">{ACCOUNT_TYPE_LABELS[a.type]}</p>
                <p className={cn('num mt-3 text-2xl font-semibold tracking-tight', a.balanceCents < 0 && 'text-expense')}>
                  {formatBRL(a.balanceCents)}
                </p>
                <div className="mt-4 flex gap-1 border-t border-line pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(a);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle.mutate(a, { onSuccess: () => toast.success(a.active ? 'Conta desativada' : 'Conta reativada') })}
                  >
                    {a.active ? <Archive className="h-4 w-4" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />}
                    {a.active ? 'Desativar' : 'Reativar'}
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-auto text-expense" onClick={() => setToDelete(a)} aria-label={`Excluir ${a.name}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <AccountFormModal open={formOpen} onClose={() => setFormOpen(false)} account={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir conta"
        message={`Excluir "${toDelete?.name ?? ''}"? Se ela já tiver transações, será apenas desativada para preservar o histórico.`}
        confirmLabel="Excluir"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          remove.mutate(toDelete.id, {
            onSuccess: (r) => {
              toast.success(r.deactivated ? 'Conta desativada, pois possui histórico' : 'Conta excluída');
              setToDelete(null);
            },
          })
        }
      />
    </>
  );
}
