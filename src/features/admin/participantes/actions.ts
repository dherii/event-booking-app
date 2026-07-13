// src/features/admin/participantes/actions.ts
'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import type { Inscrito, StatusPagamento } from './types';

const STATUS_MAP: Record<string, StatusPagamento> = {
  PAGO: 'pago',
  PENDENTE: 'pendente',
  CANCELADO: 'cancelado',
  ESTORNADO: 'cancelado',
  CORTESIA: 'cortesia',
};

export type ResultadoCheckin =
  | { tipo: 'sucesso';  checkinAt: string }
  | { tipo: 'ja-feito'; checkinAt: string | null }
  | { tipo: 'erro';     mensagem: string };

export async function realizarCheckin(inscricaoId: string): Promise<ResultadoCheckin> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return { tipo: 'erro', mensagem: 'Você precisa estar logado.' };

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!profile || !papeisPermitidos.includes(profile.role)) {
    return { tipo: 'erro', mensagem: 'Você não tem permissão para fazer check-in.' };
  }

  const supabase = getSupabaseAdmin();

  const { data: inscricao, error: fetchError } = await supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      lotes!inner ( eventos!inner ( estabelecimento_id ) )
    `)
    .eq('id', inscricaoId)
    .single();

  if (fetchError || !inscricao) {
    return { tipo: 'erro', mensagem: 'Ingresso não encontrado no sistema.' };
  }

  const lote = Array.isArray(inscricao.lotes) ? inscricao.lotes[0] : inscricao.lotes;
  const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;

  if (profile.role !== 'super_admin' && evento?.estabelecimento_id !== profile.estabelecimento_id) {
    return { tipo: 'erro', mensagem: 'Este ingresso não pertence ao seu estabelecimento.' };
  }

  if (['CANCELADO', 'ESTORNADO'].includes(inscricao.status_pagamento)) {
    return { tipo: 'erro', mensagem: 'Este ingresso foi cancelado.' };
  }

  if (inscricao.status_pagamento === 'PENDENTE') {
    return { tipo: 'erro', mensagem: 'Pagamento ainda não foi confirmado para este ingresso.' };
  }

  const { data: validacaoExistente } = await supabase
    .from('ingressos_validacao')
    .select('id, utilizado, data_checkin')
    .eq('inscricao_id', inscricaoId)
    .maybeSingle();

  if (validacaoExistente?.utilizado) {
    return { tipo: 'ja-feito', checkinAt: validacaoExistente.data_checkin };
  }

  const agora = new Date().toISOString();

  if (validacaoExistente) {
    await supabase
      .from('ingressos_validacao')
      .update({ utilizado: true, data_checkin: agora })
      .eq('id', validacaoExistente.id);
  } else {
    await supabase
      .from('ingressos_validacao')
      .insert({ inscricao_id: inscricaoId, utilizado: true, data_checkin: agora });
  }

  return { tipo: 'sucesso', checkinAt: agora };
}

export async function listarParticipantes(): Promise<Inscrito[]> {
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
      txid_pix,
      lotes!inner (
        id,
        nome,
        preco,
        tipo,
        eventos!inner ( id, nome, estabelecimento_id )
      ),
      ingressos_validacao ( utilizado, data_checkin )
    `)
    .order('created_at', { ascending: false });

  if (profile?.role !== 'super_admin') {
    query = query.eq('lotes.eventos.estabelecimento_id', profile?.estabelecimento_id);
  }

  const { data: inscricoes, error } = await query;
  if (error) {
    console.error('Erro ao buscar participantes:', error);
    throw new Error(error.message);
  }
  if (!inscricoes || inscricoes.length === 0) return [];

  const usuarioIds = Array.from(new Set(inscricoes.map((i) => i.usuario_id).filter(Boolean)));
  const { data: perfis } = await supabase
    .from('profiles')
    .select('id, nome, cpf, telefone')
    .in('id', usuarioIds);

  const perfilPorId = new Map((perfis ?? []).map((p) => [p.id, p]));

  return inscricoes.map((i): Inscrito => {
    const lote = Array.isArray(i.lotes) ? i.lotes[0] : i.lotes;
    const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;
    const validacao = Array.isArray(i.ingressos_validacao) ? i.ingressos_validacao[0] : i.ingressos_validacao;
    const perfil = perfilPorId.get(i.usuario_id);

    return {
      id: i.id,
      nome: perfil?.nome ?? 'Comprador',
      email: '', // pendente — vive em auth.users
      cpf: perfil?.cpf ?? '—',
      telefone: perfil?.telefone ?? '—',
      evento: evento?.nome ?? 'Evento removido',
      eventoId: evento?.id ?? '',
      atividade: lote?.tipo === 'ingresso' ? 'Acesso Geral' : (lote?.tipo === 'mesa' ? 'Mesa' : 'Camarote'),
      lote: lote?.nome ?? '—',
      valor: Number(lote?.preco ?? 0),
      status: STATUS_MAP[i.status_pagamento] ?? 'pendente',
      checkin: validacao?.utilizado ?? false,
      checkinAt: validacao?.data_checkin ?? null,
      criadoEm: i.created_at,
      codigoIngresso: i.txid_pix ?? i.id.slice(0, 8).toUpperCase(),
    };
  });
}
