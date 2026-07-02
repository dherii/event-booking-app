import { supabase } from '@/src/config/supabase';
import CardEvento from '@/src/features/catalog/components/CardEvento';
import Link from 'next/link';

export const revalidate = 0;

export default async function HomePage() {
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select(`
      *,
      cursos (
        id,
        nome,
        sigla
      ),
      lotes (
        *
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Plataforma de Ingressos
            </h1>

            <p className="text-gray-400 mt-2">
              Eventos ativos na faculdade
            </p>
          </div>

          <Link
            href="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Entrar
          </Link>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            Erro: {error.message}
          </div>
        )}

        {!eventos || eventos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-500 text-lg">
              Ainda não há eventos criados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <CardEvento
                key={evento.id}
                evento={evento}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}