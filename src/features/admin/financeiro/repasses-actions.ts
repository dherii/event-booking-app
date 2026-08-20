// src/features/admin/financeiro/repasses-actions.ts
'use server';

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { TAXA_PLATAFORMA, calcularTaxa } from './types';

export interface SaldoEstabelecimento {
  estabelecimentoId: string;
  nome: string;
  chavePix: string;
  tipoChave: string;
  banco: string;
  favorecido: string;
  qtdIngressos: number;
  valorBruto: number;
  taxaPlataforma: number;
  valorLiquido: number;
  inscricoesIds: string[];
}

// ─── 1. Busca todos os saldos pendentes agrupados por CA ────────────────────
export async function listarSaldosPendentes(): Promise<SaldoEstabelecimento[]> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    throw new Error('Acesso negado. Apenas o Super Admin pode ver os repasses globais.');
  }

  const supabase = getSupabaseAdmin();

  // Busca ingressos pagos que ainda não foram repassados
  const { data: inscricoes, error } = await supabase
    .from('inscricoes')
    .select(`
      id,
      lotes!inner (
        preco,
        eventos!inner (
          estabelecimento_id,
          estabelecimentos ( id, nome, recebedor_chave_pix, recebedor_tipo_chave_pix, recebedor_nome, recebedor_banco )
        )
      )
    `)
    .eq('status_pagamento', 'PAGO')
    .is('repasse_id', null);

  if (error) throw new Error('Erro ao buscar ingressos pendentes.');
  if (!inscricoes) return [];

  // Agrupa a matemática por Estabelecimento (CA)
  const mapa = new Map<string, SaldoEstabelecimento>();

  for (const i of inscricoes) {
    const lote = Array.isArray(i.lotes) ? i.lotes[0] : i.lotes;
    const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;
    const estab = Array.isArray(evento?.estabelecimentos) ? evento?.estabelecimentos[0] : evento?.estabelecimentos;

    if (!estab) continue;

    const estabId = estab.id;
    const preco = Number(lote.preco ?? 0);

    if (!mapa.has(estabId)) {
      mapa.set(estabId, {
        estabelecimentoId: estabId,
        nome: estab.nome,
        chavePix: estab.recebedor_chave_pix ?? 'Não cadastrada',
        tipoChave: estab.recebedor_tipo_chave_pix ?? '—',
        banco: estab.recebedor_banco ?? '—',
        favorecido: estab.recebedor_nome ?? '—',
        qtdIngressos: 0,
        valorBruto: 0,
        taxaPlataforma: 0,
        valorLiquido: 0,
        inscricoesIds: [],
      });
    }

    const saldo = mapa.get(estabId)!;
    saldo.qtdIngressos += 1;
    saldo.valorBruto += preco;
    saldo.inscricoesIds.push(i.id);
  }

  // Calcula taxas e líquido final
  const resultados = Array.from(mapa.values()).map((saldo) => {
    const taxa = calcularTaxa(saldo.valorBruto);
    return {
      ...saldo,
      taxaPlataforma: taxa,
      valorLiquido: saldo.valorBruto - taxa,
    };
  });

  return resultados.sort((a, b) => b.valorLiquido - a.valorLiquido); // Do maior repasse pro menor
}

// ─── 2. Liquida o repasse (Gera o recibo e atualiza os ingressos) ───────────
export async function liquidarRepasse(estabelecimentoId: string, inscricoesIds: string[], valorBruto: number) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();
  
  // Confirma os dados da conta do CA no momento do pagamento
  const { data: estab } = await supabase
    .from('estabelecimentos')
    .select('recebedor_chave_pix')
    .eq('id', estabelecimentoId)
    .single();

  const taxa = calcularTaxa(valorBruto);
  const liquido = valorBruto - taxa;

  // 1. Cria o registro oficial do Repasse
  const { data: repasse, error: errRepasse } = await supabase
    .from('repasses')
    .insert({
      estabelecimento_id: estabelecimentoId,
      valor_bruto: valorBruto,
      taxa_plataforma: taxa,
      valor_liquido: liquido,
      chave_pix_destino: estab?.recebedor_chave_pix,
      criado_por: user.id,
      status: 'pago'
    })
    .select('id')
    .single();

  if (errRepasse || !repasse) throw new Error('Erro ao gerar recibo de repasse.');

  // 2. Atualiza todas as inscrições para vinculá-las a este repasse
  const { error: errUpdate } = await supabase
    .from('inscricoes')
    .update({ repasse_id: repasse.id })
    .in('id', inscricoesIds);

  if (errUpdate) {
    console.error('CRÍTICO: Repasse criado, mas ingressos não foram atualizados.', errUpdate);
    throw new Error('Repasse gerado com alertas. Contate o suporte.');
  }

  return { success: true };
}