interface SalesChartProps {
  data: {
    nome: string;
    vendas: number;
    porcentagem: string;
  }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">Vendas por Lote</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.nome} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted font-medium">{item.nome}</span>
              <span className="text-foreground font-bold">{item.vendas} ingressos</span>
            </div>
            <div className="w-full bg-background-secondary h-3 rounded-full overflow-hidden border border-border">
              <div className={`h-full rounded-full bg-primary ${item.porcentagem}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}