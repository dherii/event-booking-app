// src/features/admin/financeiro/components/FinanceiroTabs.tsx
'use client';

import { useState } from 'react';
import { BarChart2, Landmark } from 'lucide-react';
import { ResumoFinanceiro } from './ResumoFinanceiro';
import { TabelaExtrato } from './TabelaExtrato';
import { FormDadosBancarios } from './FormDadosBancarios';
import type { Transacao } from '../types';

type Tab = 'extrato' | 'bancario';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'extrato', label: 'Visão Geral e Extrato', icon: BarChart2 },
  { id: 'bancario', label: 'Dados Bancários', icon: Landmark },
];

export function FinanceiroTabs({ transacoes }: { transacoes: Transacao[] }) {
  const [tab, setTab] = useState<Tab>('extrato');

  return (
    <>
      <div className="border-b border-border">
        <div className="flex gap-2 -mb-px overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted hover:text-foreground hover:border-input-border-hover'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'extrato' && (
        <div className="space-y-6 mt-6">
          {transacoes.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center bg-card">
              <p className="text-sm font-medium text-foreground">Nenhuma venda registrada ainda.</p>
              <p className="text-xs text-muted mt-1">Assim que alguém comprar um ingresso, aparecerá aqui.</p>
            </div>
          ) : (
            <>
              <ResumoFinanceiro transacoes={transacoes} />
              <TabelaExtrato transacoes={transacoes} />
            </>
          )}
        </div>
      )}

      {tab === 'bancario' && (
        <div className="mt-6">
          <FormDadosBancarios />
        </div>
      )}
    </>
  );
}