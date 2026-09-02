'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  Loader2, User, Ticket, ShieldCheck, Mail, Lock, ArrowRight, Eye,
} from 'lucide-react';

import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

function CadastroUnificadoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = searchParams.get('redirect') === '/onboarding' ? '/onboarding' : '/';

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

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, role: 'cliente' },
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 lg:p-8 text-foreground">
      <div className="w-full max-w-6xl min-h-[760px] overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_30px_80px_rgba(14,27,46,0.12)] grid grid-cols-1 lg:grid-cols-12">

        {/* Coluna esquerda — escondida no mobile */}
        <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 lg:p-12">
          <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-32 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_8px_rgba(15,38,71,0.08)]" />
          <div className="pointer-events-none absolute left-20 top-52 h-1.5 w-1.5 rounded-full bg-primary" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <span className="text-xl font-black text-primary-fg">V</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">Vertix</span>
            </div>

            <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-2 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(15,38,71,0.12)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Plataforma de eventos</span>
            </div>

            <div className="mt-5 max-w-md">
              <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-foreground lg:text-[46px]">
                Eventos que <span className="text-primary">conectam</span>.
              </h1>
              <p className="mt-5 max-w-sm text-sm font-medium leading-6 text-muted">
                Crie sua conta para comprar ingressos, acessar certificados e gerenciar suas experiências.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="group flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <Ticket size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Ingressos Digitais</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted">Compre de forma rápida e segura.</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Check-in Descomplicado</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted">Valide sua entrada direto pelo celular.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita — formulário */}
        <div className="lg:col-span-7 flex items-center justify-center bg-card p-6 sm:p-8 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 lg:hidden">
                <span className="text-xl font-black text-primary-fg">V</span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-foreground">Criar conta</h2>
              <p className="mt-1.5 text-sm font-medium leading-5 text-muted">
                Acesse a Vertix em poucos segundos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-subtle"><User size={17} /></span>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João Silva" className="input-base pl-10" required />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">E-mail</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-subtle"><Mail size={17} /></span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="input-base pl-10" required />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-subtle"><Lock size={17} /></span>
                  <input type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Crie uma senha segura" className="input-base pl-10 pr-11" required minLength={6} />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-subtle transition hover:text-primary" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                    <Eye size={17} />
                  </button>
                </div>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-card px-3 text-[10px] font-black uppercase tracking-[0.15em] text-muted-subtle">Ou continue com</span></div>
              </div>

              <button type="button" onClick={handleGoogleLogin} disabled={loading} className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-card-hover hover:shadow-md disabled:opacity-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continuar com Google
              </button>

              <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs font-medium leading-5 text-muted">
                <input type="checkbox" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} className="mt-1 h-4 w-4 rounded border-input-border accent-primary" required />
                <span>Li e concordo com os <Link href="/termos-de-uso" target="_blank" className="font-bold text-primary hover:underline">Termos de Uso</Link> e a <Link href="/politica-de-privacidade" target="_blank" className="font-bold text-primary hover:underline">Política de Privacidade</Link>.</span>
              </label>

              {erro && <p role="alert" className="rounded-xl border border-error-fg/20 bg-error-bg px-3.5 py-2.5 text-xs font-bold leading-5 text-error-fg">{erro}</p>}

              <button type="submit" disabled={loading || !aceitouTermos} className="group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-fg shadow-neon transition-all hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-50 disabled:hover:translate-y-0">
                {loading ? <Loader2 size={17} className="animate-spin" /> : <><span>Criar conta</span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-muted">
              Já tem conta? <Link href="/auth/login" className="font-bold text-primary transition hover:text-primary-hover hover:underline">Entrar</Link>
            </p>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-muted">Representa um estabelecimento?</span>
              <Link href="/auth/cadastro?redirect=/onboarding" className="text-xs font-bold text-primary hover:underline">
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
