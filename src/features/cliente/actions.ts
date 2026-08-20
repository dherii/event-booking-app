// src/features/cliente/actions.ts
'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export interface MinhaInscricao {
  id: string;
  eventoId: string;
  eventoNome: string;
  eventoDataInicio: string;
  loteNome: string;
  loteTipo: string;
  valor: number;
  status: string;
  criadoEm: string;
  podecancelar: boolean;
  horasAteEvento: number;
  transferenciaToken: string | null;
}

const JANELA_CANCELAMENTO_HORAS = 48;

export async function listarMinhasInscricoes(): Promise<MinhaInscricao[]> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const { data: inscricoes, error } = await supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      created_at,
      transferencia_token,
      lotes!inner (
        nome,
        preco,
        tipo,
        eventos!inner ( id, nome, data_inicio )
      )
    `)
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!inscricoes) return [];

  const agora = Date.now();

  return inscricoes.map((i): MinhaInscricao => {
    const lote = Array.isArray(i.lotes) ? i.lotes[0] : i.lotes;
    const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;

    const dataEvento = evento?.data_inicio ? new Date(evento.data_inicio).getTime() : agora;
    const horasAteEvento = Math.round((dataEvento - agora) / (1000 * 60 * 60));

    const cancelavel = !['CANCELADO', 'ESTORNADO'].includes(i.status_pagamento)
      && horasAteEvento >= JANELA_CANCELAMENTO_HORAS;

    return {
      id: i.id,
      eventoId: evento?.id ?? '',
      eventoNome: evento?.nome ?? 'Evento removido',
      eventoDataInicio: evento?.data_inicio ?? '',
      loteNome: lote?.nome ?? '—',
      loteTipo: lote?.tipo ?? 'ingresso',
      valor: Number(lote?.preco ?? 0),
      status: i.status_pagamento,
      criadoEm: i.created_at,
      podecancelar: cancelavel,
      horasAteEvento,
      transferenciaToken: i.transferencia_token,
    };
  });
}

export async function cancelarMinhaInscricao(inscricaoId: string) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      usuario_id,
      lote_id,
      lotes!inner ( eventos!inner ( data_inicio ) )
    `)
    .eq('id', inscricaoId)
    .single();

  if (error || !inscricao) throw new Error('Inscrição não encontrada.');

  if (inscricao.usuario_id !== user.id) {
    throw new Error('Esta inscrição não pertence à sua conta.');
  }

  if (['CANCELADO', 'ESTORNADO'].includes(inscricao.status_pagamento)) {
    return { success: true }; // idempotente
  }

  const lote = Array.isArray(inscricao.lotes) ? inscricao.lotes[0] : inscricao.lotes;
  const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;

  const dataEvento = evento?.data_inicio ? new Date(evento.data_inicio).getTime() : Date.now();
  const horasAteEvento = (dataEvento - Date.now()) / (1000 * 60 * 60);

  if (horasAteEvento < JANELA_CANCELAMENTO_HORAS) {
    throw new Error(
      `Cancelamentos só podem ser feitos até ${JANELA_CANCELAMENTO_HORAS}h antes do evento. Fale diretamente com o estabelecimento.`
    );
  }

  const { error: errCancelar } = await supabase
    .from('inscricoes')
    .update({ status_pagamento: 'CANCELADO' })
    .eq('id', inscricaoId);

  if (errCancelar) throw new Error(errCancelar.message);

  // Devolve a vaga pro estoque de forma atômica
  const { error: errDevolucao } = await supabase.rpc('devolver_vaga', { p_lote_id: inscricao.lote_id });
  if (errDevolucao) {
    console.error('Erro ao devolver vaga ao estoque:', errDevolucao);
  }

  return { success: true };
}

// ─── Transferência de ingresso ───────────────────────────────────────────────

export async function solicitarTransferencia(inscricaoId: string): Promise<{ token: string }> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select('id, usuario_id, status_pagamento')
    .eq('id', inscricaoId)
    .single();

  if (error || !inscricao) throw new Error('Inscrição não encontrada.');
  if (inscricao.usuario_id !== user.id) throw new Error('Esta inscrição não pertence à sua conta.');

  if (!['PAGO', 'CORTESIA'].includes(inscricao.status_pagamento)) {
    throw new Error('Só é possível transferir ingressos com pagamento confirmado.');
  }

  const token = crypto.randomUUID();

  const { error: errUpdate } = await supabase
    .from('inscricoes')
    .update({ transferencia_token: token })
    .eq('id', inscricaoId);

  if (errUpdate) throw new Error(errUpdate.message);

  return { token };
}

export async function cancelarTransferencia(inscricaoId: string) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select('usuario_id')
    .eq('id', inscricaoId)
    .single();

  if (error || !inscricao) throw new Error('Inscrição não encontrada.');
  if (inscricao.usuario_id !== user.id) throw new Error('Esta inscrição não pertence à sua conta.');

  await supabase.from('inscricoes').update({ transferencia_token: null }).eq('id', inscricaoId);
  return { success: true };
}

export interface DetalheTransferencia {
  eventoNome: string;
  eventoDataInicio: string;
  loteNome: string;
  jaEDono: boolean;
}

export async function buscarTransferencia(token: string): Promise<DetalheTransferencia> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select(`
      usuario_id,
      lotes!inner ( nome, eventos!inner ( nome, data_inicio ) )
    `)
    .eq('transferencia_token', token)
    .single();

  if (error || !inscricao) throw new Error('Link de transferência inválido ou expirado.');

  const lote = Array.isArray(inscricao.lotes) ? inscricao.lotes[0] : inscricao.lotes;
  const evento = Array.isArray(lote?.eventos) ? lote?.eventos[0] : lote?.eventos;

  return {
    eventoNome: evento?.nome ?? 'Evento removido',
    eventoDataInicio: evento?.data_inicio ?? '',
    loteNome: lote?.nome ?? '—',
    jaEDono: inscricao.usuario_id === user.id,
  };
}

export async function aceitarTransferencia(token: string) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select('id, usuario_id')
    .eq('transferencia_token', token)
    .single();

  if (error || !inscricao) throw new Error('Link de transferência inválido ou expirado.');

  if (inscricao.usuario_id === user.id) {
    throw new Error('Este ingresso já é seu.');
  }

  const { error: errTransfer } = await supabase
    .from('inscricoes')
    .update({ usuario_id: user.id, transferencia_token: null })
    .eq('id', inscricao.id);

  if (errTransfer) throw new Error(errTransfer.message);

  return { success: true };
}

// ─── Perfil ───────────────────────────────────────────────────────────────

export interface MeuPerfil {
  nome: string | null;
  avatarUrl: string | null;
  email: string;
}

export async function buscarMeuPerfil(): Promise<MeuPerfil> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('nome, avatar_url')
    .eq('id', user.id)
    .single();

  return {
    nome: profile?.nome ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    email: user.email ?? '',
  };
}

export async function atualizarPerfil(data: { nome: string; avatarUrl?: string | null }) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const supabase = getSupabaseAdmin();

  const payload: Record<string, unknown> = { nome: data.nome };
  if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;

  const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
  if (error) throw new Error(error.message);

  return { success: true };
}
