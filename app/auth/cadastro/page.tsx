'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  Loader2, User, Ticket, BarChart3,
  ShieldCheck, Mail, Lock, ArrowRight, Eye, CheckCircle2,
  Users, CalendarDays,
} from 'lucide-react';

import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

function CadastroUnificadoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Se o usuário veio de um link "Seja um produtor", redirecionamos para o onboarding após o cadastro
  const redirectTarget = searchParams.get('redirect') === '/onboarding' 
    ? '/onboarding' 
    : '/';

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (!aceitouTermos) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    // Todo mundo nasce como cliente. O upgrade para produtor acontece no Onboarding.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
          role: 'cliente', 
        },
      },
    });

    if (signUpError) {
      setErro(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (loginError) {
      router.push('/auth/login?cadastro=sucesso');
      return;
    }

    router.push(redirectTarget);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setErro(null);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTarget)}`,
      },
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-4 lg:p-8 text-slate-900">
      <div className="w-full max-w-6xl min-h-[760px] overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] grid grid-cols-1 lg:grid-cols-12">

        {/* =====================================================
            COLUNA ESQUERDA (Branding Geral)
        ====================================================== */}
        <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/80 p-8 lg:p-12 flex flex-col justify-between">
          <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-32 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_0_8px_rgba(59,130,246,0.08)]" />
          <div className="pointer-events-none absolute left-20 top-52 h-1.5 w-1.5 rounded-full bg-blue-400" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
                <span className="text-xl font-black text-white">C</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-950">Clubber</span>
            </div>

            <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-2 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Plataforma de eventos</span>
            </div>

            <div className="mt-5 max-w-md">
              <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 lg:text-[46px]">
                Eventos que <span className="text-blue-600">conectam</span>.
              </h1>
              <p className="mt-5 max-w-sm text-sm font-medium leading-6 text-slate-600">
                Crie sua conta para comprar ingressos, acessar certificados e gerenciar suas experiências.
              </p>
            </div>
            
            {/* Benefícios simplificados para todos */}
            <div className="mt-8 space-y-4">
              <div className="group flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <Ticket size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ingressos Digitais</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Compre de forma rápida e segura.</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Check-in Descomplicado</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Valide sua entrada direto pelo celular.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            COLUNA DIREITA (Formulário Limpo)
        ====================================================== */}
        <div className="lg:col-span-7 flex items-center justify-center bg-white p-8 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <h2 className="text-3xl font-black tracking-tight text-slate-950">Criar conta</h2>
              <p className="mt-1.5 text-sm font-medium leading-5 text-slate-500">
                Acesse a Clubber em poucos segundos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><User size={17} /></span>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João Silva" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" required />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">E-mail</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Mail size={17} /></span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" required />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Lock size={17} /></span>
                  <input type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Crie uma senha segura" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-11 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" required minLength={6} />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-blue-600"><Eye size={17} /></button>
                </div>
              </div>

              {/* Divisor */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Ou continue com</span></div>
              </div>

              {/* Google */}
              <button type="button" onClick={handleGoogleLogin} disabled={loading} className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md disabled:opacity-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continuar com Google
              </button>

              {/* Termos */}
              <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs font-medium leading-5 text-slate-600">
                <input type="checkbox" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600" required />
                <span>Li e concordo com os <Link href="/termos-de-uso" target="_blank" className="font-bold text-blue-600 hover:underline">Termos de Uso</Link> e a <Link href="/politica-de-privacidade" target="_blank" className="font-bold text-blue-600 hover:underline">Política de Privacidade</Link>.</span>
              </label>

              {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold leading-5 text-red-600">{erro}</p>}

              {/* Submit */}
              <button type="submit" disabled={loading || !aceitouTermos} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 disabled:opacity-50 disabled:hover:translate-y-0">
                {loading ? <Loader2 size={17} className="animate-spin" /> : <><span>Criar conta</span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-slate-500">
              Já tem conta? <Link href="/auth/login" className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline">Entrar</Link>
            </p>

            {/* CTA Discreto para Organizadores no final */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-500">Representa um estabelecimento?</span>
              <Link href="/auth/cadastro?redirect=/onboarding" className="text-xs font-bold text-blue-600 hover:underline">
                Crie sua conta aqui
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroUnificadoForm />
    </Suspense>
  );
}