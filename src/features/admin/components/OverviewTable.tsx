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
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md">
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white">
          Últimas Inscrições Realizadas
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 border-b border-gray-800 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <th className="p-4">Evento</th>
              <th className="p-4">TXID Pix</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50 text-sm">
            {inscricoes.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Nenhuma inscrição encontrada até o momento.
                </td>
              </tr>
            ) : (
              inscricoes.map((inscricao) => (
                <tr
                  key={inscricao.id}
                  className="hover:bg-gray-800/20 transition-colors"
                >
                  <td className="p-4 font-medium text-white">
                    {inscricao.lotes?.eventos?.nome || 'Não identificado'}
                  </td>

                  <td className="p-4 font-mono text-xs text-blue-400 max-w-[150px] truncate">
                    {inscricao.txid_pix ?? '-'}
                  </td>

                  <td className="p-4 text-green-400 font-semibold">
                    R$ {(inscricao.lotes?.preco ?? 0).toFixed(2)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        inscricao.status_pagamento === 'PAGO'
                          ? 'bg-green-500/10 text-green-400'
                          : inscricao.status_pagamento === 'PENDENTE'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {inscricao.status_pagamento}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}