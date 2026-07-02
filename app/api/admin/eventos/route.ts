import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/config/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, descricao, siglaCurso, preco, vagas } = body;

    if (!nome || preco === undefined || vagas === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const precoNum = parseFloat(preco);
    const vagasNum = parseInt(vagas, 10);

    if (isNaN(precoNum) || isNaN(vagasNum)) {
      return NextResponse.json({ error: 'Preço ou vagas inválidos.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: evento, error: errorEvento } = await supabaseAdmin
      .from('eventos')
      .insert({
        nome,
        descricao,
        sigla_curso: siglaCurso,
      })
      .select()
      .single();

    if (errorEvento || !evento) {
      return NextResponse.json({ error: `Erro ao criar evento: ${errorEvento?.message}` }, { status: 500 });
    }

    // 2. Insere o Lote na tabela 'lotes'
    const { error: errorLote } = await supabaseAdmin
      .from('lotes')
      .insert({
        evento_id: evento.id,
        nome: 'Lote Único',
        preco: precoNum,
        vagas_totais: vagasNum,
        vagas_restantes: vagasNum,
      });

    
    if (errorLote) {
      await supabaseAdmin.from('eventos').delete().eq('id', evento.id);
      return NextResponse.json({ error: `Erro ao criar lote: ${errorLote.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, eventoId: evento.id });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}