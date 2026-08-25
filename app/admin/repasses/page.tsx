// app/admin/repasses/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { listarSaldosPendentes } from '@/src/features/admin/financeiro/repasses-actions';
import { RepassesDashboard } from '@/src/features/admin/financeiro/components/RepassesDashboard';

export const revalidate = 0;

export default async function RepassesPage() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    redirect('/admin'); 
  }

  // Busca os saldos reais pendentes direto do Supabase
  const saldos = await listarSaldosPendentes();

  // Calcula os totais reais com base nos dados do banco
  const totalGeralDevido = saldos.reduce((acc, s) => acc + s.valorLiquido, 0);
  const suaFatiaTotal = saldos.reduce((acc, s) => acc + s.taxaPlataforma, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Repasses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle do fluxo de caixa e transferências para os Centros Acadêmicos.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-right">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total a Pagar</p>
            <p className="text-lg font-black text-emerald-700">
              {totalGeralDevido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seu Lucro (Taxas)</p>
            <p className="text-lg font-black text-white">
              {suaFatiaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      <RepassesDashboard saldos={saldos} />
    </div>
  );
}