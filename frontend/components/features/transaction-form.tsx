'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Segmented, Select } from '@/components/ui/field';
import { EmptyState, Loading } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/money-input';
import { api } from '@/lib/api';
import { todayISO } from '@/lib/dates';
import { PAYMENT_LABELS } from '@/lib/labels';
import { useAccounts, useAllCategories, useApiMutation } from '@/lib/queries';
import type { PaymentMethod, Transaction, TransactionType } from '@/lib/types';

const TYPE_OPTIONS: Array<{ value: TransactionType; label: string }> = [
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'INCOME', label: 'Receita' },
  { value: 'TRANSFER', label: 'Transferência' },
];

export function TransactionFormModal({
  open,
  onClose,
  transaction,
}: {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={transaction ? 'Editar transação' : 'Nova transação'}>
      {open && <TransactionForm key={transaction?.id ?? 'new'} transaction={transaction ?? null} onDone={onClose} />}
    </Modal>
  );
}

function TransactionForm({ transaction, onDone }: { transaction: Transaction | null; onDone: () => void }) {
  const accountsQuery = useAccounts(true);
  const categoriesQuery = useAllCategories();

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'EXPENSE');
  const [amountCents, setAmountCents] = useState(transaction?.amountCents ?? 0);
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [date, setDate] = useState(transaction?.date.slice(0, 10) ?? todayISO());
  const [accountId, setAccountId] = useState(transaction?.accountId ?? '');
  const [destinationId, setDestinationId] = useState(transaction?.destinationAccountId ?? '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [payment, setPayment] = useState<PaymentMethod | ''>(transaction?.paymentMethod ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useApiMutation(
    (body: Record<string, unknown>) =>
      transaction
        ? api(`/transactions/${transaction.id}`, { method: 'PATCH', body })
        : api('/transactions', { method: 'POST', body }),
    'Transação salva',
  );

  if (accountsQuery.isLoading || categoriesQuery.isLoading) return <Loading />;

  const accounts = (accountsQuery.data ?? []).filter(
    (a) => a.active || a.id === transaction?.accountId || a.id === transaction?.destinationAccountId,
  );
  const activeAccounts = accounts.filter((a) => a.active);

  if (!transaction && activeAccounts.length === 0) {
    return (
      <EmptyState
        icon={<Landmark className="h-6 w-6" aria-hidden />}
        title="Cadastre uma conta primeiro"
        description="Toda transação fica ligada a uma conta, como sua carteira ou seu banco. Leva só alguns segundos."
        action={
          <Link
            href="/accounts"
            onClick={onDone}
            className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Ir para Contas
          </Link>
        }
      />
    );
  }

  const effectiveAccountId = accountId || activeAccounts[0]?.id || '';
  const categories = (categoriesQuery.data ?? []).filter(
    (c) => c.type === type && (c.active || c.id === categoryId),
  );
  const isTransfer = type === 'TRANSFER';

  function changeType(next: TransactionType) {
    setType(next);
    setCategoryId('');
    setErrors({});
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (amountCents <= 0) next.amount = 'Informe um valor maior que zero';
    if (!description.trim()) next.description = 'Informe uma descrição';
    if (!effectiveAccountId) next.account = 'Escolha uma conta';
    if (isTransfer) {
      if (!destinationId) next.destination = 'Escolha a conta de destino';
      else if (destinationId === effectiveAccountId) next.destination = 'Escolha uma conta diferente da origem';
    } else if (!categoryId) {
      next.category = 'Escolha uma categoria';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    save.mutate(
      {
        type,
        amountCents,
        description: description.trim(),
        date,
        accountId: effectiveAccountId,
        ...(isTransfer ? { destinationAccountId: destinationId } : { categoryId }),
        ...(payment ? { paymentMethod: payment } : {}),
      },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Segmented label="Tipo" value={type} onChange={changeType} options={TYPE_OPTIONS} />

      <Field label="Valor" htmlFor="tx-amount" error={errors.amount}>
        <MoneyInput id="tx-amount" valueCents={amountCents} onChange={setAmountCents} invalid={!!errors.amount} />
      </Field>

      <Field label="Descrição" htmlFor="tx-desc" error={errors.description}>
        <Input
          id="tx-desc"
          value={description}
          maxLength={120}
          placeholder={isTransfer ? 'Ex.: Reserva do mês' : type === 'INCOME' ? 'Ex.: Salário de março' : 'Ex.: Mercado'}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data" htmlFor="tx-date">
          <Input id="tx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Forma de pagamento" htmlFor="tx-pay">
          <Select id="tx-pay" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod | '')}>
            <option value="">Não informar</option>
            {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className={isTransfer ? 'grid gap-4 sm:grid-cols-2' : ''}>
        <Field label={isTransfer ? 'Conta de origem' : 'Conta'} htmlFor="tx-account" error={errors.account}>
          <Select id="tx-account" value={effectiveAccountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.active ? '' : ' (inativa)'}
              </option>
            ))}
          </Select>
        </Field>
        {isTransfer && (
          <Field label="Conta de destino" htmlFor="tx-dest" error={errors.destination}>
            <Select id="tx-dest" value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
              <option value="">Selecione</option>
              {accounts
                .filter((a) => a.id !== effectiveAccountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </Select>
          </Field>
        )}
      </div>

      {!isTransfer && (
        <Field label="Categoria" htmlFor="tx-cat" error={errors.category}>
          <Select id="tx-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Selecione</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          Salvar transação
        </Button>
      </div>
    </form>
  );
}
