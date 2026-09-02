// app/perfil/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { buscarMeuPerfil } from '@/src/features/cliente/actions';
import { PerfilForm } from '@/src/features/cliente/components/PerfilForm';

export default async function PerfilPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/perfil');
  }

  const perfil = await buscarMeuPerfil();

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors">
          <ArrowLeft size={14} />
          Voltar
        </Link>

        <div>
          <h1 className="text-2xl font-black">Meu Perfil</h1>
          <p className="text-muted text-sm mt-1">Atualize sua foto e informações pessoais.</p>
        </div>

        <PerfilForm perfil={perfil} />
      </div>
    </main>
  );
}
