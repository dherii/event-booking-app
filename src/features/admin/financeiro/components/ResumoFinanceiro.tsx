'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TrendingUp, Percent, Wallet } from 'lucide-react';
import type { Transacao } from '../types';
import { gerarDadosGrafico } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  variant: 'default' | 'muted' | 'accent';
}

function KpiCard({ label, value, sub, icon: Icon, variant }: KpiProps) {
  const iconClass =
    variant === 'accent' ? 'bg-primary/10 text-primary' :
    variant === 'muted'  ? 'bg-error-bg text-error-fg'  :
                           'bg-border text-muted';

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-xs text-muted mt-1">{sub}</p>
      </div>
    </div>
  );
}

// ─── Tooltip customizado ──────────────────────────────────────────────────────

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
      <p className="text-muted text-xs font-medium mb-2">{label}</p>
      <p className="text-foreground">
        <span className="text-muted mr-2">Bruto</span>
        <span className="font-semibold">{fmt(Number(valorBruto ?? 0))}</span>
      </p>
      <p className="text-foreground">
        <span className="text-muted mr-2">Líquido</span>
        <span className="font-semibold text-primary">{fmt(Number(valorLiquido ?? 0))}</span>
      </p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ResumoFinanceiroProps {
  transacoes: Transacao[];
}

export function ResumoFinanceiro({ transacoes }: ResumoFinanceiroProps) {
  const pagas = transacoes.filter((t) => t.status === 'pago');

  const totalBruto   = pagas.reduce((s, t) => s + t.valorBruto,   0);
  const totalTaxas   = pagas.reduce((s, t) => s + t.taxa,         0);
  const totalLiquido = pagas.reduce((s, t) => s + t.valorLiquido, 0);

  const grafico = gerarDadosGrafico();

  return (
    <div className="space-y-5">

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Arrecadado (Bruto)"
          value={fmt(totalBruto)}
          sub={`${pagas.length} transação${pagas.length !== 1 ? 'ões' : ''} confirmada${pagas.length !== 1 ? 's' : ''}`}
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

      {/* Gráfico */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-6">
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)', radius: 4 }} />
            <Bar dataKey="bruto"   radius={[4, 4, 0, 0]} fill="var(--border)" />
            <Bar dataKey="liquido" radius={[4, 4, 0, 0]} fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}