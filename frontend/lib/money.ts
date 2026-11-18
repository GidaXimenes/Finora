const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const plain = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Maior valor aceito pela API: R$ 10.000.000,00. */
export const MAX_CENTS = 1_000_000_000;

/** 123456 -> "R$ 1.234,56" */
export const formatBRL = (cents: number) => brl.format(cents / 100);

/** 123456 -> "1.234,56" */
export const formatNumber = (cents: number) => plain.format(cents / 100);

/** Para eixos de gráfico: 1250000 -> "12,5 mil" */
export function formatCompact(cents: number): string {
  const v = Math.abs(cents) / 100;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace('.', ',')} mil`;
  return String(Math.round(v));
}
