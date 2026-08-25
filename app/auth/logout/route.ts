// app/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  
  // Encerra a sessão no Supabase (limpa os cookies de autenticação do servidor)
  await supabase.auth.signOut();

  // Redireciona para a página inicial (vitrine)
  return NextResponse.redirect(new URL('/', request.url), {
    status: 303,
  });
}