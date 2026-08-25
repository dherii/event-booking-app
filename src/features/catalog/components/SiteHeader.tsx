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

const NAV_LINKS = [
  { href: '/minhas-inscricoes', label: 'Meus Ingressos', icon: Ticket },
  { href: '/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/perfil', label: 'Meu Perfil', icon: UserCircle },
];

function iniciais(nome: string | null) {
  if (!nome) return '?';
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
}

function AccountMenu({
  isLoggedIn,
  temPainelAdmin,
  userNome,
  avatarUrl,
  onLogout,
}: SiteHeaderProps & { onLogout: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!isLoggedIn) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu da conta"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-border/80 bg-card/90 pl-1.5 pr-2.5 py-1 hover:border-primary/50 transition-all shadow-sm cursor-pointer"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Perfil" className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-primary/20" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-white text-xs font-bold shrink-0">
            {iniciais(userNome)}
          </span>
        )}
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2.5 w-60 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl py-2 text-sm">
          <div className="px-4 py-2.5 border-b border-border/60">
            <p className="font-bold truncate text-foreground">{userNome ?? 'Minha conta'}</p>
          </div>

          {temPainelAdmin && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.location.href = '/admin';
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-background-secondary transition-colors text-left cursor-pointer font-medium"
            >
              <LayoutDashboard size={16} className="text-primary" />
              Painel Admin
            </button>
          )}

          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-background-secondary transition-colors text-muted hover:text-foreground font-medium"
            >
              <Icon size={16} className="text-muted" />
              {label}
            </Link>
          ))}

          <div className="my-1.5 border-t border-border/60" />

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-error-fg hover:bg-error-bg/60 transition-colors cursor-pointer font-medium"
          >
            <LogOut size={16} />
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

  useEffect(() => {
    const currentQuery = searchParams.get('q') ?? '';
    if (busca === currentQuery) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (busca.trim()) {
        params.set('q', busca);
      } else {
        params.delete('q');
      }
      
      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      
      router.replace(targetUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [busca, pathname, router, searchParams]);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setMenuAberto(false);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink shadow-purple transition-transform duration-300 group-hover:scale-105">
            <span className="text-xl font-black text-white">C</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-brand-gradient">Clubber</span>
        </Link>

        {/* Busca — desktop */}
        <div className="hidden flex-1 md:block md:max-w-md lg:max-w-lg">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar festa, pub, evento..."
              aria-label="Buscar festa, pub, evento"
              className="input-base h-11 rounded-2xl border-border/85 bg-card/80 pl-11 pr-4 text-sm placeholder:text-muted-subtle focus:border-primary shadow-sm"
            />
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-3 sm:flex">
          {isLoggedIn && !temPainelAdmin && (
            <Link
              href="/minhas-inscricoes"
              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              <Ticket size={18} />
              Meus Ingressos
            </Link>
          )}

          {!isLoggedIn && (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-foreground"
              >
                Entrar
              </Link>
              <Link
                href="/auth/cadastro"
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg shadow-neon transition-all hover:bg-primary-hover"
              >
                Criar conta
                <ArrowRight size={16} />
              </Link>
            </>
          )}

          {isLoggedIn ? (
            <AccountMenu
              isLoggedIn={isLoggedIn}
              temPainelAdmin={temPainelAdmin}
              userNome={userNome}
              avatarUrl={avatarUrl}
              onLogout={handleLogout}
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl bg-card border border-border text-muted hover:text-foreground sm:hidden cursor-pointer shadow-sm"
          aria-label="Abrir menu de navegação"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Busca — mobile */}
      <div className="px-4 pb-4 md:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar festa, pub, evento..."
            aria-label="Buscar festa, pub, evento"
            className="input-base h-11 rounded-2xl bg-card pl-10 text-sm shadow-sm"
          />
        </div>
      </div>

      {!isLoggedIn && (
        <div className="hidden border-t border-border/40 bg-background-secondary/40 sm:block">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-2.5 sm:px-6 lg:px-8">
            <Link
              href="/auth/cadastro?redirect=/onboarding"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-primary"
            >
              Você organiza eventos?
              <span className="text-primary font-bold">Cadastre sua casa de eventos</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Drawer mobile */}
      {menuAberto && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden cursor-default border-none"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col bg-background border-l border-border p-6 sm:hidden shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-black text-brand-gradient">Menu</span>
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted hover:bg-card hover:text-foreground cursor-pointer"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            {isLoggedIn && (
              <div className="flex items-center gap-3.5 px-3 py-3.5 mb-4 rounded-2xl bg-card border border-border shadow-sm">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Perfil" className="h-11 w-11 rounded-full object-cover shrink-0 ring-2 ring-primary/20" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-white text-sm font-bold shrink-0">
                    {iniciais(userNome)}
                  </span>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold truncate text-foreground">{userNome ?? 'Minha conta'}</p>
                  <p className="text-xs text-muted truncate">Sua conta ativa</p>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-2.5">
              {isLoggedIn && temPainelAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false);
                    window.location.href = '/admin';
                  }}
                  className="w-full flex items-center gap-3.5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3.5 text-sm font-bold text-primary text-left cursor-pointer"
                >
                  <LayoutDashboard size={18} />
                  Painel Admin
                </button>
              )}

              {isLoggedIn &&
                NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-muted hover:bg-card hover:text-foreground transition-colors"
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}

              {!isLoggedIn && (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-muted hover:bg-card hover:text-foreground"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/auth/cadastro"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-fg shadow-neon"
                  >
                    Criar conta
                    <ArrowRight size={16} />
                  </Link>
                  <div className="my-2 border-t border-border" />
                  <Link
                    href="/auth/cadastro?redirect=/onboarding"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted hover:text-primary"
                  >
                    Você organiza eventos? <span className="text-primary font-bold">Cadastre-se</span>
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-error-fg hover:bg-error-bg mt-4 cursor-pointer"
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