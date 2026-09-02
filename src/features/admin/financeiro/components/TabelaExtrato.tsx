// src/features/admin/financeiro/components/TabelaExtrato.tsx
'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronDown, ArrowUpRight } from 'lucide-react';
import type { Transacao, StatusTransacao } from '../types';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' '
    + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG: Record<StatusTransacao, { label: string; className: string }> = {
  pago:      { label: 'Confirmado', className: 'bg-success-bg text-success-fg border border-success-fg/20' },
  pendente:  { label: 'Pendente',   className: 'bg-warning-bg text-warning-fg border border-warning-fg/20' },
  estornado: { label: 'Estornado',  className: 'bg-error-bg text-error-fg border border-error-fg/20'       },
};

interface TabelaExtratoProps {
  transacoes: Transacao[];
}

export function TabelaExtrato({ transacoes }: TabelaExtratoProps) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusTransacao | ''>('');

  const filtradas = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return transacoes.filter((t) => {
      const matchBusca  = !q || t.aluno.toLowerCase().includes(q) || t.evento.toLowerCase().includes(q);
      const matchStatus = !filtroStatus || t.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [transacoes, busca, filtroStatus]);

  const totalFiltro = filtradas
    .filter((t) => t.status === 'pago')
    .reduce((s, t) => ({ bruto: s.bruto + t.valorBruto, liquido: s.liquido + t.valorLiquido }), { bruto: 0, liquido: 0 });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
          <input
            type="text"
            className="input-base pl-10"
            placeholder="Buscar por aluno ou evento…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="input-base appearance-none pr-9"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusTransacao | '')}
          >
            <option value="">Todos os status</option>
            <option value="pago">Confirmado</option>
            <option value="pendente">Pendente</option>
            <option value="estornado">Estornado</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border-light bg-background-secondary/70 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-5 py-3.5">Data</th>
                <th className="px-5 py-3.5">Comprador</th>
                <th className="px-5 py-3.5">Evento / Lote</th>
                <th className="px-5 py-3.5">Bruto</th>
                <th className="px-5 py-3.5">Taxa (5%)</th>
                <th className="px-5 py-3.5">Líquido</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                filtradas.map((t) => {
                  const cfg = STATUS_CONFIG[t.status];
                  const estornado = t.status === 'estornado';
                  return (
                    <tr key={t.id} className={`hover:bg-background-secondary/60 transition-colors ${estornado ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">{fmtData(t.data)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-foreground">{t.aluno}</p>
                        {t.email && <p className="text-xs text-muted">{t.email}</p>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-foreground">{t.evento}</p>
                        <p className="text-xs text-muted">{t.lote}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">
                        {estornado ? <span className="line-through text-muted-subtle">{fmt(t.valorBruto)}</span> : fmt(t.valorBruto)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {estornado ? <span className="text-muted-subtle">—</span> : <span className="text-error-fg font-medium">−{fmt(t.taxa)}</span>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {estornado ? <span className="text-muted-subtle">—</span> : <span className="text-success-fg font-semibold">{fmt(t.valorLiquido)}</span>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtradas.length > 0 && (
          <div className="px-5 py-3.5 border-t border-border-light bg-background-secondary/50 flex flex-wrap items-center justify-end gap-x-6 gap-y-1 text-xs">
            <span className="text-muted">
              Bruto filtrado: <span className="font-semibold text-foreground">{fmt(totalFiltro.bruto)}</span>
            </span>
            <span className="text-muted flex items-center gap-1">
              Líquido filtrado:
              <span className="font-semibold text-success-fg ml-1">{fmt(totalFiltro.liquido)}</span>
              <ArrowUpRight size={13} className="text-success-fg" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}