// app/api/checkout/route.ts
// Fluxo de checkout via MisticPay (Pix):
//   1. Autentica o usuário
//   2. Valida e busca o lote
//   3. Checa inscrição duplicada
//   4. Reserva vaga atomicamente (RPC reservar_vaga)
//   5. Cria inscrição PENDENTE
//   6. Chama MisticPay para gerar QR Code Pix
//   7. Salva txid_pix (copyPaste) + qr_code_base64 na inscrição
//   8. Retorna inscricaoId para o front redirecionar para /checkout/[id]

import { NextResponse }              from 'next/server';
import { getSupabaseAdmin }          from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { criarCobrancaPix }          from '@/src/lib/misticpay/client';

interface CheckoutBody {
  loteId: string;
}

export async function POST(request: Request) {
  try {
    // ── 1. Autenticação ───────────────────────────────────────────────────────
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para comprar um ingresso.', requiresLogin: true },
        { status: 401 },
      );
    }

    // ── 2. Valida corpo ───────────────────────────────────────────────────────
    let body: CheckoutBody;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

    const { loteId } = body;
    if (!loteId) return NextResponse.json({ error: 'Lote não informado.' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // ── 3. Busca lote + evento ────────────────────────────────────────────────
    const { data: lote, error: loteError } = await supabase
      .from('lotes')
      .select(`
        id, nome, tipo, preco,
        eventos!inner ( id, nome, data_inicio )
      `)
      .eq('id', loteId)
      .single();

    if (loteError || !lote) {
      return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 });
    }

    const evento = Array.isArray(lote.eventos) ? lote.eventos[0] : lote.eventos;

    // ── 4. Idempotência — inscrição duplicada ─────────────────────────────────
    const { data: inscricaoExistente } = await supabase
      .from('inscricoes')
      .select('id, status_pagamento')
      .eq('usuario_id', user.id)
      .eq('lote_id', loteId)
      .in('status_pagamento', ['PENDENTE', 'PAGO'])
      .maybeSingle();

    if (inscricaoExistente) {
      return NextResponse.json(
        { error: 'Você já tem uma inscrição ativa para este lote.' },
        { status: 400 },
      );
    }

    // ── 5. Reserva atômica de vaga ────────────────────────────────────────────
    const { data: reserva, error: reservaError } = await supabase
      .rpc('reservar_vaga', { p_lote_id: loteId })
      .single();

    if (reservaError) {
      console.error('[checkout] Erro ao reservar vaga:', reservaError);
      return NextResponse.json({ error: 'Erro ao reservar ingresso.' }, { status: 500 });
    }

    const resultado = reserva as { sucesso: boolean; preco: number | null };

    if (!resultado.sucesso) {
      return NextResponse.json({ error: 'Ingressos esgotados para este lote!' }, { status: 400 });
    }

    const precoBRL = Number(resultado.preco ?? lote.preco ?? 0);

    // ── 6. Ingresso gratuito — emite direto sem gateway ───────────────────────
    if (precoBRL === 0) {
      const { data: inscGratis, error: errGratis } = await supabase
        .from('inscricoes')
        .insert({ usuario_id: user.id, lote_id: loteId, status_pagamento: 'PAGO' })
        .select()
        .single();

      if (errGratis || !inscGratis) {
        await supabase.rpc('devolver_vaga', { p_lote_id: loteId });
        return NextResponse.json({ error: 'Erro ao criar inscrição gratuita.' }, { status: 500 });
      }

      await supabase
        .from('ingressos_validacao')
        .insert({ inscricao_id: inscGratis.id, utilizado: false });

      return NextResponse.json({
        success:     true,
        gratuito:    true,
        inscricaoId: inscGratis.id,
      }, { status: 201 });
    }

    // ── 7. Cria inscrição PENDENTE ────────────────────────────────────────────
    const { data: inscricao, error: inscricaoError } = await supabase
      .from('inscricoes')
      .insert({ usuario_id: user.id, lote_id: loteId, status_pagamento: 'PENDENTE' })
      .select()
      .single();

    if (inscricaoError || !inscricao) {
      await supabase.rpc('devolver_vaga', { p_lote_id: loteId });
      console.error('[checkout] Erro ao criar inscrição:', inscricaoError);
      return NextResponse.json({ error: 'Erro ao gerar pedido de inscrição.' }, { status: 500 });
    }

    // ── 8. Gera cobrança Pix na MisticPay ─────────────────────────────────────
    // Busca nome/email do perfil para payerName
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, cpf')
      .eq('id', user.id)
      .maybeSingle();

    const payerName     = profile?.nome ?? user.email ?? 'Comprador';
    // CPF sem formatação; fallback temporário se não cadastrado
    const payerDocument = profile?.cpf?.replace(/\D/g, '') || '00000000000';

    let cobranca;
    try {
      cobranca = await criarCobrancaPix({
        amount:        precoBRL,
        payerName,
        payerDocument,
        transactionId: inscricao.id,   // nosso UUID como ID externo
        description:   `Ingresso - ${evento?.nome ?? lote.nome}`,
      });
    } catch (misticError) {
      // Reverte reserva e inscrição se o gateway falhou
      await supabase.rpc('devolver_vaga', { p_lote_id: loteId });
      await supabase.from('inscricoes').delete().eq('id', inscricao.id);

      console.error('[checkout] Erro na MisticPay:', misticError);
      const msg = misticError instanceof Error ? misticError.message : 'Erro ao gerar cobrança Pix.';
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    // ── 9. Salva os dados do Pix na inscrição ─────────────────────────────────
    // txid_pix = copyPaste (código copia e cola para exibir ao usuário)
    // qr_code_base64 = imagem do QR Code para renderizar no front
    // mp_transaction_id = ID retornado pela MisticPay para correlação no webhook
    const { error: updateError } = await supabase
      .from('inscricoes')
      .update({
        txid_pix:          cobranca.copyPaste,
        qr_code_base64:    cobranca.qrCodeBase64,
        mp_transaction_id: cobranca.mpTransactionId,
      })
      .eq('id', inscricao.id);

    if (updateError) {
      // Não falha o checkout — o usuário já tem o QR Code em memória
      console.error('[checkout] Erro ao salvar dados do Pix:', updateError);
    }

    // ── 10. Retorna para o front redirecionar para /checkout/[id] ─────────────
    return NextResponse.json({
      success:      true,
      inscricaoId:  inscricao.id,
    }, { status: 201 });

  } catch (error) {
    console.error('[checkout] Erro inesperado:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}