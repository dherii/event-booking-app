// src/features/admin/participantes/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import type { Inscrito, StatusPagamento } from './types';
import { exigirDonoOuAdmin } from '@/src/features/admin/configuracoes/actions';

const STATUS_MAP: Record<string, StatusPagamento> = {
  PAGO: 'pago',
  PENDENTE: 'pendente',
  CANCELADO: 'cancelado',
  ESTORNADO: 'cancelado',
  CORTESIA: 'cortesia',
};

export type ResultadoCheckin =
  | { tipo: 'sucesso'; checkinAt: string }
  | { tipo: 'ja-feito'; checkinAt: string | null }
  | { tipo: 'erro'; mensagem: string };



export async function realizarCheckin(inscricaoId: string): Promise<ResultadoCheckin> {
  let role: string;
  let estabelecimentoId: string | null;
  let isGlobal: boolean;

  try {
    const info = await exigirDonoOuAdmin();
    role = info.role;
    estabelecimentoId = info.estabelecimentoId;
    isGlobal = info.isGlobal;
  } catch {
    return { tipo: 'erro', mensagem: 'Você precisa estar logado.' };
  }

  if (isGlobal) {
    return { tipo: 'erro', mensagem: 'Selecione um estabelecimento específico para realizar o check-in.' };
  }

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!papeisPermitidos.includes(role)) {
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

  if (role !== 'super_admin' && evento?.estabelecimento_id !== estabelecimentoId) {
    return { tipo: 'erro', mensagem: 'Este ingresso não pertence ao seu estabelecimento.' };
  } else if (role === 'super_admin' && estabelecimentoId && evento?.estabelecimento_id !== estabelecimentoId) {
    return { tipo: 'erro', mensagem: 'Este ingresso não pertence ao estabelecimento selecionado.' };
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

  revalidatePath('/admin/participantes');
  return { tipo: 'sucesso', checkinAt: agora };
}

export async function alternarFrequencia(inscricaoId: string, diaNumero: number, presenteAtual: boolean) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('frequencias')
    .upsert(
      {
        inscricao_id: inscricaoId,
        dia_numero: diaNumero,
        presente: !presenteAtual,
        data_checkin: new Date().toISOString(),
      },
      { onConflict: 'inscricao_id,dia_numero' }
    );

  if (error) throw new Error(`Erro ao registrar frequência: ${error.message}`);

  revalidatePath('/admin/participantes');
  return { success: true };
}

async function verificarPermissaoInscricao(inscricaoId: string) {
  const { role, estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();

  if (isGlobal) {
    throw new Error('Ação não permitida no modo global. Selecione um estabelecimento específico.');
  }

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!papeisPermitidos.includes(role)) {
    throw new Error('Você não tem permissão para esta ação.');
  }

  const supabase = getSupabaseAdmin();

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      lote_id,
      lotes!inner ( eventos!inner ( estabelecimento_id ) )
    `)
    .eq('id', inscricaoId)
    .single();

  if (error || !inscricao) throw new Error('Inscrição não encontrada.');

  const lote = Array.isArray(inscricao.lotes) ? inscricao.lotes[0] : inscricao.lotes;
  const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;

  if (role !== 'super_admin' && evento?.estabelecimento_id !== estabelecimentoId) {
    throw new Error('Esta inscrição não pertence ao seu estabelecimento.');
  } else if (role === 'super_admin' && estabelecimentoId && evento?.estabelecimento_id !== estabelecimentoId) {
    throw new Error('Esta inscrição não pertence ao estabelecimento selecionado.');
  }

  return { supabase, inscricao };
}

export async function aprovarCortesia(inscricaoId: string) {
  const { supabase, inscricao } = await verificarPermissaoInscricao(inscricaoId);

  if (['CANCELADO', 'ESTORNADO'].includes(inscricao.status_pagamento)) {
    throw new Error('Não é possível aprovar cortesia para uma inscrição cancelada.');
  }

  const { error } = await supabase
    .from('inscricoes')
    .update({ status_pagamento: 'CORTESIA' })
    .eq('id', inscricaoId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/participantes');
  return { success: true };
}

export async function cancelarInscricao(inscricaoId: string) {
  const { supabase, inscricao } = await verificarPermissaoInscricao(inscricaoId);

  if (['CANCELADO', 'ESTORNADO'].includes(inscricao.status_pagamento)) {
    return { success: true };
  }

  const { error: errCancelar } = await supabase
    .from('inscricoes')
    .update({ status_pagamento: 'CANCELADO' })
    .eq('id', inscricaoId);

  if (errCancelar) throw new Error(errCancelar.message);

  const { error: errDevolucao } = await supabase.rpc('devolver_vaga', { p_lote_id: inscricao.lote_id });
  if (errDevolucao) {
    console.error('Erro ao devolver vaga ao estoque:', errDevolucao);
  }

  revalidatePath('/admin/participantes');
  return { success: true };
}

export async function listarParticipantes(): Promise<Inscrito[]> {
  const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();

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
        eventos!inner ( id, nome, estabelecimento_id, dias )
      ),
      ingressos_validacao ( utilizado, data_checkin ),
      frequencias ( dia_numero, presente )
    `);

  if (!isGlobal && estabelecimentoId) {
    query = query.eq('lotes.eventos.estabelecimento_id', estabelecimentoId);
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

  const inscritosMapeados = inscricoes.map((i): Inscrito => {
    const lote = Array.isArray(i.lotes) ? i.lotes[0] : i.lotes;
    const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;
    const validacao = Array.isArray(i.ingressos_validacao) ? i.ingressos_validacao[0] : i.ingressos_validacao;
    const perfil = perfilPorId.get(i.usuario_id);

    const freqLista = (i.frequencias ?? []).map((f: { dia_numero: number; presente: boolean }) => ({
      diaNumero: f.dia_numero,
      presente: f.presente,
    }));

    return {
      id: i.id,
      nome: perfil?.nome ?? 'Comprador',
      email: '',
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
      frequencias: freqLista,
      diasEvento: Number(evento?.dias ?? 1), 
    };
  });

  // Retorna ordenado alfabéticamente pelo nome do participante (A-Z)
  return inscritosMapeados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}