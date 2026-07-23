'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

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
  // 1. Descobre o estabelecimento do usuário logado — CRÍTICO: sem isso,
  //    qualquer dono veria os dados de todos os estabelecimentos da plataforma.
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return { inscricoes: [], totalParticipantes: 0, chartData: [] };
  }

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  const ehSuperAdmin = profile?.role === 'super_admin';
  const estabelecimentoId = profile?.estabelecimento_id;

  if (!ehSuperAdmin && !estabelecimentoId) {
    // Usuário sem estabelecimento vinculado — não deveria nem chegar aqui
    // (middleware já bloqueia), mas por segurança retorna vazio.
    return { inscricoes: [], totalParticipantes: 0, chartData: [] };
  }

  const supabase = getSupabaseAdmin();

  // 2. Busca das inscrições para a tabela principal — agora com !inner e
  //    filtro por estabelecimento_id
  let queryInscricoes = supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      created_at,
      txid_pix,
      lotes!inner (
        preco,
        eventos!inner ( nome, estabelecimento_id )
      )
    `)
    .order('created_at', { ascending: false });

  if (!ehSuperAdmin) {
    queryInscricoes = queryInscricoes.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
  }

  const { data: inscricoes, error } = await queryInscricoes;

  if (error) {
    console.error("❌ ERRO SUPABASE:", error.message);
    return { inscricoes: [], totalParticipantes: 0, chartData: [] };
  }

  // 3. Busca das inscrições pagas para o gráfico — mesmo filtro
  let queryPagas = supabase
    .from('inscricoes')
    .select('lotes!inner ( nome, eventos!inner ( estabelecimento_id ) )')
    .eq('status_pagamento', 'PAGO');

  if (!ehSuperAdmin) {
    queryPagas = queryPagas.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
  }

  const { data: inscricoesPagas } = await queryPagas.returns<Inscricao[]>();

  // 4. Total para o contador — mesmo filtro
  let queryCount = supabase
    .from('inscricoes')
    .select('id, lotes!inner ( eventos!inner ( estabelecimento_id ) )', { count: 'exact', head: true });

  if (!ehSuperAdmin) {
    queryCount = queryCount.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
  }

  const { count } = await queryCount;

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
