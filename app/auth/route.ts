import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session) {
      // 1. Busca o perfil do usuário para saber a ROLE dele
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // 2. Lógica de Redirecionamento Inteligente
      // Se for dono_estabelecimento, enviamos para o onboarding/dashboard
      if (profile?.role === 'dono_estabelecimento') {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      
      // Caso contrário, manda para a home (ou onde o cliente deve ir)
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Erro_ao_autenticar`);
}