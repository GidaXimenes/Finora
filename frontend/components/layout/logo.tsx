import { cn } from '@/lib/cn';

export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden>
        <rect width="64" height="64" rx="16" fill="#468B7C" />
        <path d="M18 44c8-2 10-10 14-16s9-8 14-8" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <circle cx="46" cy="20" r="4.5" fill="#BEDDD5" />
      </svg>
      {showName && <span className="text-xl font-semibold tracking-tight text-ink">Finora</span>}
    </span>
  );
}
