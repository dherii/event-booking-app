// src/features/admin/components/MetricCards.tsx
'use client';

interface MetricCardsProps {
  metrics: {
    totalReceita: number;
    totalInscritos: number;
    pagos: number;
    pendentes: number;
  };
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider">Receita Total</p>
        <p className="text-2xl font-bold text-emerald-600 mt-2">
          R$ {metrics.totalReceita.toFixed(2)}
        </p>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider">Total de Inscrições</p>
        <p className="text-2xl font-bold text-foreground mt-2">{metrics.totalInscritos}</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider">Pagamentos Confirmados</p>
        <p className="text-2xl font-bold text-primary mt-2">{metrics.pagos}</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider">Aguardando Pagamento</p>
        <p className="text-2xl font-bold text-amber-600 mt-2">{metrics.pendentes}</p>
      </div>
    </div>
  );
}