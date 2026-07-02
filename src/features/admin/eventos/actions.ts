'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';

interface LoteInput {
  nome: string;
  preco: number;
  quantidade: number;
}

interface EventoInput {
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  curso_id: string; 
  lotes: LoteInput[];
}

export async function criarEventoComLotes(data: EventoInput) {
  const supabase = getSupabaseAdmin();
  
  const { data: evento, error: errEvento } = await supabase
    .from('eventos')
    .insert({
      nome: data.nome,
      descricao: data.descricao,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim,
      curso_id: data.curso_id
    })
    .select()
    .single();

  if (errEvento) {
    console.error("Erro ao criar evento:", errEvento);
    throw new Error(errEvento.message);
  }

  const lotesParaInserir = data.lotes.map((l) => ({
    evento_id: evento.id, 
    nome: l.nome,
    preco: l.preco,
    quantidade_total: l.quantidade,
    quantidade_disponivel: l.quantidade,
  }));

  const { error: errLotes } = await supabase
    .from('lotes')
    .insert(lotesParaInserir);

  if (errLotes) {
    console.error("Erro ao criar lotes:", errLotes);
    throw new Error(errLotes.message);
  }

  return { success: true, eventoId: evento.id };
}
export async function listarEventos() {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      *,
      lotes (*)
    `)
    .order('data_inicio', { ascending: true });

  if (error) throw error;
  return data;
}