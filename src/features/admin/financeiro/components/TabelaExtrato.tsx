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
  pago:      { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pendente:  { label: 'Pendente',   className: 'bg-amber-50 text-amber-700 border border-amber-200'     },
  estornado: { label: 'Estornado',  className: 'bg-rose-50 text-rose-700 border border-rose-200'         },
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
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            placeholder="Buscar por aluno ou evento…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2 text-sm appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusTransacao | '')}
          >
            <option value="">Todos os status</option>
            <option value="pago">Confirmado</option>
            <option value="pendente">Pendente</option>
            <option value="estornado">Estornado</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Data</th>
                <th className="px-5 py-3.5">Comprador</th>
                <th className="px-5 py-3.5">Evento / Lote</th>
                <th className="px-5 py-3.5">Bruto</th>
                <th className="px-5 py-3.5">Taxa (5%)</th>
                <th className="px-5 py-3.5">Líquido</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                filtradas.map((t) => {
                  const cfg = STATUS_CONFIG[t.status];
                  const estornado = t.status === 'estornado';
                  return (
                    <tr key={t.id} className={`hover:bg-slate-50/60 transition-colors ${estornado ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{fmtData(t.data)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-slate-900">{t.aluno}</p>
                        {t.email && <p className="text-xs text-slate-500">{t.email}</p>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-slate-900">{t.evento}</p>
                        <p className="text-xs text-slate-500">{t.lote}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                        {estornado ? <span className="line-through text-slate-400">{fmt(t.valorBruto)}</span> : fmt(t.valorBruto)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {estornado ? <span className="text-slate-400">—</span> : <span className="text-rose-600 font-medium">−{fmt(t.taxa)}</span>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {estornado ? <span className="text-slate-400">—</span> : <span className="text-emerald-600 font-semibold">{fmt(t.valorLiquido)}</span>}
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
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-x-6 gap-y-1 text-xs">
            <span className="text-slate-500">
              Bruto filtrado: <span className="font-semibold text-slate-900">{fmt(totalFiltro.bruto)}</span>
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              Líquido filtrado:
              <span className="font-semibold text-emerald-600 ml-1">{fmt(totalFiltro.liquido)}</span>
              <ArrowUpRight size={13} className="text-emerald-600" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}