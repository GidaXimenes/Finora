'use client';

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { monthShort } from '@/lib/dates';
import { formatBRL, formatCompact } from '@/lib/money';
import type { Dashboard } from '@/lib/types';

export function EvolutionChart({ data }: { data: Dashboard['evolution'] }) {
  const rows = data.map((d) => ({ ...d, label: monthShort(d.month) }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barGap={4} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E5EAE7" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7B8884' }} />
          <YAxis
            width={48}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#7B8884' }}
            tickFormatter={(v) => formatCompact(Number(v))}
          />
          <Tooltip
            cursor={{ fill: '#F0F7F5' }}
            formatter={(v) => formatBRL(Number(v))}
            contentStyle={{ borderRadius: 12, border: '1px solid #E5EAE7', fontSize: 13 }}
          />
          <Bar dataKey="incomeCents" name="Receitas" fill="#66A597" radius={[6, 6, 0, 0]} maxBarSize={22} />
          <Bar dataKey="expenseCents" name="Despesas" fill="#DDA6A1" radius={[6, 6, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpenseDonut({ data, totalCents }: { data: Dashboard['expensesByCategory']; totalCents: number }) {
  return (
    <div className="relative mx-auto h-44 w-44 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalCents"
            nameKey="name"
            innerRadius={56}
            outerRadius={84}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.categoryId ?? d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => formatBRL(Number(v))}
            contentStyle={{ borderRadius: 12, border: '1px solid #E5EAE7', fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs text-ink-muted">Despesas</span>
        <span className="num text-sm font-semibold">{formatBRL(totalCents)}</span>
      </div>
    </div>
  );
}
