'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface Item {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const push = useCallback((kind: Item['kind'], message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4200);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[10050] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
        aria-live="polite"
      >
        {items.map((i) => (
          <div
            key={i.id}
            className={cn(
              'pointer-events-auto flex max-w-sm animate-toast-in items-start gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm shadow-pop',
              i.kind === 'success' ? 'border-brand-200' : 'border-expense/30',
            )}
          >
            {i.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-expense" aria-hidden />
            )}
            <span className="text-ink">{i.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
