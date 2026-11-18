'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Sparkles, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/misc';
import { api } from '@/lib/api';
import { useMe } from '@/lib/queries';
import { startTour } from '@/lib/tour';

export default function SettingsPage() {
  const { data: me } = useMe();
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const deleteAccount = useMutation({
    mutationFn: () => api('/auth/me', { method: 'DELETE', body: { password } }),
    onSuccess: () => {
      qc.clear();
      router.replace('/login');
    },
    onError: (e: Error) => setError(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    deleteAccount.mutate();
  }

  function replayTour() {
    router.push('/dashboard');
    setTimeout(() => startTour('dashboard'), 700);
  }

  return (
    <>
      <PageHeader title="Configurações" description="Seu perfil, seus dados e o passeio guiado." />

      <div className="max-w-2xl space-y-6">
        <section className="card p-6">
          <h2 className="font-semibold">Perfil</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-muted">Nome</dt>
              <dd className="mt-0.5 text-sm font-medium">{me?.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">E-mail</dt>
              <dd className="mt-0.5 text-sm font-medium">{me?.email}</dd>
            </div>
          </dl>
        </section>

        <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="font-semibold">Passeio guiado</h2>
            <p className="mt-1 text-sm text-ink-muted">Reveja onde fica cada coisa no Finora.</p>
          </div>
          <Button variant="secondary" onClick={replayTour}>
            <Sparkles className="h-4 w-4" aria-hidden />
            Refazer o passeio
          </Button>
        </section>

        <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="font-semibold">Seus dados</h2>
            <p className="mt-1 text-sm text-ink-muted">Baixe todas as suas transações em CSV, quando quiser.</p>
          </div>
          <a
            href="/api/transactions/export"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-brand-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Exportar tudo
          </a>
        </section>

        <section className="card border-expense/30 p-6">
          <h2 className="font-semibold text-expense">Excluir conta</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Apaga definitivamente sua conta e todos os seus dados: contas, transações, categorias e orçamentos. Não dá para desfazer.
          </p>
          <Button variant="danger" className="mt-4" onClick={() => setOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Excluir minha conta
          </Button>
        </section>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Excluir conta" description="Confirme com sua senha para continuar.">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Senha" htmlFor="del-password" error={error}>
            <Input id="del-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={deleteAccount.isPending}>
              Excluir para sempre
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
