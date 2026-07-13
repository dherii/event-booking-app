// app/admin/financeiro/page.tsx
import { listarTransacoes } from '@/src/features/admin/financeiro/actions';
import { FinanceiroTabs } from '@/src/features/admin/financeiro/components/FinanceiroTabs';

export default async function FinanceiroPage() {
  const transacoes = await listarTransacoes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted mt-0.5">
          Acompanhe a arrecadação e configure seus dados para recebimento.
        </p>
      </div>

      <FinanceiroTabs transacoes={transacoes} />
    </div>
  );
}
