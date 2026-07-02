interface SalesChartProps {
  data: {
    nome: string;
    vendas: number;
    porcentagem: string;
  }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-white mb-4">Vendas por Lote</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.nome} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-medium">{item.nome}</span>
              <span className="text-gray-300 font-bold">{item.vendas} ingressos</span>
            </div>
            <div className="w-full bg-gray-950 h-3 rounded-full overflow-hidden border border-gray-800/50">
              <div className={`h-full rounded-full ${item.porcentagem}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}