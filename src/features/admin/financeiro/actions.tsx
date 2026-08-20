// src/features/admin/financeiro/actions.ts
'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { calcularTaxa } from './types';
import type { Transacao, StatusTransacao } from './types';

const STATUS_MAP: Record<string, StatusTransacao> = {
  PAGO: 'pago',
  PENDENTE: 'pendente',
  ESTORNADO: 'estornado',
  CANCELADO: 'estornado',
};

export async function listarTransacoes(): Promise<Transacao[]> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      created_at,
      usuario_id,
      lotes!inner (
        nome,
        preco,
        tipo,
        eventos!inner ( id, nome, estabelecimento_id )
      )
    `)
    .order('created_at', { ascending: false });

  if (profile?.role !== 'super_admin') {
    query = query.eq('lotes.eventos.estabelecimento_id', profile?.estabelecimento_id);
  }

  const { data: inscricoes, error } = await query;
  if (error) {
    console.error('Erro ao buscar inscrições:', error);
    throw new Error(error.message);
  }
  if (!inscricoes || inscricoes.length === 0) return [];

  // Busca os nomes dos compradores em lote (evita 1 chamada por linha)
  const usuarioIds = Array.from(new Set(inscricoes.map((i) => i.usuario_id).filter(Boolean)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .in('id', usuarioIds);

  const nomeporId = new Map((profiles ?? []).map((p) => [p.id, p.nome]));

  return inscricoes.map((i): Transacao => {
    const lote = Array.isArray(i.lotes) ? i.lotes[0] : i.lotes;
    const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;

    const bruto = Number(lote?.preco ?? 0);
    const status = STATUS_MAP[i.status_pagamento] ?? 'pendente';
    const taxa = status === 'estornado' ? 0 : calcularTaxa(bruto);
    const valorLiquido = status === 'estornado' ? 0 : bruto - taxa;

    return {
      id: i.id,
      data: i.created_at,
      aluno: nomeporId.get(i.usuario_id) ?? 'Comprador',
      email: '', // e-mail fica para uma próxima etapa (vive em auth.users)
      evento: evento?.nome ?? 'Evento removido',
      lote: lote?.nome ?? '—',
      valorBruto: bruto,
      taxa,
      valorLiquido,
      status,
    };
  });
}

// ─── Dados Bancários (Repasse MisticPay) ──────────────────────────────────────

import { DadosBancarios } from './types';

export async function buscarDadosBancarios(): Promise<DadosBancarios | null> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id')
    .eq('id', user.id)
    .single();

  if (!profile?.estabelecimento_id) return null;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('id', profile.estabelecimento_id)
    .single();

  if (!data || !data.recebedor_documento) return null; // Se não tem documento, assume que nunca preencheu

  return {
    tipoConta: data.recebedor_tipo_conta as 'pf' | 'pj',
    nomeRazao: data.recebedor_nome || '',
    cpfCnpj: data.recebedor_documento || '',
    banco: data.recebedor_banco || '',
    agencia: data.recebedor_agencia || '',
    conta: data.recebedor_conta || '',
    digitoConta: data.recebedor_digito || '',
    chavePix: data.recebedor_chave_pix || '',
    tipoChavePix: data.recebedor_tipo_chave_pix as any,
  };
}

export async function salvarDadosBancarios(dados: DadosBancarios) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id')
    .eq('id', user.id)
    .single();

  if (!profile?.estabelecimento_id) throw new Error('Estabelecimento não encontrado.');

  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from('estabelecimentos')
    .update({
      recebedor_tipo_conta: dados.tipoConta,
      recebedor_nome: dados.nomeRazao,
      recebedor_documento: dados.cpfCnpj,
      recebedor_banco: dados.banco,
      recebedor_agencia: dados.agencia,
      recebedor_conta: dados.conta,
      recebedor_digito: dados.digitoConta,
      recebedor_chave_pix: dados.chavePix,
      recebedor_tipo_chave_pix: dados.tipoChavePix,
    })
    .eq('id', profile.estabelecimento_id);

  if (error) throw new Error('Erro ao salvar os dados bancários.');
  return { success: true };
}
