import { redirect } from 'next/navigation';

import {
  Building2,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';

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
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-5 text-slate-900 lg:px-6">
      
      {/* Decorações de fundo */}
      <div className="pointer-events-none fixed left-0 top-0 -z-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 -z-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">

        {/* HEADER */}
        <div className="mb-5 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25">
              <span className="text-lg font-black text-white">
                C
              </span>
            </div>

            <span className="text-xl font-black tracking-tight text-slate-950">
              Clubber
            </span>
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="grid overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)] lg:grid-cols-12">

          {/* =====================================================
              COLUNA ESQUERDA
          ====================================================== */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-7 text-white lg:col-span-5 lg:p-8">

            {/* Decorações */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="relative z-10">

              {/* Badge */}
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-300/40
                  bg-blue-400/20
                  px-3
                  py-1.5
                  shadow-[0_0_20px_rgba(96,165,250,0.25)]
                  animate-pulse
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-200 shadow-[0_0_8px_rgba(191,219,254,0.9)]" />

                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-50">
                  Comece sua jornada
                </span>
              </div>

              {/* Título */}
              <h1 className="mt-5 max-w-sm text-2xl font-black leading-tight tracking-tight lg:text-3xl">
                Crie sua casa de eventos na Clubber.
              </h1>

              <p className="mt-3 max-w-sm text-xs font-medium leading-5 text-blue-100 lg:text-sm">
                Configure seu estabelecimento e tenha tudo o que precisa
                para criar eventos, vender ingressos e controlar seus
                participantes.
              </p>

              {/* Benefícios */}
              <div className="mt-7 space-y-3.5">

                {/* Venda */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100 ring-1 ring-white/10">
                    <Ticket size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-bold lg:text-sm">
                      Venda de ingressos
                    </p>

                    <p className="text-[10px] text-blue-200 lg:text-xs">
                      Venda ingressos de forma simples e segura.
                    </p>
                  </div>
                </div>

                {/* Participantes */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100 ring-1 ring-white/10">
                    <Users size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-bold lg:text-sm">
                      Controle de participantes
                    </p>

                    <p className="text-[10px] text-blue-200 lg:text-xs">
                      Organize participantes e check-ins.
                    </p>
                  </div>
                </div>

                {/* Segurança */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100 ring-1 ring-white/10">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-bold lg:text-sm">
                      Plataforma segura
                    </p>

                    <p className="text-[10px] text-blue-200 lg:text-xs">
                      Seus dados protegidos em um único lugar.
                    </p>
                  </div>
                </div>

              </div>

              {/* Pequeno destaque visual */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <Building2 size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-blue-200">
                      Sua organização
                    </p>

                    <p className="text-xs font-bold">
                      Pronta para começar
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* =====================================================
              COLUNA DIREITA
          ====================================================== */}
          <div className="bg-white p-6 lg:col-span-7 lg:p-8">

            <div className="mx-auto w-full max-w-md">

              {/* Cabeçalho */}
              <div className="mb-6">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={19} />
                </div>

                <h2 className="text-xl font-black tracking-tight text-slate-950 lg:text-2xl">
                  Configure seu estabelecimento
                </h2>

                <p className="mt-1.5 max-w-md text-xs font-medium leading-5 text-slate-500 lg:text-sm">
                  Essas informações serão usadas para identificar sua
                  organização dentro da Clubber.
                </p>

              </div>

              {/* Progresso */}
              <div className="mb-5">

                <div className="mb-1.5 flex items-center justify-between">

                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600">
                    Configuração inicial
                  </span>

                  <span className="text-[10px] font-bold text-slate-400">
                    1 de 1
                  </span>

                </div>

                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-full rounded-full bg-blue-600" />
                </div>

              </div>

              {/* FORMULÁRIO */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 lg:p-5">
                <OnboardingForm />
              </div>

              {/* Segurança */}
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <ShieldCheck size={15} />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-900 lg:text-xs">
                    Seus dados estão seguros
                  </p>

                  <p className="mt-0.5 text-[9px] font-medium leading-3.5 text-slate-500 lg:text-[10px]">
                    Utilizamos boas práticas de segurança para proteger
                    sua organização.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* FOOTER */}
        <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
          Clubber · Plataforma de eventos e ingressos
        </p>

      </div>
    </main>
  );
}