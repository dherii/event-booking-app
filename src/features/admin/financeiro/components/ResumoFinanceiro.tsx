// src/features/admin/financeiro/components/ResumoFinanceiro.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Percent, Wallet } from 'lucide-react';
import type { Transacao } from '../types';
import { gerarDadosGrafico } from '../types';

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
    variant === 'accent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
    variant === 'muted'  ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                           'bg-blue-50 text-blue-600 border border-blue-100';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
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
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-sm space-y-1">
      <p className="text-slate-500 text-xs font-medium mb-1.5">{label}</p>
      <p className="text-slate-900 text-xs flex justify-between gap-4">
        <span className="text-slate-500">Bruto:</span>
        <span className="font-semibold">{fmt(Number(valorBruto ?? 0))}</span>
      </p>
      <p className="text-slate-900 text-xs flex justify-between gap-4">
        <span className="text-slate-500">Líquido:</span>
        <span className="font-semibold text-blue-600">{fmt(Number(valorLiquido ?? 0))}</span>
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

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Receita por dia</h2>
            <p className="text-xs text-slate-500 mt-0.5">Bruto vs. líquido — últimas transações</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-200" />
              Bruto
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-600" />
              Líquido
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={grafico} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="bruto" radius={[4, 4, 0, 0]} fill="#e2e8f0" />
            <Bar dataKey="liquido" radius={[4, 4, 0, 0]} fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}