'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { ColorPicker } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/money-input';
import { api } from '@/lib/api';
import { ACCOUNT_TYPE_LABELS, COLOR_CHOICES } from '@/lib/labels';
import { useApiMutation } from '@/lib/queries';
import type { Account, AccountType } from '@/lib/types';

export function AccountFormModal({
  open,
  onClose,
  account,
}: {
  open: boolean;
  onClose: () => void;
  account?: Account | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={account ? 'Editar conta' : 'Nova conta'}>
      {open && <AccountForm key={account?.id ?? 'new'} account={account ?? null} onDone={onClose} />}
    </Modal>
  );
}

function AccountForm({ account, onDone }: { account: Account | null; onDone: () => void }) {
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountType>(account?.type ?? 'CHECKING');
  const [initial, setInitial] = useState(account?.initialBalanceCents ?? 0);
  const [color, setColor] = useState(account?.color ?? COLOR_CHOICES[0]);
  const [error, setError] = useState('');

  const save = useApiMutation(
    (body: Record<string, unknown>) =>
      account
        ? api(`/accounts/${account.id}`, { method: 'PATCH', body })
        : api('/accounts', { method: 'POST', body }),
    'Conta salva',
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Informe o nome da conta');
    setError('');
    save.mutate({ name: name.trim(), type, initialBalanceCents: initial, color }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Nome da conta" htmlFor="acc-name" error={error}>
        <Input id="acc-name" value={name} maxLength={60} placeholder="Ex.: Nubank" onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Tipo" htmlFor="acc-type">
        <Select id="acc-type" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Saldo inicial"
        htmlFor="acc-initial"
        hint="Quanto havia na conta quando você começou a usar o Finora. As transações somam e subtraem a partir daqui."
      >
        <MoneyInput id="acc-initial" valueCents={initial} onChange={setInitial} allowNegative />
      </Field>
      <Field label="Cor">
        <ColorPicker value={color} onChange={setColor} choices={COLOR_CHOICES} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          Salvar conta
        </Button>
      </div>
    </form>
  );
}
