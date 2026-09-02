// app/minhas-inscricoes/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors">
          <ArrowLeft size={14} />
          Voltar
        </Link>

        <div>
          <h1 className="text-2xl font-black">Meus Ingressos</h1>
          <p className="text-muted text-sm mt-1">
            Acompanhe suas inscrições e cancele com até 48h de antecedência, se precisar.
          </p>
        </div>

        <MinhasInscricoesList inscricoes={inscricoes} />
      </div>
    </main>
  );
}
