import { NextResponse }              from 'next/server';
import { getSupabaseAdmin }          from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
// import { criarCobrancaPix }          from '@/src/lib/misticpay/client';
import { criarClienteAsaas, criarCobrancaPixComSplit } from '@/src/lib/asaas/client';

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

    // ── 3. INTERCEPTAÇÃO: Validação de Perfil (Hard Wall) ─────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, cpf, telefone')
      .eq('id', user.id)
      .single();

    if (!profile?.cpf || !profile?.telefone) {
      return NextResponse.json(
        { 
          error: 'Faltam dados essenciais no seu perfil para concluir a compra.', 
          requiresProfileCompletion: true // Flag que aciona o Modal no Frontend
        },
        { status: 403 },
      );
    }

    // ── 4. Busca lote + evento ────────────────────────────────────────────────
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

    // ── 5. Idempotência — inscrição duplicada ─────────────────────────────────
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

    // ── 6. Reserva atômica de vaga ────────────────────────────────────────────
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

    // ── 7. Ingresso gratuito — emite direto sem gateway ───────────────────────
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

    // ── 8. Cria inscrição PENDENTE ────────────────────────────────────────────
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

    // ── 9. Gera cobrança Pix no Asaas ─────────────────────────────────────
const payerName = profile.nome ?? user.email ?? 'Comprador';
const payerDocument = profile.cpf.replace(/\D/g, ''); 

let cobranca;
try {
  // Cria o cliente no Asaas
  const asaasCustomerId = await criarClienteAsaas(payerName, payerDocument, user.email || '');

  // Aqui você buscaria a carteira do produtor (ex: estab.asaas_wallet_id)
  const walletProdutor = 'wal_xxxxx'; // Substitua pela lógica de buscar no banco

  // Cria a cobrança com Split
  cobranca = await criarCobrancaPixComSplit({
    customerId: asaasCustomerId,
    valor: precoBRL,
    descricao: `Ingresso - ${evento?.nome ?? lote.nome}`,
    externalReference: inscricao.id, // Envia o ID da sua inscrição para o Asaas
    carteiraOrganizadorId: walletProdutor,
  });

} catch (asaasError) {
  await supabase.rpc('devolver_vaga', { p_lote_id: loteId });
  await supabase.from('inscricoes').delete().eq('id', inscricao.id);
  console.error('[checkout] Erro no Asaas:', asaasError);
  return NextResponse.json({ error: 'Erro ao gerar cobrança.' }, { status: 502 });
}

// ── 10. Salva os dados do Pix na inscrição ────────────────────────────────
const { error: updateError } = await supabase
  .from('inscricoes')
  .update({
    txid_pix: cobranca.copyPaste,
    qr_code_base64: cobranca.qrCodeBase64,
    mp_transaction_id: cobranca.asaasPaymentId, // Mantive o mesmo nome de coluna da MisticPay para reaproveitamento[cite: 1]
  })
  .eq('id', inscricao.id);

    // ── 11. Retorna para o front redirecionar ─────────────────────────────────
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