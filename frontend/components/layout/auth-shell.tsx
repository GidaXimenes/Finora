import { PiggyBank, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from './logo';

const POINTS = [
  { icon: PiggyBank, text: 'Veja para onde vai cada real, mês a mês.' },
  { icon: Sparkles, text: 'Um passeio guiado mostra tudo no primeiro acesso.' },
  { icon: ShieldCheck, text: 'Seus dados são só seus: exporte ou exclua quando quiser.' },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <aside className="hidden flex-col justify-between bg-brand-800 p-12 text-brand-50 lg:flex">
        <Logo className="[&_span]:!text-white" />
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-snug tracking-tight">
            Suas finanças organizadas, sem planilha e sem complicação.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-brand-100">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden />
                <span className="text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-brand-300">Projeto de portfólio, feito com Next.js, NestJS e PostgreSQL.</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
