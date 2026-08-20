// app/api/webhook/misticpay/route.ts
// Recebe notificações POST da MisticPay.
//
// Eventos tratados:
//   DEPOSITO + COMPLETO  → marca inscrição PAGO + emite ingressos_validacao
//   DEPOSITO + FALHA     → marca FALHA + devolve vaga
//   MED (INFRACTION)     → bloqueia inscricao + cascata de transferência
//
// A MisticPay não envia assinatura HMAC por padrão.
// Segurança: a URL do webhook deve ser secreta (token na query string ou path).
// Exemplo: /api/webhook/misticpay?secret=MISTICPAY_WEBHOOK_SECRET
//
// Configurar em: Dashboard MisticPay → API → Credenciais → projectWebhook
//   OU passando `projectWebhook` em cada transação /transactions/create

import { NextResponse }   from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';
import type { MisticPayWebhookPayload } from '@/src/lib/misticpay/client';

// ─── Tipos do webhook MED ─────────────────────────────────────────────────────

interface MisticPayMedPayload {
  event: 'INFRACTION';
  infraction: {
    id:              number;
    status:          'WAITING_PSP' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
    amount:          number;
    type:            string;
  };
  transaction: {
    transactionId: string;   // clientTransactionId = inscricao.id
    value:         number;
    status:        string;
  };
}

type WebhookPayload = MisticPayWebhookPayload | MisticPayMedPayload;

// ─── Validação básica de secret ───────────────────────────────────────────────

function validarSecret(request: Request): boolean {
  const secret = process.env.MISTICPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Em dev sem secret configurado, loga aviso mas deixa passar
    console.warn('[webhook/misticpay] MISTICPAY_WEBHOOK_SECRET não configurado.');
    return true;
  }

  // Verifica na query string: ?secret=xxx
  const url    = new URL(request.url);
  const token  = url.searchParams.get('secret');
  return token === secret;
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!validarSecret(request)) {
    console.error('[webhook/misticpay] Token inválido na query string.');
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  console.log('[webhook/misticpay] Payload recebido:', JSON.stringify(payload));

  try {
    // ── MED (Infração) ────────────────────────────────────────────────────────
    if ('event' in payload && payload.event === 'INFRACTION') {
      await handleMed(payload as MisticPayMedPayload);
      return NextResponse.json({ received: true });
    }

    // ── Depósito (Cashin) ─────────────────────────────────────────────────────
    const dep = payload as MisticPayWebhookPayload;

    if (dep.transactionType !== 'DEPOSITO') {
      console.log(`[webhook/misticpay] Tipo ${dep.transactionType} ignorado.`);
      return NextResponse.json({ received: true });
    }

    if (dep.status === 'COMPLETO') {
      await handleDepositoCompleto(dep);
    } else if (dep.status === 'FALHA') {
      await handleDepositoFalha(dep);
    } else {
      console.log(`[webhook/misticpay] Status ${dep.status} — aguardando.`);
    }

  } catch (err) {
    console.error('[webhook/misticpay] Erro ao processar:', err);
    // 500 faz a MisticPay retentar — idempotência garantida nos handlers
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers individuais ─────────────────────────────────────────────────────

/**
 * DEPOSITO + COMPLETO
 *
 * ⚠️  A MisticPay envia `value` em CENTAVOS no webhook
 *     (ex: value=8000 = R$ 80,00).
 *
 * A correlação é feita pelo `transactionId` da MisticPay, que corresponde
 * ao `mp_transaction_id` salvo na inscrição durante o checkout.
 */
async function handleDepositoCompleto(payload: MisticPayWebhookPayload) {
  const supabase = getSupabaseAdmin();

  // Busca a inscrição pelo mp_transaction_id (retornado pela MisticPay no create)
  const { data: inscricao } = await supabase
    .from('inscricoes')
    .select('id, status_pagamento, lote_id')
    .eq('mp_transaction_id', String(payload.transactionId))
    .maybeSingle();

  if (!inscricao) {
    console.error(`[webhook/misticpay] Inscrição não encontrada. mp_transaction_id=${payload.transactionId}`);
    return;
  }

  // Idempotência
  if (inscricao.status_pagamento === 'PAGO') {
    console.log(`[webhook/misticpay] Inscrição ${inscricao.id} já PAGO — ignorando.`);
    return;
  }

  // Atualiza para PAGO
  const { error: updateError } = await supabase
    .from('inscricoes')
    .update({ status_pagamento: 'PAGO' })
    .eq('id', inscricao.id);

  if (updateError) {
    throw new Error(`Erro ao atualizar inscrição ${inscricao.id}: ${updateError.message}`);
  }

  // Emite o ingresso de validação (QR Code de check-in)
  const { error: errIngresso } = await supabase
    .from('ingressos_validacao')
    .insert({ inscricao_id: inscricao.id, utilizado: false });

  if (errIngresso) {
    console.error(`[webhook/misticpay] Erro ao emitir ingresso ${inscricao.id}:`, errIngresso);
  }

  console.log(`[webhook/misticpay] Ingresso emitido — inscrição ${inscricao.id}.`);
}

/**
 * DEPOSITO + FALHA — marca FALHA e devolve a vaga.
 */
async function handleDepositoFalha(payload: MisticPayWebhookPayload) {
  const supabase = getSupabaseAdmin();

  const { data: inscricao } = await supabase
    .from('inscricoes')
    .select('id, status_pagamento, lote_id')
    .eq('mp_transaction_id', String(payload.transactionId))
    .maybeSingle();

  if (!inscricao || inscricao.status_pagamento !== 'PENDENTE') return;

  await supabase
    .from('inscricoes')
    .update({ status_pagamento: 'FALHA' })
    .eq('id', inscricao.id);

  await supabase.rpc('devolver_vaga', { p_lote_id: inscricao.lote_id });

  console.log(`[webhook/misticpay] Inscrição ${inscricao.id} → FALHA. Vaga devolvida.`);
}

/**
 * MED (Infração) — bloqueia inscrição original + cascata de transferências.
 *
 * O `transaction.transactionId` no payload MED corresponde ao nosso
 * `inscricao.id` (passado como `transactionId` na criação da cobrança).
 */
async function handleMed(payload: MisticPayMedPayload) {
  // Apenas age em infrações criadas (WAITING_PSP) — ignora fechamentos
  if (payload.infraction.status !== 'WAITING_PSP') {
    console.log(`[webhook/misticpay] MED status=${payload.infraction.status} — ignorado.`);
    return;
  }

  const supabase = getSupabaseAdmin();
  const inscricaoId = payload.transaction.transactionId;

  // Busca a inscrição original
  const { data: inscricaoOriginal } = await supabase
    .from('inscricoes')
    .select('id, lote_id, status_pagamento, transferencia_token')
    .eq('id', inscricaoId)
    .maybeSingle();

  if (!inscricaoOriginal) {
    console.error(`[webhook/misticpay] MED: inscrição ${inscricaoId} não encontrada.`);
    return;
  }

  // ── Bloqueia inscrição original ───────────────────────────────────────────
  await supabase
    .from('inscricoes')
    .update({
      status_pagamento:    'BLOQUEADO_CHARGEBACK',
      transferencia_token: null,
    })
    .eq('id', inscricaoOriginal.id);

  await supabase
    .from('ingressos_validacao')
    .delete()
    .eq('inscricao_id', inscricaoOriginal.id);

  console.log(`[webhook/misticpay] MED: inscrição original ${inscricaoOriginal.id} bloqueada.`);

  // ── Cascata: bloqueia cópia transferida ───────────────────────────────────
  const { data: copiaTransferida } = await supabase
    .from('inscricoes')
    .select('id')
    .eq('transferencia_origem_id', inscricaoOriginal.id)
    .maybeSingle();

  if (copiaTransferida) {
    await supabase
      .from('inscricoes')
      .update({ status_pagamento: 'BLOQUEADO_CHARGEBACK' })
      .eq('id', copiaTransferida.id);

    await supabase
      .from('ingressos_validacao')
      .delete()
      .eq('inscricao_id', copiaTransferida.id);

    console.log(`[webhook/misticpay] MED cascata: cópia ${copiaTransferida.id} bloqueada.`);
  }

  // Devolve a vaga
  await supabase.rpc('devolver_vaga', { p_lote_id: inscricaoOriginal.lote_id });
}