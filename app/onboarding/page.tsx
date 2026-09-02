import { redirect } from 'next/navigation';

import { Building2, ShieldCheck, Ticket, Users } from 'lucide-react';

import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { OnboardingForm } from '@/src/features/onboarding/components/OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-5 text-foreground lg:px-6">

      <div className="pointer-events-none fixed left-0 top-0 -z-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 -z-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">

        {/* HEADER */}
        <div className="mb-5 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <span className="text-lg font-black text-primary-fg">V</span>
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">Vertix</span>
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="grid overflow-hidden rounded-[26px] border border-border bg-card shadow-[0_20px_60px_rgba(14,27,46,0.10)] lg:grid-cols-12">

          {/* COLUNA ESQUERDA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary-active p-7 text-primary-fg lg:col-span-5 lg:p-8">

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 shadow-[0_0_20px_rgba(255,255,255,0.1)] animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-fg shadow-[0_0_8px_rgba(250,248,244,0.9)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary-fg/90">Comece sua jornada</span>
              </div>

              <h1 className="mt-5 max-w-sm text-2xl font-black leading-tight tracking-tight lg:text-3xl">
                Crie sua casa de eventos na Vertix.
              </h1>

              <p className="mt-3 max-w-sm text-xs font-medium leading-5 text-primary-fg/70 lg:text-sm">
                Configure seu estabelecimento e tenha tudo o que precisa para criar eventos, vender ingressos e controlar seus participantes.
              </p>

              <div className="mt-7 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-fg/90 ring-1 ring-white/10">
                    <Ticket size={17} />
                  </div>
                  <div>
                    <p className="text-xs font-bold lg:text-sm">Venda de ingressos</p>
                    <p className="text-[10px] text-primary-fg/60 lg:text-xs">Venda ingressos de forma simples e segura.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-fg/90 ring-1 ring-white/10">
                    <Users size={17} />
                  </div>
                  <div>
                    <p className="text-xs font-bold lg:text-sm">Controle de participantes</p>
                    <p className="text-[10px] text-primary-fg/60 lg:text-xs">Organize participantes e check-ins.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-fg/90 ring-1 ring-white/10">
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <p className="text-xs font-bold lg:text-sm">Plataforma segura</p>
                    <p className="text-[10px] text-primary-fg/60 lg:text-xs">Seus dados protegidos em um único lugar.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <Building2 size={17} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-primary-fg/60">Sua organização</p>
                    <p className="text-xs font-bold">Pronta para começar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="bg-card p-6 lg:col-span-7 lg:p-8">
            <div className="mx-auto w-full max-w-md">

              <div className="mb-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 size={19} />
                </div>

                <h2 className="text-xl font-black tracking-tight text-foreground lg:text-2xl">
                  Configure seu estabelecimento
                </h2>

                <p className="mt-1.5 max-w-md text-xs font-medium leading-5 text-muted lg:text-sm">
                  Essas informações serão usadas para identificar sua organização dentro da Vertix.
                </p>
              </div>

              <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">Configuração inicial</span>
                  <span className="text-[10px] font-bold text-muted-subtle">1 de 1</span>
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-border-light">
                  <div className="h-full w-full rounded-full bg-primary" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background-secondary/50 p-4 lg:p-5">
                <OnboardingForm />
              </div>

              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground lg:text-xs">Seus dados estão seguros</p>
                  <p className="mt-0.5 text-[9px] font-medium leading-3.5 text-muted lg:text-[10px]">
                    Utilizamos boas práticas de segurança para proteger sua organização.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-medium text-muted-subtle">
          Vertix · Plataforma de eventos e ingressos
        </p>
      </div>
    </main>
  );
}
