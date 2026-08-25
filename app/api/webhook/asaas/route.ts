// app/api/webhook/asaas/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Eventos de confirmação de pagamento do Asaas
    if (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED') {
      const externalReference = payload.payment?.externalReference; // ID da inscrição

      if (externalReference) {
        const supabaseAdmin = getSupabaseAdmin();

        const { error: updateError } = await supabaseAdmin
          .from('inscricoes')
          .update({ status_pagamento: 'PAGO' })
          .eq('id', externalReference);

        if (!updateError) {
          await supabaseAdmin
            .from('ingressos_validacao')
            .insert({ inscricao_id: externalReference, utilizado: false });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[webhook/asaas] Erro ao processar:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}