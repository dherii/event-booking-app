// app/api/estorno/route.ts
// Estorno solicitado pelo usuário.
//
// Regras:
//   - Apenas inscrições PAGO podem ser estornadas.
//   - O evento deve começar em mais de 12h a partir de agora.
//   - Remove ingresso_validacao, invalida transferencia_token, devolve vaga.
//   - O reembolso financeiro (PIX) deve ser feito manualmente pelo admin.

import { NextResponse }              from 'next/server';
import { getSupabaseAdmin }          from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

const JANELA_ESTORNO_HORAS = 12;

export async function POST(request: Request) {
  try {
    // ── 1. Autenticação ───────────────────────────────────────────────────────
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    // ── 2. Corpo ──────────────────────────────────────────────────────────────
    let body: { inscricaoId: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 }); }

    const { inscricaoId } = body;
    if (!inscricaoId) return NextResponse.json({ error: 'inscricaoId não informado.' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // ── 3. Busca inscrição + evento ───────────────────────────────────────────
    const { data: inscricao, error: fetchError } = await supabase
      .from('inscricoes')
      .select(`
        id,
        usuario_id,
        lote_id,
        status_pagamento,
        transferencia_token,
        lotes!inner (
          preco,
          eventos!inner ( id, nome, data_inicio )
        )
      `)
      .eq('id', inscricaoId)
      .single();

    if (fetchError || !inscricao) {
      return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 });
    }

    // ── 4. Autorização ────────────────────────────────────────────────────────
    if (inscricao.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    // ── 5. Idempotência ───────────────────────────────────────────────────────
    if (['ESTORNADO', 'CANCELADO'].includes(inscricao.status_pagamento)) {
      return NextResponse.json({ success: true, message: 'Inscrição já cancelada.' });
    }

    if (inscricao.status_pagamento !== 'PAGO') {
      return NextResponse.json(
        { error: 'Apenas inscrições com pagamento confirmado podem ser estornadas.' },
        { status: 422 },
      );
    }

    // ── 6. Verifica janela de 12h ─────────────────────────────────────────────
    const lote   = Array.isArray(inscricao.lotes) ? inscricao.lotes[0] : inscricao.lotes;
    const evento = Array.isArray(lote?.eventos)   ? lote?.eventos[0]   : lote?.eventos;

    if (!evento?.data_inicio) {
      return NextResponse.json({ error: 'Dados do evento não encontrados.' }, { status: 422 });
    }

    const agora          = Date.now();
    const dataEvento     = new Date(evento.data_inicio).getTime();
    const horasAteEvento = (dataEvento - agora) / (1000 * 60 * 60);

    if (horasAteEvento < JANELA_ESTORNO_HORAS) {
      return NextResponse.json(
        {
          error: `Estorno indisponível. O evento "${evento.nome}" começa em menos de ${JANELA_ESTORNO_HORAS}h. ` +
                 `Entre em contato diretamente com o estabelecimento.`,
          horasRestantes: Math.max(0, Math.round(horasAteEvento)),
          codigo:         'FORA_DA_JANELA',
        },
        { status: 422 },
      );
    }

    // ── 7. Atualiza banco ─────────────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from('inscricoes')
      .update({
        status_pagamento:    'ESTORNADO',
        transferencia_token: null,   // invalida link de transferência pendente
      })
      .eq('id', inscricaoId);

    if (updateError) throw new Error(`Erro ao atualizar inscrição: ${updateError.message}`);

    // Remove ingresso de validação → impede check-in físico
    await supabase
      .from('ingressos_validacao')
      .delete()
      .eq('inscricao_id', inscricaoId);

    // ── 8. Devolve vaga ───────────────────────────────────────────────────────
    const { error: errDevolucao } = await supabase
      .rpc('devolver_vaga', { p_lote_id: inscricao.lote_id });

    if (errDevolucao) {
      console.error('[estorno] Erro ao devolver vaga:', errDevolucao);
    }

    console.log(`[estorno] Inscrição ${inscricaoId} estornada (saldo a devolver via admin).`);

    return NextResponse.json({
      success: true,
      message: 'Inscrição cancelada com sucesso. A plataforma realizará a devolução do valor via PIX em breve.',
    });

  } catch (error) {
    console.error('[estorno] Erro inesperado:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}