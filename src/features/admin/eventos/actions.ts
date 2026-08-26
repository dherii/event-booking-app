// src/features/admin/eventos/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

interface LoteInput {
  nome: string;
  preco: number;
  quantidade: number;
  tipo: 'ingresso' | 'mesa' | 'camarote';
  capacidadePessoas?: number | null;
}

interface AtividadeInput {
  nomeArtista: string; // Título da Atividade / Oficina
  horario?: string | null;
  fotoUrl?: string | null;
  localSala?: string | null;
  vagasTotais?: number | null;
  descricao?: string | null;
}

interface EventoInput {
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local?: string;
  modalidade?: string;
  categoria?: string;
  classificacaoEtaria?: number;
  bannerUrl?: string | null;
  latitude?: number | null;  // <-- Adicionado
  longitude?: number | null; // <-- Adicionado
  lotes: LoteInput[];
  atracoes?: AtividadeInput[];
}

// ─── Helper interno para pegar o estabelecimento ativo ou global ───
async function getEstabelecimentoAtivo() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error('Você precisa estar logado.');
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

export async function criarEventoComLotes(data: EventoInput) {
  const { role, estabelecimentoId, isGlobal } = await getEstabelecimentoAtivo();

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!papeisPermitidos.includes(role)) {
    throw new Error('Você não tem permissão para criar eventos.');
  }

  if (isGlobal) {
    throw new Error('Selecione um estabelecimento específico para criar um evento (o modo global exibe dados somados).');
  }

  const supabase = getSupabaseAdmin();

  const { data: evento, error: errEvento } = await supabase
    .from('eventos')
    .insert({
      nome: data.nome,
      descricao: data.descricao,
      data_inicio: data.dataInicio,
      data_fim: data.dataFim,
      local: data.local,
      modalidade: data.modalidade,
      categoria: data.categoria,
      classificacao_etaria: data.classificacaoEtaria ?? 18,
      banner_url: data.bannerUrl ?? null,
      latitude: data.latitude ?? null,   // <-- Salvando latitude
      longitude: data.longitude ?? null, // <-- Salvando longitude
      estabelecimento_id: estabelecimentoId ?? null,
    })
    .select()
    .single();

  if (errEvento) {
    console.error('Erro ao criar evento:', errEvento);
    throw new Error(errEvento.message);
  }

  const lotesParaInserir = data.lotes.map((l) => ({
    evento_id: evento.id,
    nome: l.nome,
    preco: l.preco,
    quantidade_total: l.quantidade,
    quantidade_disponivel: l.quantidade,
    tipo: l.tipo,
    capacidade_pessoas: l.tipo === 'ingresso' ? null : (l.capacidadePessoas ?? null),
  }));

  const { error: errLotes } = await supabase.from('lotes').insert(lotesParaInserir);

  if (errLotes) {
    console.error('Erro ao criar lotes:', errLotes);
    await supabase.from('eventos').delete().eq('id', evento.id);
    throw new Error(errLotes.message);
  }

  const atividadesValidas = (data.atracoes ?? []).filter((a) => a.nomeArtista.trim());

  if (atividadesValidas.length > 0) {
    const atividadesParaInserir = atividadesValidas.map((a) => {
      const vagas = a.vagasTotais && a.vagasTotais > 0 ? a.vagasTotais : 60;
      return {
        evento_id: evento.id,
        titulo: a.nomeArtista,
        descricao: a.descricao || null,
        local_sala: a.localSala || null,
        data_horario: a.horario || data.dataInicio,
        vagas_totais: vagas,
        vagas_disponiveis: vagas,
      };
    });

    const { error: errAtividades } = await supabase
      .from('atividades')
      .insert(atividadesParaInserir);

    if (errAtividades) {
      console.error('Erro ao criar atividades do evento:', errAtividades);
    }
  }

  revalidatePath('/admin/eventos');
  revalidatePath('/');

  return { success: true, eventoId: evento.id };
}

export async function deletarEvento(eventoId: string) {
  const { role, estabelecimentoId } = await getEstabelecimentoAtivo();

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento'];
  if (!papeisPermitidos.includes(role)) {
    throw new Error('Você não tem permissão para deletar eventos.');
  }

  const supabase = getSupabaseAdmin();

  const { data: evento, error: fetchError } = await supabase
    .from('eventos')
    .select('estabelecimento_id')
    .eq('id', eventoId)
    .single();

  if (fetchError || !evento) throw new Error('Evento não encontrado.');

  if (
    role !== 'super_admin' &&
    evento.estabelecimento_id &&
    evento.estabelecimento_id !== estabelecimentoId
  ) {
    throw new Error('Você não tem permissão para deletar este evento.');
  }

  const { error: deleteError } = await supabase
    .from('eventos')
    .delete()
    .eq('id', eventoId);

  if (deleteError) {
    throw new Error(`Erro ao deletar evento: ${deleteError.message}`);
  }

  revalidatePath('/admin/eventos');
  revalidatePath('/');

  return { success: true };
}

export async function buscarEvento(eventoId: string) {
  const { role, estabelecimentoId } = await getEstabelecimentoAtivo();

  const supabase = getSupabaseAdmin();
  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*, lotes (*), atividades (*)')
    .eq('id', eventoId)
    .single();

  if (error || !evento) throw new Error('Evento não encontrado.');

  if (
    role !== 'super_admin' &&
    evento.estabelecimento_id &&
    evento.estabelecimento_id !== estabelecimentoId
  ) {
    throw new Error('Você não tem permissão para acessar este evento.');
  }

  return evento;
}

interface LoteUpdateInput extends LoteInput {
  id: string;
}

interface EventoUpdateInput {
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local?: string;
  modalidade?: string;
  categoria?: string;
  classificacaoEtaria?: number;
  latitude?: number | null;  // <-- Adicionado
  longitude?: number | null; // <-- Adicionado
  lotes: LoteUpdateInput[];
}

export async function atualizarEvento(eventoId: string, data: EventoUpdateInput) {
  const { role, estabelecimentoId } = await getEstabelecimentoAtivo();

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!papeisPermitidos.includes(role)) {
    throw new Error('Você não tem permissão para editar eventos.');
  }

  const supabase = getSupabaseAdmin();

  const { data: eventoAtual, error: fetchError } = await supabase
    .from('eventos')
    .select('estabelecimento_id')
    .eq('id', eventoId)
    .single();

  if (fetchError || !eventoAtual) throw new Error('Evento não encontrado.');

  if (
    role !== 'super_admin' &&
    eventoAtual.estabelecimento_id &&
    eventoAtual.estabelecimento_id !== estabelecimentoId
  ) {
    throw new Error('Você não tem permissão para editar este evento.');
  }

  const { error: errEvento } = await supabase
    .from('eventos')
    .update({
      nome: data.nome,
      descricao: data.descricao,
      data_inicio: data.dataInicio,
      data_fim: data.dataFim,
      local: data.local,
      modalidade: data.modalidade,
      categoria: data.categoria,
      classificacao_etaria: data.classificacaoEtaria ?? 18,
      latitude: data.latitude ?? null,   // <-- Atualizando latitude
      longitude: data.longitude ?? null, // <-- Atualizando longitude
    })
    .eq('id', eventoId);

  if (errEvento) throw new Error(errEvento.message);

  for (const lote of data.lotes) {
    const { data: loteAtual } = await supabase
      .from('lotes')
      .select('quantidade_total, quantidade_disponivel')
      .eq('id', lote.id)
      .single();

    if (!loteAtual) continue;

    const delta = lote.quantidade - loteAtual.quantidade_total;
    const novaDisponivel = Math.max(0, loteAtual.quantidade_disponivel + delta);

    const { error: errLote } = await supabase
      .from('lotes')
      .update({
        nome: lote.nome,
        preco: lote.preco,
        tipo: lote.tipo,
        capacidade_pessoas: lote.tipo === 'ingresso' ? null : (lote.capacidadePessoas ?? null),
        quantidade_total: lote.quantidade,
        quantidade_disponivel: novaDisponivel,
      })
      .eq('id', lote.id);

    if (errLote) throw new Error(errLote.message);
  }

  revalidatePath('/admin/eventos');
  revalidatePath('/');

  return { success: true };
}

export async function listarEventos() {
  const { estabelecimentoId, isGlobal } = await getEstabelecimentoAtivo();

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('eventos')
    .select('*, lotes (*), atividades (*)')
    .order('data_inicio', { ascending: true });

  if (!isGlobal && estabelecimentoId) {
    query = query.eq('estabelecimento_id', estabelecimentoId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}