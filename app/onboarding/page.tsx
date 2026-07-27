// app/onboarding/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { OnboardingForm } from '@/src/features/onboarding/components/OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/onboarding');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('estabelecimento_id')
    .eq('id', user.id)
    .single();

  if (profile?.estabelecimento_id) {
    redirect('/admin');
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-purple">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="text-lg font-black text-brand-gradient">Clubber</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black">Cadastre seu estabelecimento</h1>
          <p className="text-sm text-muted mt-2">
            Crie o painel da sua casa de eventos e comece a vender ingressos, mesas e camarotes.
          </p>
        </div>

        <OnboardingForm />
      </div>
    </main>
  );
}
