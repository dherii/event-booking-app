'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  Loader2,
  Ticket,
  BarChart3,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  CheckCircle2,
  Users,
  CalendarDays,
} from 'lucide-react';

import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setErro(null);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
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

        {/* Coluna esquerda — escondida no mobile, só aparece a partir de lg */}
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
                Seus eventos começam <span className="text-primary">aqui.</span>
              </h1>
              <p className="mt-5 max-w-sm text-sm font-medium leading-6 text-muted">
                Acesse sua conta para comprar ingressos, acompanhar seus eventos ou gerenciar sua organização.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="group flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <Ticket size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Seus ingressos em um só lugar</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted">Acesse rapidamente seus eventos.</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Gestão simplificada</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted">Organize seus eventos facilmente.</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Experiência segura</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted">Seus dados protegidos com segurança.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ilustração — ingresso digital */}
          <div className="relative z-10 mt-8 flex min-h-[245px] items-center justify-center">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/30" />
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15" />

            <div className="relative rotate-[-7deg]">
              <div className="relative w-[210px] rounded-[24px] bg-primary p-5 shadow-[0_25px_50px_rgba(15,38,71,0.35)]">
                <div className="absolute -left-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-background" />
                <div className="absolute -right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-background" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary-fg/60">VERTIX</p>
                    <p className="mt-1 text-sm font-black text-primary-fg">EVENT PASS</p>
                  </div>
                  <Ticket size={22} className="text-primary-fg/60" />
                </div>

                <div className="mt-5 flex justify-center">
                  <div className="grid h-[112px] w-[112px] grid-cols-7 gap-1 rounded-xl bg-primary-fg p-3">
                    {[
                      1, 1, 1, 0, 1, 1, 1,
                      1, 0, 1, 1, 0, 0, 1,
                      1, 1, 1, 0, 1, 1, 1,
                      0, 1, 0, 1, 1, 0, 0,
                      1, 1, 1, 0, 1, 1, 1,
                      1, 0, 1, 1, 0, 1, 0,
                      1, 1, 1, 0, 1, 0, 1,
                    ].map((active, index) => (
                      <span key={index} className={active ? 'rounded-[2px] bg-primary-active' : 'rounded-[2px] bg-primary-fg'} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-primary-fg/25 pt-3">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-primary-fg/60">Acesso</p>
                    <p className="text-xs font-bold text-primary-fg">DIGITAL</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase tracking-wider text-primary-fg/60">Status</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-primary-fg">
                      <CheckCircle2 size={12} />
                      Ativo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-4 flex items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2.5 shadow-xl shadow-primary/10 backdrop-blur">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-subtle">Participantes</p>
                <p className="text-sm font-black text-foreground">+1.248</p>
              </div>
            </div>

            <div className="absolute bottom-5 left-0 flex items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2.5 shadow-xl shadow-primary/10 backdrop-blur">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-bg text-success-fg">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-subtle">Check-in</p>
                <p className="text-sm font-black text-foreground">98,4%</p>
              </div>
            </div>

            <div className="absolute bottom-0 right-2 flex items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2.5 shadow-xl shadow-primary/10 backdrop-blur">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays size={16} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-subtle">Eventos</p>
                <p className="text-sm font-black text-foreground">24</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita — formulário */}
        <div className="lg:col-span-7 flex items-center justify-center bg-card p-6 sm:p-8 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 lg:hidden">
                <span className="text-xl font-black text-primary-fg">V</span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-foreground">Bem-vindo de volta</h2>
              <p className="mt-1.5 text-sm font-medium leading-5 text-muted">
                Entre na sua conta para continuar sua experiência.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">E-mail</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-subtle"><Mail size={17} /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-base pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-subtle"><Lock size={17} /></span>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    className="input-base pl-10 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-subtle transition hover:text-primary"
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Eye size={17} />
                  </button>
                </div>
              </div>

              {erro && (
                <p role="alert" className="rounded-xl border border-error-fg/20 bg-error-bg px-3.5 py-2.5 text-xs font-bold leading-5 text-error-fg">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-fg shadow-neon transition-all hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Entrando…</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-3 text-[10px] font-black uppercase tracking-[0.15em] text-muted-subtle">Ou continue com</span></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-card-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continuar com Google
            </button>

            <p className="mt-7 text-center text-sm font-medium text-muted">
              Não tem conta?{' '}
              <Link href="/auth/cadastro" className="font-bold text-primary transition hover:text-primary-hover hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
