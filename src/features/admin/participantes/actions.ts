'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';

export async function getParticipantesData() {
  const supabase = getSupabaseAdmin();

  // Buscamos as inscrições cruzando com lotes, eventos e usuários
  const { data, error } = await supabase
    .from('inscricoes')
    .select(`
      id,
      status_pagamento,
      txid_pix,
      created_at,
      lotes (
        nome,
        preco,
        eventos (nome)
      ),
      -- Supondo que você tenha uma tabela de usuarios ou campos de nome/email na inscricao
      nome, 
      email 
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar participantes:", error);
    return [];
  }

  return data || [];
}