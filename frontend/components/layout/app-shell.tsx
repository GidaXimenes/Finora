'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  LogOut,
  PieChart,
  Plus,
  Settings,
  Sparkles,
  Tags,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { TransactionFormModal } from '@/components/features/transaction-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Loading } from '@/components/ui/misc';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useApiMutation, useMe } from '@/lib/queries';
import { startTour, tourIdFromPath } from '@/lib/tour';
import { Logo } from './logo';

const NAV = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Contas', icon: Landmark },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/budgets', label: 'Orçamentos', icon: PieChart },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { data: me, isError } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const [txOpen, setTxOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const finishOnboarding = useApiMutation(() =>
    api('/auth/me/onboarding', { method: 'PATCH', body: { completed: true } }),
  );

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // mesmo com falha, limpamos o estado local
    }
    qc.clear();
    router.replace('/login');
  }

  useEffect(() => {
    if (isError) void logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  if (!me) return <Loading label="Carregando seu espaço" />;

  const tourId = tourIdFromPath(pathname);
  const welcomeOpen = !me.onboardingCompleted && !dismissed;

  function skipWelcome() {
    setDismissed(true);
    finishOnboarding.mutate();
  }

  function beginTour() {
    skipWelcome();
    if (pathname !== '/dashboard') router.push('/dashboard');
    setTimeout(() => startTour('dashboard'), 700);
  }

  return (
    <div className="min-h-screen">
      {/* Menu lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-white px-4 py-6 md:flex">
        <Link href="/dashboard" className="mb-8 px-2">
          <Logo />
        </Link>
        <nav data-tour="nav" className="flex-1 space-y-1" aria-label="Principal">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-canvas',
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line pt-4">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              pathname.startsWith('/settings') ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-canvas',
            )}
          >
            <Settings className="h-[18px] w-[18px]" aria-hidden />
            Configurações
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-canvas"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
            Sair
          </button>
          <p className="mt-3 truncate px-3 text-xs text-ink-muted" title={me.email}>
            {me.name}
          </p>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas/85 px-4 backdrop-blur md:px-8">
          <Link href="/dashboard" className="md:hidden">
            <Logo />
          </Link>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            {tourId && (
              <Button
                variant="ghost"
                size="sm"
                data-tour="help"
                onClick={() => startTour(tourId)}
                aria-label="Ajuda: tour desta página"
              >
                <HelpCircle className="h-[18px] w-[18px]" aria-hidden />
                <span className="hidden sm:inline">Ajuda</span>
              </Button>
            )}
            <Link
              href="/settings"
              aria-label="Configurações"
              className="rounded-xl p-2 text-ink-soft transition hover:bg-white md:hidden"
            >
              <Settings className="h-[18px] w-[18px]" aria-hidden />
            </Link>
            <Button data-tour="new-transaction" onClick={() => setTxOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Nova transação</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>

      {/* Menu inferior (celular) */}
      <nav
        data-tour="nav"
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
                active ? 'text-brand-700' : 'text-ink-muted',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <TransactionFormModal open={txOpen} onClose={() => setTxOpen(false)} />

      <Modal open={welcomeOpen} onClose={skipWelcome} title={`Olá, ${me.name.split(' ')[0]}!`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            O Finora ajuda você a ver para onde vai o seu dinheiro. Para começar, vale seguir três passos: cadastrar uma
            conta, registrar uma transação e definir um orçamento. Quer um passeio rápido pela tela?
          </p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={skipWelcome}>
            Agora não
          </Button>
          <Button onClick={beginTour}>Fazer o passeio</Button>
        </div>
      </Modal>
    </div>
  );
}
