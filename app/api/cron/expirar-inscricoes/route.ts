// app/api/cron/expirar-inscricoes/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';

const MINUTOS_EXPIRACAO = 20;

export async function GET(request: Request) {
  // Protege o endpoint — só o Vercel Cron (ou você, manualmente) deve chamar isso
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const limite = new Date(Date.now() - MINUTOS_EXPIRACAO * 60 * 1000).toISOString();

  const { data: pendentes, error } = await supabase
    .from('inscricoes')
    .select('id, lote_id')
    .eq('status_pagamento', 'PENDENTE')
    .lt('created_at', limite);

  if (error) {
    console.error('[cron/expirar] Erro ao buscar pendentes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!pendentes || pendentes.length === 0) {
    return NextResponse.json({ expiradas: 0 });
  }

  for (const insc of pendentes) {
    await supabase.from('inscricoes').update({ status_pagamento: 'EXPIRADO' }).eq('id', insc.id);
    await supabase.rpc('devolver_vaga', { p_lote_id: insc.lote_id });
  }

  console.log(`[cron/expirar] ${pendentes.length} inscrição(ões) expirada(s).`);
  return NextResponse.json({ expiradas: pendentes.length });
}