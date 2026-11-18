const pad = (n: number) => String(n).padStart(2, '0');

/** Data local do navegador no formato AAAA-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const currentMonth = () => todayISO().slice(0, 7);

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

/** "2025-03" -> "março de 2025" */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

/** "2025-03" -> "mar" */
export function monthShort(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace('.', '');
}

/** Primeiro e último dia do mês: "2024-02" -> { from: "2024-02-01", to: "2024-02-29" } */
export function monthBounds(key: string): { from: string; to: string } {
  const [y, m] = key.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${key}-01`, to: `${key}-${pad(last)}` };
}

/** "2025-03-09T00:00:00.000Z" -> "09/03/2025" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** Rótulo amigável de um dia: Hoje, Ontem ou "seg., 10 de mar." */
export function dayLabel(iso: string): string {
  const day = iso.slice(0, 10);
  const today = todayISO();
  if (day === today) return 'Hoje';
  const [y, m, d] = today.split('-').map(Number);
  const yesterday = new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
  if (day === yesterday) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`));
}
