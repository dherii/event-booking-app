import { listarTransacoes } from '@/src/features/admin/financeiro/actions';
import { FinanceiroTabs } from '@/src/features/admin/financeiro/components/FinanceiroTabs';

export default async function FinanceiroPage() {
  const transacoes = await listarTransacoes();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financeiro</h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe a arrecadação e configure seus dados para recebimento.
        </p>
      </div>

      <FinanceiroTabs transacoes={transacoes} />
    </div>
  );
}