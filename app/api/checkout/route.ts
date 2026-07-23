import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export async function POST(request: Request) {
  try {
    // 1. Descobre quem está logado a partir da sessão (cookies) — nunca
    //    confiamos num usuarioId vindo do corpo da requisição, porque
    //    qualquer client poderia mandar o UUID de outra pessoa.
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para comprar um ingresso.', requiresLogin: true },
        { status: 401 },
      );
    }

    const { loteId } = await request.json();

    if (!loteId) {
      return NextResponse.json({ error: 'Lote não informado.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Regra de negócio do planejamento: 1 ingresso por CPF/pessoa por evento.
    // Verificação simples por enquanto — checa se esse usuário já tem uma
    // inscrição pendente ou paga pra esse mesmo lote. Feita ANTES de reservar
    // a vaga, pra não gastar estoque à toa se essa checagem já for barrar.
    const { data: inscricaoExistente } = await supabaseAdmin
      .from('inscricoes')
      .select('id, status_pagamento')
      .eq('usuario_id', user.id)
      .eq('lote_id', loteId)
      .in('status_pagamento', ['PENDENTE', 'PAGO'])
      .maybeSingle();

    if (inscricaoExistente) {
      return NextResponse.json(
        { error: 'Você já tem uma inscrição para este lote.' },
        { status: 400 },
      );
    }

    // 2. Reserva a vaga de forma ATÔMICA — a checagem "tem vaga?" e o
    //    decremento acontecem num único UPDATE dentro do banco, sem brecha
    //    de tempo entre eles. Mesmo com dois compradores simultâneos
    //    disputando a última vaga, o Postgres garante que só um consegue.
    const { data: reserva, error: reservaError } = await supabaseAdmin
      .rpc('reservar_vaga', { p_lote_id: loteId })
      .single();

    if (reservaError) {
      console.error('Erro ao reservar vaga:', reservaError);
      return NextResponse.json({ error: 'Erro ao reservar seu ingresso.' }, { status: 500 });
    }

    const resultado = reserva as { sucesso: boolean; preco: number | null };

    if (!resultado.sucesso) {
      return NextResponse.json({ error: 'Ingressos esgotados para este lote!' }, { status: 400 });
    }

    const txidFake = `txid_simulado_${Math.random().toString(36).substring(2, 15)}`;

    const { data: inscricao, error: inscricaoError } = await supabaseAdmin
      .from('inscricoes')
      .insert({
        usuario_id: user.id,
        lote_id: loteId,
        status_pagamento: 'PENDENTE',
        txid_pix: txidFake,
      })
      .select()
      .single();

    if (inscricaoError) {
      // rollback: devolve a vaga que reservamos, já que a inscrição falhou
      await supabaseAdmin.rpc('devolver_vaga', { p_lote_id: loteId });

      return NextResponse.json({ error: 'Erro ao gerar pedido de inscrição.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inscricaoId: inscricao.id,
      txid: txidFake,
      message: 'Reserva garantida! Aguardando pagamento por Pix.',
    }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
