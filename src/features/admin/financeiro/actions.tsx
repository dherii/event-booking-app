// src/features/admin/financeiro/actions.ts
'use server';

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { cookies } from 'next/headers';
import { calcularTaxa } from './types';
import type { Transacao, StatusTransacao, DadosBancarios } from './types';

const STATUS_MAP: Record<string, StatusTransacao> = {
  PAGO: 'pago',
  PENDENTE: 'pendente',
  ESTORNADO: 'estornado',
  CANCELADO: 'estornado',
};

// ─── Helper interno para pegar o estabelecimento ativo ou global ───
async function getEstabelecimentoAtivo() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado.');
  }

  const { data: profile, error: profileError } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Não foi possível carregar seu perfil.');
  }

  const isSuperAdmin = profile.role === 'super_admin';
  const cookieStore = await cookies();
  const cookieEstabelecimento = cookieStore.get('admin_estabelecimento_id')?.value;

  const isGlobal = isSuperAdmin && cookieEstabelecimento === 'Todos';

  const estabelecimentoId = isSuperAdmin && cookieEstabelecimento && cookieEstabelecimento !== 'Todos'
    ? cookieEstabelecimento
    : profile.estabelecimento_id;

  return {
    userId: user.id,
    role: profile.role,
    isSuperAdmin,
    isGlobal,
    estabelecimentoId,
  };
}

export async function listarTransacoes(): Promise<Transacao[]> {
  const { estabelecimentoId, isGlobal } = await getEstabelecimentoAtivo();
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

  // Se não for global, aplica o filtro do estabelecimento específico
  if (!isGlobal && estabelecimentoId) {
    query = query.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
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
      email: '', // e-mail fica para uma próxima etapa
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

export async function buscarDadosBancarios(): Promise<DadosBancarios | null> {
  try {
    const { estabelecimentoId, isGlobal } = await getEstabelecimentoAtivo();
    
    // No modo global, não existe um único dado bancário padrão de estabelecimento
    if (isGlobal || !estabelecimentoId) return null;

    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('id', estabelecimentoId)
      .single();

    if (!data || !data.recebedor_documento) return null;

    return {
      tipoConta: (data.recebedor_tipo_conta as 'pf' | 'pj') ?? 'pf',
      nomeRazao: data.recebedor_nome || '',
      cpfCnpj: data.recebedor_documento || '',
      banco: data.recebedor_banco || '',
      agencia: data.recebedor_agencia || '',
      conta: data.recebedor_conta || '',
      digitoConta: data.recebedor_digito || '',
      chavePix: data.recebedor_chave_pix || '',
      tipoChavePix: (data.recebedor_tipo_chave_pix as DadosBancarios['tipoChavePix']) || 'email',
    };
  } catch {
    return null;
  }
}

export async function salvarDadosBancarios(dados: DadosBancarios) {
  const { estabelecimentoId, isGlobal } = await getEstabelecimentoAtivo();
  
  if (isGlobal) {
    throw new Error('Não é possível salvar dados bancários no modo global. Selecione um estabelecimento específico.');
  }

  if (!estabelecimentoId) throw new Error('Estabelecimento não encontrado.');

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
    .eq('id', estabelecimentoId);

  if (error) throw new Error('Erro ao salvar os dados bancários.');
  return { success: true };
}