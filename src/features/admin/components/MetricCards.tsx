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
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Receita Total</p>
        <p className="text-2xl font-bold text-green-400 mt-2">R$ {metrics.totalReceita.toFixed(2)}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total de Inscrições</p>
        <p className="text-2xl font-bold text-white mt-2">{metrics.totalInscritos}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pagamentos Confirmados</p>
        <p className="text-2xl font-bold text-blue-400 mt-2">{metrics.pagos}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Aguardando Pix</p>
        <p className="text-2xl font-bold text-yellow-500 mt-2">{metrics.pendentes}</p>
      </div>
    </div>
  );
}