import { ArrowRightLeft, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PAYMENT_LABELS } from '@/lib/labels';
import { formatBRL } from '@/lib/money';
import type { Transaction } from '@/lib/types';
import { CategoryBadge, Pill } from '@/components/ui/misc';

export function TransactionRow({
  t,
  onEdit,
  onDelete,
}: {
  t: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}) {
  const isTransfer = t.type === 'TRANSFER';
  const amountClass = t.type === 'INCOME' ? 'text-income' : t.type === 'EXPENSE' ? 'text-expense' : 'text-ink-soft';
  const sign = t.type === 'INCOME' ? '+ ' : t.type === 'EXPENSE' ? '- ' : '';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {isTransfer ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink-soft ring-1 ring-line">
          <ArrowRightLeft className="h-[18px] w-[18px]" aria-hidden />
        </span>
      ) : (
        <CategoryBadge color={t.category?.color ?? '#9AA8A4'} icon={t.category?.icon ?? 'tag'} />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{t.description}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          <span>{isTransfer ? 'Transferência' : (t.category?.name ?? 'Sem categoria')}</span>
          <span className="text-ink-soft">
            {t.account.name}
            {t.destinationAccount ? ` para ${t.destinationAccount.name}` : ''}
          </span>
          {t.paymentMethod && <Pill>{PAYMENT_LABELS[t.paymentMethod]}</Pill>}
        </div>
      </div>

      <p className={cn('num shrink-0 text-sm font-semibold', amountClass)}>
        {sign}
        {formatBRL(t.amountCents)}
      </p>

      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-0.5">
          {onEdit && (
            <button
              type="button"
              aria-label={`Editar ${t.description}`}
              onClick={() => onEdit(t)}
              className="rounded-lg p-2 text-ink-muted transition hover:bg-brand-50 hover:text-ink"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Excluir ${t.description}`}
              onClick={() => onDelete(t)}
              className="rounded-lg p-2 text-ink-muted transition hover:bg-expense-soft hover:text-expense"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
