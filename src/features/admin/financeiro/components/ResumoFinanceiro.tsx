// src/features/admin/financeiro/components/ResumoFinanceiro.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Percent, Wallet } from 'lucide-react';
import type { Transacao } from '../types';
import { gerarDadosGrafico } from '../types';

// Cores literais para o recharts — o SVG do gráfico não lê classes Tailwind/CSS vars,
// então usamos os mesmos hex do tema Vertix (azul-marinho + off-white) diretamente aqui.
const CHART_COLORS = {
  grid: '#e5e0d4',      // --border
  axisText: '#4b5a70',  // --muted
  bruto: '#e5e0d4',     // --border (neutro, "bruto")
  liquido: '#0f2647',   // --primary (azul-marinho, "líquido")
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface KpiProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  variant: 'default' | 'muted' | 'accent';
}

function KpiCard({ label, value, sub, icon: Icon, variant }: KpiProps) {
  const iconClass =
    variant === 'accent' ? 'bg-success-bg text-success-fg border border-success-fg/15' :
    variant === 'muted'  ? 'bg-error-bg text-error-fg border border-error-fg/15' :
                           'bg-primary/10 text-primary border border-primary/15';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-xs text-muted mt-1">{sub}</p>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | string | undefined; [key: string]: unknown }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length < 2) return null;

  const valorBruto = payload[0]?.value;
  const valorLiquido = payload[1]?.value;

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm space-y-1">
      <p className="text-muted text-xs font-medium mb-1.5">{label}</p>
      <p className="text-foreground text-xs flex justify-between gap-4">
        <span className="text-muted">Bruto:</span>
        <span className="font-semibold">{fmt(Number(valorBruto ?? 0))}</span>
      </p>
      <p className="text-foreground text-xs flex justify-between gap-4">
        <span className="text-muted">Líquido:</span>
        <span className="font-semibold text-primary">{fmt(Number(valorLiquido ?? 0))}</span>
      </p>
    </div>
  );
}

interface ResumoFinanceiroProps {
  transacoes: Transacao[];
}

export function ResumoFinanceiro({ transacoes }: ResumoFinanceiroProps) {
  const pagas = transacoes.filter((t) => t.status === 'pago');

  const totalBruto = pagas.reduce((s, t) => s + t.valorBruto, 0);
  const totalTaxas = pagas.reduce((s, t) => s + t.taxa, 0);
  const totalLiquido = pagas.reduce((s, t) => s + t.valorLiquido, 0);

  const grafico = gerarDadosGrafico();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Arrecadado (Bruto)"
          value={fmt(totalBruto)}
          sub={`${pagas.length} transações confirmadas`}
          icon={TrendingUp}
          variant="default"
        />
        <KpiCard
          label="Taxas da Plataforma (5%)"
          value={fmt(totalTaxas)}
          sub="Retidas automaticamente pela plataforma"
          icon={Percent}
          variant="muted"
        />
        <KpiCard
          label="Receita Líquida Disponível"
          value={fmt(totalLiquido)}
          sub="Disponível para repasse ao CA"
          icon={Wallet}
          variant="accent"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Receita por dia</h2>
            <p className="text-xs text-muted mt-0.5">Bruto vs. líquido — últimas transações</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-border" />
              Bruto
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" />
              Líquido
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={grafico} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: CHART_COLORS.axisText }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axisText }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--background-secondary)' }} />
            <Bar dataKey="bruto" radius={[4, 4, 0, 0]} fill={CHART_COLORS.bruto} />
            <Bar dataKey="liquido" radius={[4, 4, 0, 0]} fill={CHART_COLORS.liquido} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}