'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/layout/auth-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const register = useMutation({
    mutationFn: () => api<{ user: User }>('/auth/register', { method: 'POST', body: { name, email, password } }),
    onSuccess: (res) => {
      qc.clear();
      qc.setQueryData(['me'], res.user);
      router.replace('/dashboard');
    },
    onError: (e: Error) => setError(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError('A senha deve ter ao menos 8 caracteres');
    setError('');
    register.mutate();
  }

  return (
    <AuthShell title="Criar conta" subtitle="Leva menos de um minuto. Sem cartão, sem complicação.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome" htmlFor="name">
          <Input id="name" autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" htmlFor="password" hint="Mínimo de 8 caracteres." error={error}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={register.isPending}>
          Criar conta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
