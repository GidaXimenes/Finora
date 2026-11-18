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

export default function LoginPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useMutation({
    mutationFn: () => api<{ user: User }>('/auth/login', { method: 'POST', body: { email, password } }),
    onSuccess: (res) => {
      qc.clear();
      qc.setQueryData(['me'], res.user);
      router.replace('/dashboard');
    },
    onError: (e: Error) => setError(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    login.mutate();
  }

  return (
    <AuthShell title="Entrar" subtitle="Bom te ver de volta. Entre para continuar de onde parou.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="E-mail" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" htmlFor="password" error={error}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={login.isPending}>
          Entrar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Ainda não tem conta?{' '}
        <Link href="/register" className="font-medium text-brand-700 hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
