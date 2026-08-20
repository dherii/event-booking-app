// src/app/admin/page.tsx
import { getDashboardData } from '@/src/features/admin/dashboard/actions';
import MetricCards from '@/src/features/admin/components/MetricCards';
import SalesChart from '@/src/features/admin/components/SalesChart';
import OverviewTable, {
  Inscription,
} from '@/src/features/admin/components/OverviewTable';

type RawEvento = {
  nome: string;
};

type RawLote = {
  preco: number;
  nome?: string;
  eventos?: RawEvento[] | RawEvento;
};

type RawInscription = {
  id: string;
  status_pagamento: string;
  created_at: string;
  txid_pix?: string | null;
  lotes: RawLote[] | RawLote | null;
};

export default async function AdminDashboardPage() {
  const { inscricoes, chartData } = await getDashboardData();

  const data: Inscription[] = (Array.isArray(inscricoes) ? inscricoes : []).map(
    (i: RawInscription) => {
      const loteRaw = Array.isArray(i.lotes) ? i.lotes[0] : i.lotes;
      const eventoRaw = Array.isArray(loteRaw?.eventos)
        ? loteRaw?.eventos[0]
        : loteRaw?.eventos;

      return {
        id: String(i.id),
        status_pagamento: String(i.status_pagamento),
        created_at: String(i.created_at),
        txid_pix: i.txid_pix ?? null,
        lotes: loteRaw
          ? {
              preco: Number(loteRaw.preco ?? 0),
              eventos: eventoRaw
                ? { nome: eventoRaw.nome }
                : undefined,
            }
          : null,
      };
    }
  );

  const metrics = {
    totalReceita: data.reduce(
      (acc, i) => acc + (Number(i.lotes?.preco) || 0),
      0
    ),
    totalInscritos: data.length,
    pagos: data.filter((i) => i.status_pagamento === 'PAGO').length,
    pendentes: data.filter((i) => i.status_pagamento !== 'PAGO').length,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visão geral e desempenho em tempo real do seu estabelecimento
        </p>
      </div>

      <MetricCards metrics={metrics} />

      <div className="grid grid-cols-1 gap-8">
        <SalesChart data={chartData} />
        <OverviewTable inscricoes={data} />
      </div>
    </div>
  );
}