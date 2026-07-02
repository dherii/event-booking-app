import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';

export async function POST(request: Request) {
  try {
    const { loteId, usuarioId } = await request.json();

    if (!loteId || !usuarioId) {
      return NextResponse.json({ error: 'Dados incompletos para a compra.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    
    const { data: lote, error: loteError } = await supabaseAdmin
      .from('lotes')
      .select('quantidade_disponivel, preco')
      .eq('id', loteId)
      .single();

    if (loteError || !lote) {
      return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 });
    }

    if (lote.quantidade_disponivel <= 0) {
      return NextResponse.json({ error: 'Ingressos esgotados para este lote!' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('lotes')
      .update({ quantidade_disponivel: lote.quantidade_disponivel - 1 })
      .eq('id', loteId);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao reservar seu ingresso.' }, { status: 500 });
    }

    
    const txidFake = `txid_simulado_${Math.random().toString(36).substring(2, 15)}`;

    const { data: inscricao, error: inscricaoError } = await supabaseAdmin
      .from('inscricoes')
      .insert({
        usuario_id: usuarioId, 
        lote_id: loteId,
        status_pagamento: 'PENDENTE',
        txid_pix: txidFake
      })
      .select()
      .single();

    if (inscricaoError) {
      return NextResponse.json({ error: 'Erro ao gerar pedido de inscrição.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inscricaoId: inscricao.id,
      txid: txidFake,
      message: 'Reserva garantida! Aguardando pagamento por Pix.'
    }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}