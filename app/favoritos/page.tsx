// app/favoritos/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { listarMeusFavoritos } from '@/src/features/catalog/actions';
import CardEvento from '@/src/features/catalog/components/CardEvento';

export const revalidate = 0;

export default async function FavoritosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/favoritos');
  }

  const favoritos = await listarMeusFavoritos();

  return (
    <main className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors">
          <ArrowLeft size={14} />
          Voltar
        </Link>

        <div>
          <h1 className="text-2xl font-black">Favoritos</h1>
          <p className="text-muted text-sm mt-1">Eventos que você salvou pra não perder.</p>
        </div>

        {favoritos.length === 0 ? (
          <div className="clubber-card flex flex-col items-center py-16 text-center border-dashed">
            <Heart size={32} className="text-muted-subtle mb-3" strokeWidth={1.3} />
            <p className="text-muted">Você ainda não favoritou nenhum evento.</p>
            <Link href="/" className="text-primary text-sm mt-2 hover:underline">
              Explorar eventos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoritos.map((evento) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <CardEvento key={(evento as any).id} evento={evento as any} favoritadoInicial />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
