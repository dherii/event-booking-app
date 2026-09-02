import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { CatalogoClient } from '@/src/features/catalog/components/CatalogoClient';
import { SiteHeader } from '@/src/features/catalog/components/SiteHeader';
import { listarMeusFavoritosIds } from '@/src/features/catalog/actions';
import { BannerCarrossel } from '@/src/features/public/components/BannerCarrossel';
import { Ticket } from 'lucide-react';

export default async function HomePage() {
  const supabaseAuth = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  let temPainelAdmin = false;
  let userNome: string | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role, nome, avatar_url')
      .eq('id', user.id)
      .single();

    temPainelAdmin =
      !!profile &&
      ['super_admin', 'dono_estabelecimento', 'staff_checkin'].includes(profile.role);

    userNome = profile?.nome ?? user.email ?? null;
    avatarUrl = profile?.avatar_url ?? null;
  }

  // Filtra apenas eventos cuja data de fim é maior ou igual ao momento atual
  const agoraIso = new Date().toISOString();

  const { data: eventos, error } = await supabaseAuth
    .from('eventos')
    .select(`
      *,
      estabelecimentos ( id, nome, slug, logo_url ),
      lotes ( * )
    `)
    .gte('data_fim', agoraIso)
    .order('data_inicio', { ascending: true });

  const favoritosIds = user ? await listarMeusFavoritosIds() : [];

  // Formata os eventos para o padrão que o BannerCarrossel espera
  const eventosBanners = (eventos || []).slice(0, 5).map((evento) => ({
    id: evento.id,
    titulo: evento.titulo,
    bannerUrl: evento.banner_url || '/placeholder-banner.jpg', 
    data: new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    local: evento.local || evento.estabelecimentos?.nome || 'Local a definir',
    linkHref: `/eventos/${evento.id}`,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground bg-grid-pattern relative overflow-x-hidden">
      {/* Elementos de luz difusa ambiental para profundidade visual */}
      <div className="ambient-glow left-10 top-20" />
      <div className="ambient-glow right-10 top-96" />

      <Suspense fallback={<div className="h-16 border-b border-border bg-background/50 backdrop-blur-md" />}>
        <SiteHeader
          isLoggedIn={!!user}
          temPainelAdmin={temPainelAdmin}
          userNome={userNome}
          avatarUrl={avatarUrl}
        />
      </Suspense>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-10">
        
        {error && (
          <div className="mb-6 rounded-2xl border border-error-fg/20 bg-error-bg p-4 text-sm text-error-fg shadow-sm">
            Erro ao carregar os eventos: {error.message}
          </div>
        )}

        {/* Bloco de Destaque / Carrossel — o título "Destaques da Semana" agora
            está embutido como selo dentro do próprio banner */}
        {eventosBanners.length > 0 && (
          <BannerCarrossel eventos={eventosBanners} />
        )}

        {!eventos || eventos.length === 0 ? (
          <div className="glass-card-premium flex min-h-[420px] flex-col items-center justify-center rounded-3xl border-dashed text-center p-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Ticket size={30} />
            </div>
            <p className="text-xl font-bold text-foreground">Ainda não há eventos disponíveis.</p>
            <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
              Em breve, você encontrará aqui os melhores eventos acadêmicos, universitários e experiências exclusivas da sua região.
            </p>
          </div>
        ) : (
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <CatalogoClient eventos={eventos} favoritosIds={favoritosIds} />
          </Suspense>
        )}
      </div>
    </main>
  );
}