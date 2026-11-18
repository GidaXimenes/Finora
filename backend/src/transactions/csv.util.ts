/** Escapa uma célula para CSV com ';' (padrão do Excel em pt-BR) e neutraliza injeção de fórmulas. */
export function csvCell(value: string | number): string {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[";\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildCsv(rows: Array<Array<string | number>>): string {
  // BOM para o Excel reconhecer UTF-8
  return '\uFEFF' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n');
}

/** 123456 -> "1234,56" */
export function formatCentsPtBr(cents: number): string {
  const abs = Math.abs(cents);
  return `${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}

/** "2025-03-09" -> "09/03/2025" */
export function formatDatePtBr(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
