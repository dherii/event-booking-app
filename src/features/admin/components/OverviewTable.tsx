// src/features/admin/components/OverviewTable.tsx
'use client';

export interface Inscription {
  id: string;
  txid_pix?: string | null;
  status_pagamento: string;
  created_at: string;
  lotes: {
    preco: number;
    eventos?: {
      nome: string;
    };
  } | null;
}

interface OverviewTableProps {
  inscricoes: Inscription[];
}

export default function OverviewTable({ inscricoes }: OverviewTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">
          Últimas Inscrições Realizadas
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-secondary border-b border-border text-xs text-muted font-semibold uppercase tracking-wider">
              <th className="p-4">Evento</th>
              <th className="p-4">Forma de Pagamento / PIX</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-sm">
            {inscricoes.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted">
                  Nenhuma inscrição encontrada até o momento.
                </td>
              </tr>
            ) : (
              inscricoes.map((inscricao) => {
                const preco = inscricao.lotes?.preco ?? 0;
                const isGratuito = preco === 0;

                return (
                  <tr
                    key={inscricao.id}
                    className="hover:bg-background-secondary/60 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {inscricao.lotes?.eventos?.nome || 'Não identificado'}
                    </td>

                    <td className="p-4 font-mono text-xs max-w-[150px] truncate">
                      {isGratuito ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-tertiary text-muted border border-border">
                          GRATUITO
                        </span>
                      ) : (
                        <span className="text-primary">
                          {inscricao.txid_pix ?? '-'}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-success-fg font-semibold">
                      R$ {preco.toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          inscricao.status_pagamento === 'PAGO'
                            ? 'bg-success-bg text-success-fg border border-success-fg/20'
                            : inscricao.status_pagamento === 'PENDENTE'
                            ? 'bg-warning-bg text-warning-fg border border-warning-fg/20'
                            : 'bg-error-bg text-error-fg border border-error-fg/20'
                        }`}
                      >
                        {inscricao.status_pagamento}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}