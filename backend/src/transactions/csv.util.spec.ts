import { buildCsv, csvCell, formatCentsPtBr, formatDatePtBr } from './csv.util';

describe('csv.util', () => {
  it('escapa aspas, ponto e vírgula e quebras de linha', () => {
    expect(csvCell('a;b')).toBe('"a;b"');
    expect(csvCell('diz "oi"')).toBe('"diz ""oi"""');
  });

  it('neutraliza injeção de fórmulas', () => {
    expect(csvCell('=SOMA(A1)')).toBe("'=SOMA(A1)");
    expect(csvCell('@cmd')).toBe("'@cmd");
  });

  it('formata centavos e datas em pt-BR', () => {
    expect(formatCentsPtBr(123456)).toBe('1234,56');
    expect(formatCentsPtBr(5)).toBe('0,05');
    expect(formatDatePtBr('2025-03-09T00:00:00.000Z')).toBe('09/03/2025');
  });

  it('inclui BOM e separa linhas com CRLF', () => {
    const csv = buildCsv([['a', 'b'], ['1', '2']]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('a;b\r\n1;2');
  });
});
