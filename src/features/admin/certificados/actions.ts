'use server';

import { getSupabaseAdmin } from '@/src/config/supabase';
import { exigirDonoOuAdmin } from '@/src/features/admin/configuracoes/actions';

// Busca todos os eventos reais do produtor
export async function listarEventosParaCertificados() {
  const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('eventos')
    .select('id, nome, data_inicio, dias, emite_certificado, carga_horaria_certificado, regra_emissao_certificado, percentual_presenca_minima, dias_liberacao_pos_evento')
    .order('data_inicio', { ascending: false });

  if (!isGlobal && estabelecimentoId) {
    query = query.eq('estabelecimento_id', estabelecimentoId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data.map(ev => ({
    id: ev.id,
    nome: ev.nome,
    diasEvento: ev.dias || 1,
    emiteCertificado: ev.emite_certificado || false,
    cargaHoraria: ev.carga_horaria_certificado || 0,
    regraEmissao: ev.regra_emissao_certificado || 'apenas_compra',
    percentualPresenca: ev.percentual_presenca_minima || 75,
    diasLiberacao: ev.dias_liberacao_pos_evento || 0,
  }));
}

// Salva as configurações de um evento específico
export async function salvarRegrasCertificado(eventoId: string, regras: any) {
  const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();
  if (isGlobal) throw new Error('Selecione um estabelecimento específico para salvar regras.');

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('eventos')
    .update({
      emite_certificado: regras.emiteCertificado,
      carga_horaria_certificado: regras.cargaHoraria,
      regra_emissao_certificado: regras.regraEmissao,
      percentual_presenca_minima: regras.percentualPresenca,
      dias_liberacao_pos_evento: regras.diasLiberacao,
    })
    .eq('id', eventoId)
    .eq('estabelecimento_id', estabelecimentoId); // Proteção de segurança

  if (error) throw new Error(error.message);

  return { success: true };
}