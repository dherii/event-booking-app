// app/minhas-inscricoes/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { listarMinhasInscricoes } from '@/src/features/cliente/actions';
import { MinhasInscricoesList } from '@/src/features/cliente/components/MinhasInscricoesList';

export const revalidate = 0;

export default async function MinhasInscricoesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/minhas-inscricoes');
  }

  const inscricoes = await listarMinhasInscricoes();

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Ingressos</h1>
          <p className="text-gray-400 text-sm mt-1">
            Acompanhe suas inscrições e cancele com até 48h de antecedência, se precisar.
          </p>
        </div>

        <MinhasInscricoesList inscricoes={inscricoes} />
      </div>
    </main>
  );
}
