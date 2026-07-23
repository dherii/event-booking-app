// src/features/admin/eventos/actions.ts
'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

interface LoteInput {
  nome: string;
  preco: number;
  quantidade: number;
  tipo: 'ingresso' | 'mesa' | 'camarote';
  capacidadePessoas?: number | null;
}

interface AtracaoInput {
  nomeArtista: string;
  horario?: string | null;
  fotoUrl?: string | null;
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
  lotes: LoteInput[];
  atracoes?: AtracaoInput[];
}

export async function criarEventoComLotes(data: EventoInput) {
  // 1. Confirma quem está logado e a que estabelecimento ele pertence
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error('Você precisa estar logado para criar um evento.');
  }

  const { data: profile, error: profileError } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Não foi possível carregar seu perfil.');
  }

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!papeisPermitidos.includes(profile.role)) {
    throw new Error('Você não tem permissão para criar eventos.');
  }

  if (!profile.estabelecimento_id) {
    throw new Error(
      'Seu usuário ainda não está vinculado a nenhum estabelecimento. Fale com o super_admin.'
    );
  }

  // 2. Insere o evento já com estabelecimento_id (não vem mais do formulário —
  //    isso evita que alguém tente criar evento pra outro estabelecimento)
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
      estabelecimento_id: profile.estabelecimento_id,
    })
    .select()
    .single();

  if (errEvento) {
    console.error('Erro ao criar evento:', errEvento);
    throw new Error(errEvento.message);
  }

  // 3. Insere os lotes — agora com tipo (ingresso/mesa/camarote) e capacidade
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
    // rollback manual — sem transação real porque são duas chamadas separadas
    await supabase.from('eventos').delete().eq('id', evento.id);
    throw new Error(errLotes.message);
  }

  // 4. Insere as atrações (line-up), se houver — etapa opcional do wizard
  const atracoesValidas = (data.atracoes ?? []).filter((a) => a.nomeArtista.trim());

  if (atracoesValidas.length > 0) {
    const atracoesParaInserir = atracoesValidas.map((a, index) => ({
      evento_id: evento.id,
      nome_artista: a.nomeArtista,
      horario: a.horario || null,
      foto_url: a.fotoUrl || null,
      ordem: index,
    }));

    const { error: errAtracoes } = await supabase.from('atracoes').insert(atracoesParaInserir);

    if (errAtracoes) {
      console.error('Erro ao criar atrações:', errAtracoes);
      // Não faz rollback do evento inteiro por causa disso — evento e lotes já
      // estão válidos, o line-up pode ser adicionado depois manualmente.
    }
  }

  return { success: true, eventoId: evento.id };
}

export async function buscarEvento(eventoId: string) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  const supabase = getSupabaseAdmin();
  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*, lotes (*)')
    .eq('id', eventoId)
    .single();

  if (error || !evento) throw new Error('Evento não encontrado.');

  // Garante que o evento pertence ao estabelecimento do usuário logado
  // (super_admin pode ver qualquer um)
  if (profile?.role !== 'super_admin' && evento.estabelecimento_id !== profile?.estabelecimento_id) {
    throw new Error('Você não tem permissão para acessar este evento.');
  }

  return evento;
}

interface LoteUpdateInput extends LoteInput {
  id: string; // lote existente sendo editado
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
  lotes: LoteUpdateInput[];
}

export async function atualizarEvento(eventoId: string, data: EventoUpdateInput) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!profile || !papeisPermitidos.includes(profile.role)) {
    throw new Error('Você não tem permissão para editar eventos.');
  }

  const supabase = getSupabaseAdmin();

  // Confirma que o evento pertence ao estabelecimento certo antes de editar
  const { data: eventoAtual, error: fetchError } = await supabase
    .from('eventos')
    .select('estabelecimento_id')
    .eq('id', eventoId)
    .single();

  if (fetchError || !eventoAtual) throw new Error('Evento não encontrado.');

  if (profile.role !== 'super_admin' && eventoAtual.estabelecimento_id !== profile.estabelecimento_id) {
    throw new Error('Você não tem permissão para editar este evento.');
  }

  // 1. Atualiza os dados gerais do evento
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
    })
    .eq('id', eventoId);

  if (errEvento) throw new Error(errEvento.message);

  // 2. Atualiza cada lote existente. Se a quantidade total mudou, ajusta a
  //    disponível pela diferença (nunca deixa ficar negativa) — assim não
  //    apaga vendas já feitas.
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

  return { success: true };
}

export async function listarEventos() {
  // Lista os eventos do estabelecimento do usuário logado (RLS também garante
  // isso no nível do banco, mas filtramos aqui também pra clareza da query)
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  const supabase = getSupabaseAdmin();
  let query = supabase.from('eventos').select('*, lotes (*)').order('data_inicio', { ascending: true });

  if (profile?.role !== 'super_admin') {
    query = query.eq('estabelecimento_id', profile?.estabelecimento_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
