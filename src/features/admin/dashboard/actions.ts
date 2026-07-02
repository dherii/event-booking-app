'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';

// Interfaces para tipagem dos dados do banco
interface Lote {
  nome: string;
}

interface Inscricao {
  lotes: Lote | null;
}

interface VendaAgrupada {
  [key: string]: number;
}

export async function getDashboardData() {
  const supabase = getSupabaseAdmin();

  // 1. Busca das inscrições para a tabela principal
  const { data: inscricoes, error } = await supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      created_at,
      txid_pix,
      lotes (
        preco,
        eventos (
          nome
        )
      )
    `)
    .order('created_at', { ascending: false });

  // 2. Busca das inscrições pagas para o gráfico
  const { data: inscricoesPagas } = await supabase
    .from('inscricoes')
    .select('lotes (nome)')
    .eq('status_pagamento', 'PAGO')
    .returns<Inscricao[]>();

  // 3. Busca total para o contador
  const { count } = await supabase
    .from('inscricoes')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error("❌ ERRO SUPABASE:", error.message);
    return { inscricoes: [], totalParticipantes: 0, chartData: [] };
  }

  const vendasAgrupadas = (inscricoesPagas || []).reduce((acc: VendaAgrupada, curr: Inscricao) => {
    const nomeLote = curr.lotes?.nome || 'Sem Lote';
    acc[nomeLote] = (acc[nomeLote] || 0) + 1;
    return acc;
  }, {});

  // 5. Transformação dos dados
  const chartData = Object.entries(vendasAgrupadas).map(([nome, vendas]) => ({
    nome,
    vendas,
    porcentagem: `w-[${Math.min((vendas / 50) * 100, 100)}%] bg-blue-500`
  }));

  return { 
    inscricoes: inscricoes ?? [], 
    totalParticipantes: count ?? 0,
    chartData: chartData 
  };
}