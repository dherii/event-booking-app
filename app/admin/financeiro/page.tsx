// app/admin/financeiro/page.tsx
'use client';

import { useState } from 'react';
import { BarChart2, Landmark } from 'lucide-react';
import { ResumoFinanceiro }    from '@/src/features/admin/financeiro/components/ResumoFinanceiro';
import { TabelaExtrato }       from '@/src/features/admin/financeiro/components/TabelaExtrato';
import { FormDadosBancarios }  from '@/src/features/admin/financeiro/components/FormDadosBancarios';
import { MOCK_TRANSACOES }     from '@/src/features/admin/financeiro/types';

type Tab = 'extrato' | 'bancario';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'extrato',  label: 'Visão Geral e Extrato',  icon: BarChart2  },
  { id: 'bancario', label: 'Dados Bancários',         icon: Landmark   },
];

export default function FinanceiroPage() {
  const [tab, setTab] = useState<Tab>('extrato');

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted mt-0.5">
          Acompanhe a arrecadação e configure seus dados para recebimento.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground hover:border-border'
                  }
                `}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo */}
      {tab === 'extrato' && (
        <div className="space-y-6">
          <ResumoFinanceiro transacoes={MOCK_TRANSACOES} />
          <TabelaExtrato    transacoes={MOCK_TRANSACOES} />
        </div>
      )}

      {tab === 'bancario' && (
        <FormDadosBancarios />
      )}
    </div>
  );
}