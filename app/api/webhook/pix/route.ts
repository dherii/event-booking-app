import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { txid, status } = body; 

    const supabaseAdmin = getSupabaseAdmin();

    if (status === 'CONCLUIDO' || status === 'RECEIVED') {
      const { data: inscricao, error: fetchError } = await supabaseAdmin
        .from('inscricoes')
        .select('id, status_pagamento')
        .eq('txid_pix', txid)
        .single();

      if (fetchError || !inscricao) {
        return NextResponse.json({ error: 'Transação não encontrada.' }, { status: 404 });
      }

      if (inscricao.status_pagamento === 'PAGO') {
        return NextResponse.json({ message: 'Pagamento já processado.' }, { status: 200 });
      }

      await supabaseAdmin
        .from('inscricoes')
        .update({ status_pagamento: 'PAGO' })
        .eq('id', inscricao.id);

      await supabaseAdmin
        .from('ingressos_validacao')
        .insert({
          inscricao_id: inscricao.id,
          utilizado: false
        });

      return NextResponse.json({ message: 'Ingresso liberado com sucesso!' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Status ignorado.' }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}