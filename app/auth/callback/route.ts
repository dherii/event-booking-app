import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Pega para onde o usuário deveria ir após o login (ou manda pra home)
  const next = searchParams.get('redirect') ?? '/';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Se der erro, joga de volta pro login
  return NextResponse.redirect(`${origin}/auth/login?error=Erro_ao_conectar_com_Google`);
}