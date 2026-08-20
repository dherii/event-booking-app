// app/admin/repasses/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
// Deixamos a chamada original comentada para quando formos reativar o banco
// import { listarSaldosPendentes } from '@/src/features/admin/financeiro/repasses-actions';
import { RepassesDashboard } from '@/src/features/admin/financeiro/components/RepassesDashboard';

export const revalidate = 0;

// ─── DADOS MOCKADOS PARA TESTE VISUAL ─────────────────────────────────────────
const MOCK_SALDOS = [
  {
    estabelecimentoId: 'mock-direito',
    nome: 'CA de Direito',
    chavePix: '12.345.678/0001-99',
    tipoChave: 'cnpj',
    banco: 'Banco do Brasil',
    favorecido: 'Diretório Acadêmico de Direito',
    qtdIngressos: 320,
    valorBruto: 16000.00,
    taxaPlataforma: 800.00, // 5%
    valorLiquido: 15200.00,
    inscricoesIds: ['id1', 'id2'],
  },
  {
    estabelecimentoId: 'mock-sistemas',
    nome: 'CA de Sistemas de Informação',
    chavePix: 'sistemas@unicatolica.edu.br',
    tipoChave: 'email',
    banco: 'Nubank',
    favorecido: 'Centro Acadêmico de SI',
    qtdIngressos: 145,
    valorBruto: 5800.00,
    taxaPlataforma: 290.00, // 5%
    valorLiquido: 5510.00,
    inscricoesIds: ['id3', 'id4'],
  },
  {
    estabelecimentoId: 'mock-atletica-odonto',
    nome: 'Atlética de Odontologia',
    chavePix: '+5588999990000',
    tipoChave: 'telefone',
    banco: 'Mercado Pago',
    favorecido: 'Assoc. Atlética Odontologia',
    qtdIngressos: 210,
    valorBruto: 8400.00,
    taxaPlataforma: 420.00, // 5%
    valorLiquido: 7980.00,
    inscricoesIds: ['id5', 'id6'],
  },
  {
    estabelecimentoId: 'mock-ca-odonto',
    nome: 'CA de Odontologia',
    chavePix: 'ca.odonto@gmail.com',
    tipoChave: 'email',
    banco: 'Banco Inter',
    favorecido: 'Centro Acadêmico Odonto',
    qtdIngressos: 65,
    valorBruto: 2600.00,
    taxaPlataforma: 130.00, // 5%
    valorLiquido: 2470.00,
    inscricoesIds: ['id7', 'id8'],
  }
];
// ──────────────────────────────────────────────────────────────────────────────

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

  // Desativamos o banco temporariamente e injetamos os mocks
  // const saldos = await listarSaldosPendentes();
  const saldos = MOCK_SALDOS;

  // O Next.js vai calcular o topo da página automaticamente com base nos mocks
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