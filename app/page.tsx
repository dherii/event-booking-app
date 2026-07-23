import { supabase } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { CatalogoClient } from '@/src/features/catalog/components/CatalogoClient';
import { SiteHeader } from '@/src/features/catalog/components/SiteHeader';
import { Ticket } from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  const supabaseAuth = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  let temPainelAdmin = false;

  if (user) {
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    temPainelAdmin =
      !!profile &&
      ['super_admin', 'dono_estabelecimento', 'staff_checkin'].includes(profile.role);
  }

  const { data: eventos, error } = await supabase
    .from('eventos')
    .select(`
      *,
      estabelecimentos ( id, nome, slug, logo_url ),
      lotes ( * )
    `)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader isLoggedIn={!!user} temPainelAdmin={temPainelAdmin} />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Glow decorativo */}
        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-72 w-72 rounded-full bg-accent-purple/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-40 -z-10 h-64 w-64 rounded-full bg-accent-pink/5 blur-3xl" />

        {error && (
          <div className="mb-6 rounded-xl border border-error-fg/20 bg-error-bg p-4 text-sm text-error-fg">
            Erro ao carregar os eventos: {error.message}
          </div>
        )}

        {!eventos || eventos.length === 0 ? (
          <div className="clubber-card flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-dashed text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-purple/10 text-accent-purple">
              <Ticket size={26} />
            </div>
            <p className="text-lg font-semibold text-foreground">Ainda não há eventos criados.</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              Em breve você encontrará aqui as melhores festas, eventos universitários, pubs e experiências da sua cidade.
            </p>
          </div>
        ) : (
          <CatalogoClient eventos={eventos} />
        )}
      </div>
    </main>
  );
}
