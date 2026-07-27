'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search, Ticket, LayoutDashboard, ArrowRight, Menu, X, LogOut, ChevronDown, UserCircle, Heart,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

interface SiteHeaderProps {
  isLoggedIn: boolean;
  temPainelAdmin: boolean;
  userNome: string | null;
  avatarUrl?: string | null;
}

function iniciais(nome: string | null) {
  if (!nome) return '?';
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
}

function AccountMenu({ isLoggedIn, temPainelAdmin, userNome, avatarUrl }: SiteHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  if (!isLoggedIn) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card pl-1 pr-2 py-1 hover:border-accent-purple transition-colors"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Perfil" className="h-7 w-7 rounded-full object-cover shrink-0" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-white text-xs font-bold shrink-0">
            {iniciais(userNome)}
          </span>
        )}
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-card shadow-card-hover py-1.5 text-sm">
          <div className="px-3.5 py-2 border-b border-border">
            <p className="font-semibold truncate">{userNome ?? 'Minha conta'}</p>
          </div>

          {temPainelAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-background transition-colors"
            >
              <LayoutDashboard size={15} className="text-primary" />
              Painel Admin
            </Link>
          )}

          <Link
            href="/minhas-inscricoes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-background transition-colors"
          >
            <Ticket size={15} className="text-muted" />
            Meus Ingressos
          </Link>

          <Link
            href="/favoritos"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-background transition-colors"
          >
            <Heart size={15} className="text-muted" />
            Favoritos
          </Link>

          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-background transition-colors"
          >
            <UserCircle size={15} className="text-muted" />
            Meu Perfil
          </Link>

          <div className="my-1 border-t border-border" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-error-fg hover:bg-error-bg transition-colors"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({ isLoggedIn, temPainelAdmin, userNome, avatarUrl }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [menuAberto, setMenuAberto] = useState(false);
  const [busca, setBusca] = useState(searchParams.get('q') ?? '');

  function atualizarBusca(valor: string) {
    setBusca(valor);
    const params = new URLSearchParams(searchParams.toString());
    if (valor.trim()) params.set('q', valor); else params.delete('q');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink shadow-purple transition-transform duration-300 group-hover:scale-105">
            <span className="text-lg font-black text-white">C</span>
          </div>
          <span className="text-xl font-black tracking-tight text-brand-gradient">Clubber</span>
        </Link>

        {/* Busca — desktop */}
        <div className="hidden flex-1 md:block md:max-w-md lg:max-w-lg">
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-subtle" />
            <input
              type="text"
              value={busca}
              onChange={(e) => atualizarBusca(e.target.value)}
              placeholder="Buscar festa, pub, evento..."
              className="input-base h-10 rounded-full border-border bg-card/70 pl-10 pr-4 text-sm placeholder:text-muted-subtle focus:border-primary"
            />
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {isLoggedIn && !temPainelAdmin && (
            <Link
              href="/minhas-inscricoes"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              <Ticket size={17} />
              Meus Ingressos
            </Link>
          )}

          {!isLoggedIn && (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-foreground"
              >
                Entrar
              </Link>
              <Link
                href="/auth/cadastro"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-fg shadow-neon transition-all hover:bg-primary-hover"
              >
                Criar conta
                <ArrowRight size={15} />
              </Link>
            </>
          )}

          {isLoggedIn ? (
            <AccountMenu isLoggedIn={isLoggedIn} temPainelAdmin={temPainelAdmin} userNome={userNome} avatarUrl={avatarUrl} />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted" />
          )}
        </div>

        <button
          onClick={() => setMenuAberto(true)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-card hover:text-foreground sm:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Busca — mobile */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-subtle" />
          <input
            type="text"
            value={busca}
            onChange={(e) => atualizarBusca(e.target.value)}
            placeholder="Buscar festa, pub, evento..."
            className="input-base h-10 rounded-full bg-card pl-9 text-sm"
          />
        </div>
      </div>

      {!isLoggedIn && (
        <div className="hidden border-t border-border/50 bg-background-secondary/50 sm:block">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-2 sm:px-6 lg:px-8">
            <Link
              href="/auth/cadastro?redirect=/onboarding"
              className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-primary"
            >
              Você organiza eventos?
              <span className="text-primary">Cadastre sua casa de eventos</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Drawer mobile */}
      {menuAberto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 sm:hidden"
            onClick={() => setMenuAberto(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-background border-l border-border p-5 sm:hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-black text-brand-gradient">Menu</span>
              <button
                onClick={() => setMenuAberto(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-card hover:text-foreground"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            {isLoggedIn && (
              <div className="flex items-center gap-3 px-1 py-3 mb-2 border-b border-border">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Perfil" className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-white text-sm font-bold shrink-0">
                    {iniciais(userNome)}
                  </span>
                )}
                <p className="font-semibold truncate">{userNome ?? 'Minha conta'}</p>
              </div>
            )}

            <nav className="flex flex-col gap-2">
              {isLoggedIn && temPainelAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
                >
                  <LayoutDashboard size={18} />
                  Painel Admin
                </Link>
              )}

              {isLoggedIn && (
                <Link
                  href="/minhas-inscricoes"
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-card hover:text-foreground"
                >
                  <Ticket size={18} />
                  Meus Ingressos
                </Link>
              )}

              {isLoggedIn && (
                <Link
                  href="/perfil"
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-card hover:text-foreground"
                >
                  <UserCircle size={18} />
                  Meu Perfil
                </Link>
              )}

              {isLoggedIn && (
                <Link
                  href="/favoritos"
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-card hover:text-foreground"
                >
                  <Heart size={18} />
                  Favoritos
                </Link>
              )}

              {!isLoggedIn && (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-card hover:text-foreground"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/auth/cadastro"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-fg shadow-neon"
                  >
                    Criar conta
                    <ArrowRight size={15} />
                  </Link>
                  <div className="my-2 border-t border-border" />
                  <Link
                    href="/auth/cadastro?redirect=/onboarding"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-muted hover:text-primary"
                  >
                    Você organiza eventos? <span className="text-primary">Cadastre-se</span>
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <button
                  onClick={async () => {
                    const supabase = createSupabaseBrowserClient();
                    await supabase.auth.signOut();
                    setMenuAberto(false);
                    router.push('/');
                    router.refresh();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error-fg hover:bg-error-bg mt-2"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
