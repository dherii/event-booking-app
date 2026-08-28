// app/api/webhook/asaas/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';

// ─── Validação do token de autenticação configurado no painel Asaas ──────────
// Configurar em: Painel Asaas → Integrações → Webhooks → "Token de autenticação"
// O Asaas envia esse valor no header `asaas-access-token` em toda chamada.
function validarTokenAsaas(request: Request): boolean {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!tokenEsperado) {
    console.error('[webhook/asaas] ASAAS_WEBHOOK_TOKEN não configurado no .env — recusando por segurança.');
    return false;
  }

  const tokenRecebido = request.headers.get('asaas-access-token');
  return tokenRecebido === tokenEsperado;
}

export async function POST(request: Request) {
  if (!validarTokenAsaas(request)) {
    console.error('[webhook/asaas] Token inválido ou ausente.');
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  let payload: { event?: string; payment?: { externalReference?: string } };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  try {
    if (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED') {
      const externalReference = payload.payment?.externalReference;

      if (!externalReference) {
        return NextResponse.json({ received: true });
      }

      const supabaseAdmin = getSupabaseAdmin();

      // ── Idempotência: busca estado atual antes de escrever ──────────────
      const { data: inscricao } = await supabaseAdmin
        .from('inscricoes')
        .select('id, status_pagamento')
        .eq('id', externalReference)
        .maybeSingle();

      if (!inscricao) {
        console.error(`[webhook/asaas] Inscrição não encontrada: ${externalReference}`);
        return NextResponse.json({ received: true });
      }

      if (inscricao.status_pagamento === 'PAGO') {
        console.log(`[webhook/asaas] Inscrição ${inscricao.id} já PAGO — ignorando (idempotência).`);
        return NextResponse.json({ received: true });
      }

      const { error: updateError } = await supabaseAdmin
        .from('inscricoes')
        .update({ status_pagamento: 'PAGO' })
        .eq('id', inscricao.id);

      if (!updateError) {
        await supabaseAdmin
          .from('ingressos_validacao')
          .insert({ inscricao_id: inscricao.id, utilizado: false });
      } else {
        console.error(`[webhook/asaas] Erro ao atualizar inscrição ${inscricao.id}:`, updateError);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[webhook/asaas] Erro ao processar:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}