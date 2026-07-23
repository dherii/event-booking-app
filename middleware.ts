// middleware.ts (raiz do projeto, mesmo nível de app/)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Confere o papel do usuário — só dono/staff/super_admin entram no admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, estabelecimento_id')
      .eq('id', user.id)
      .single();

    const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
    if (!profile || !papeisPermitidos.includes(profile.role)) {
      // Cliente comum sem estabelecimento — oferece o onboarding em vez de
      // só bloquear, já que pode ser alguém querendo cadastrar o negócio dele
      if (profile && !profile.estabelecimento_id) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
