'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { Loading } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/money-input';
import { api } from '@/lib/api';
import { PERIOD_LABELS } from '@/lib/labels';
import { useApiMutation, useCategories } from '@/lib/queries';
import type { Budget, BudgetPeriod } from '@/lib/types';

export function BudgetFormModal({
  open,
  onClose,
  budget,
}: {
  open: boolean;
  onClose: () => void;
  budget?: Budget | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={budget ? 'Editar orçamento' : 'Novo orçamento'}>
      {open && <BudgetForm key={budget?.id ?? 'new'} budget={budget ?? null} onDone={onClose} />}
    </Modal>
  );
}

function BudgetForm({ budget, onDone }: { budget: Budget | null; onDone: () => void }) {
  const categories = useCategories('EXPENSE');
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? '');
  const [limit, setLimit] = useState(budget?.limitCents ?? 0);
  const [period, setPeriod] = useState<BudgetPeriod>(budget?.period ?? 'MONTHLY');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useApiMutation(
    (body: Record<string, unknown>) =>
      budget
        ? api(`/budgets/${budget.id}`, { method: 'PATCH', body })
        : api('/budgets', { method: 'POST', body }),
    'Orçamento salvo',
  );

  if (categories.isLoading) return <Loading />;

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!budget && !categoryId) next.category = 'Escolha uma categoria';
    if (limit <= 0) next.limit = 'Informe um limite maior que zero';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    save.mutate(
      budget ? { limitCents: limit, period } : { categoryId, limitCents: limit, period },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Categoria" htmlFor="bud-cat" error={errors.category}>
        <Select id="bud-cat" value={categoryId} disabled={!!budget} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Selecione</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Limite de gastos" htmlFor="bud-limit" error={errors.limit}>
        <MoneyInput id="bud-limit" valueCents={limit} onChange={setLimit} invalid={!!errors.limit} />
      </Field>
      <Field label="Período" htmlFor="bud-period" hint="Mensal reinicia a cada mês. Anual considera o ano inteiro.">
        <Select id="bud-period" value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}>
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          Salvar orçamento
        </Button>
      </div>
    </form>
  );
}
