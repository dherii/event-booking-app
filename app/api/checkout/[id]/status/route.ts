// app/api/checkout/[id]/status/route.ts
// Endpoint leve de polling para a página /checkout/[id] verificar se o
// pagamento foi confirmado. Retorna apenas os campos necessários para a UI.
//
// Não chama a API MisticPay diretamente — confia no webhook para atualizar
// o banco. O front faz polling aqui a cada 5s.

import { NextResponse }              from 'next/server';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }, // <-- 1. Tipando como Promise
) {
  try {
    const { id } = await params; // <-- 2. Aguardando e extraindo o ID

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { data: inscricao, error } = await supabase
      .from('inscricoes')
      .select(`
        id,
        status_pagamento,
        txid_pix,
        qr_code_base64,
        lotes!inner ( preco, eventos!inner ( nome ) )
      `)
      .eq('id', id) // <-- 3. Usando o ID extraído
      .eq('usuario_id', user.id)   // garante que só o dono vê
      .single();

    if (error || !inscricao) {
      return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(inscricao);
  } catch (err) {
    console.error('[checkout/status] Erro:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}