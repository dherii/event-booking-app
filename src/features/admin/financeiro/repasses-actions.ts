// src/features/admin/financeiro/repasses-actions.ts
'use server';

import { createSupabaseServerClient } from '@/src/config/supabase-server';

export interface SaldoPendente {
  id: string;
  estabelecimentoId: string;
  nomeEstabelecimento: string;
  valorLiquido: number;
  taxaPlataforma: number;
  totalVendas: number;
}

export async function listarSaldosPendentes(): Promise<SaldoPendente[]> {
  const supabase = await createSupabaseServerClient();

  // Exemplo de consulta adaptada para a sua estrutura de repasses/estabelecimentos
  const { data, error } = await supabase
    .from('estabelecimentos')
    .select('id, nome');

  if (error) {
    console.error('Erro ao buscar saldos:', error.message);
    return [];
  }

  // Retorno mapeado (você pode ajustar de acordo com as colunas reais da sua tabela)
  return (data || []).map((item) => ({
    id: item.id,
    estabelecimentoId: item.id,
    nomeEstabelecimento: item.nome || 'Estabelecimento',
    valorLiquido: 0,
    taxaPlataforma: 0,
    totalVendas: 0,
  }));
}