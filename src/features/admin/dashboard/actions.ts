// src/features/admin/dashboard/actions.ts
'use server';

import { getSupabaseAdmin } from '@/src/config/supabase';
import { exigirDonoOuAdmin } from '@/src/features/admin/configuracoes/actions';

interface Evento {
  estabelecimento_id: string;
}

interface Lote {
  nome: string;
  preco?: number;
  eventos?: Evento | Evento[] | null;
}

interface InscricaoPaga {
  status_pagamento: string;
  lotes: Lote | Lote[] | null;
}

interface VendaAgrupada {
  [key: string]: number;
}

export async function getDashboardData() {
  try {
    const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();

    const supabase = getSupabaseAdmin();

    let queryInscricoes = supabase
      .from('inscricoes')
      .select(`
        id,
        status_pagamento,
        created_at,
        txid_pix,
        lotes!inner (
          preco,
          nome,
          eventos!inner ( nome, estabelecimento_id )
        )
      `)
      .order('created_at', { ascending: false });

    if (!isGlobal && estabelecimentoId) {
      queryInscricoes = queryInscricoes.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
    }

    const { data: inscricoes, error } = await queryInscricoes;

    if (error) {
      console.error("❌ ERRO SUPABASE:", error.message);
      return { inscricoes: [], totalParticipantes: 0, receitaTotal: 0, chartData: [] };
    }

    // Busca apenas as inscrições que são efetivamente pagas E cujo lote tem preço > 0
    let queryPagas = supabase
      .from('inscricoes')
      .select(`
        status_pagamento,
        lotes!inner (
          preco,
          nome,
          eventos!inner ( estabelecimento_id )
        )
      `)
      .eq('status_pagamento', 'PAGO')
      .gt('lotes.preco', 0);

    if (!isGlobal && estabelecimentoId) {
      queryPagas = queryPagas.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
    }

    const { data: inscricoesPagas } = await queryPagas.returns<InscricaoPaga[]>();

    const receitaTotal = (inscricoesPagas || []).reduce((acc, curr) => {
      const loteObj = Array.isArray(curr.lotes) ? curr.lotes[0] : curr.lotes;
      const precoLote = Number(loteObj?.preco ?? 0);
      return acc + precoLote;
    }, 0);

    let queryCount = supabase
      .from('inscricoes')
      .select('id, lotes!inner ( eventos!inner ( estabelecimento_id ) )', { count: 'exact', head: true });

    if (!isGlobal && estabelecimentoId) {
      queryCount = queryCount.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
    }

    const { count } = await queryCount;

    // Agrupa apenas as vendas pagas reais para o gráfico financeiro de lotes vendidos
    const vendasAgrupadas = (inscricoesPagas || []).reduce((acc: VendaAgrupada, curr: InscricaoPaga) => {
      const loteObj = Array.isArray(curr.lotes) ? curr.lotes[0] : curr.lotes;
      const nomeLote = loteObj?.nome || 'Sem Lote';
      acc[nomeLote] = (acc[nomeLote] || 0) + 1;
      return acc;
    }, {});

    // Correção: antes essa string também embutia "bg-blue-500" junto com a largura,
    // o que colidia com o "bg-primary" já aplicado no SalesChart (duas classes de
    // cor de fundo na mesma div — resultado imprevisível). Agora geramos só a largura;
    // a cor fica inteiramente a cargo do componente que já usa o token do tema.
    const chartData = Object.entries(vendasAgrupadas).map(([nome, vendas]) => ({
      nome,
      vendas,
      porcentagem: `w-[${Math.min((vendas / 50) * 100, 100)}%]`
    }));

    return {
      inscricoes: inscricoes ?? [],
      totalParticipantes: count ?? 0,
      receitaTotal: receitaTotal,
      chartData: chartData
    };
  } catch (err) {
    console.error("❌ ERRO DE AUTORIZAÇÃO NA DASHBOARD:", err);
    return { inscricoes: [], totalParticipantes: 0, receitaTotal: 0, chartData: [] };
  }
}