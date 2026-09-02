'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search, Ticket, LayoutDashboard, ArrowRight, Menu, X, LogOut, ChevronDown, UserCircle, Heart,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';
import Image from 'next/image';
import LogoVertix from '@/src/assets/logo_vertix.svg';

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
        className="flex h-11 items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-2.5 transition-colors hover:border-input-border-hover cursor-pointer"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Perfil" className="h-8 w-8 rounded-full object-cover shrink-0" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-white text-xs font-semibold shrink-0">
            {iniciais(userNome)}
          </span>
        )}
        <ChevronDown size={14} className="text-muted-subtle" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-card shadow-card-hover py-1.5 text-sm">
          <div className="px-3.5 py-2.5 border-b border-border">
            <p className="font-medium truncate text-foreground">{userNome ?? 'Minha conta'}</p>
          </div>

          {temPainelAdmin && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.location.href = '/admin';
              }}
              className="w-full flex min-h-11 items-center gap-2.5 px-3.5 hover:bg-background-secondary transition-colors text-left cursor-pointer font-medium text-foreground"
            >
              <LayoutDashboard size={15} className="text-primary" />
              Painel Admin
            </button>
          )}

          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2.5 px-3.5 hover:bg-background-secondary transition-colors text-muted hover:text-foreground font-medium"
            >
              <Icon size={15} className="text-muted-subtle" />
              {label}
            </Link>
          ))}

          <div className="my-1 border-t border-border" />

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex min-h-11 items-center gap-2.5 px-3.5 text-error-fg hover:bg-error-bg transition-colors cursor-pointer font-medium"
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
    <>
      {/* Header: barra fixa full-bleed no mobile, "floating pill" a partir de md */}
      <header className="sticky top-0 z-40 md:top-4">
        <div className="border-b border-border bg-background/90 backdrop-blur-md md:mx-4 md:rounded-2xl md:border md:bg-background/75 md:shadow-card md:backdrop-blur-xl lg:mx-8 xl:mx-auto xl:max-w-6xl">
          <div className="flex h-14 items-center gap-3 px-4 md:h-16 md:gap-6 md:px-6">
            <Link href="/" className="flex shrink-0 items-center" aria-label="Vertix">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LogoVertix.src}
                alt="Vertix"
                className="h-7 w-[90px] md:h-8 md:w-[120px] object-contain"
              />
            </Link>

            {/* Busca — desktop */}
            <div className="hidden flex-1 md:block md:max-w-sm lg:max-w-md">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar festa, pub, evento..."
                  aria-label="Buscar festa, pub, evento"
                  className="input-base h-10 bg-background-secondary pl-9 pr-4 text-sm border-transparent focus:bg-background focus:border-input-border-focus"
                />
              </div>
            </div>

            <div className="ml-auto hidden items-center gap-2 md:flex">
              {isLoggedIn && !temPainelAdmin && (
                <Link
                  href="/minhas-inscricoes"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background-secondary hover:text-foreground"
                >
                  <Ticket size={16} />
                  Meus Ingressos
                </Link>
              )}

              {!isLoggedIn && (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-background-secondary hover:text-foreground"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/auth/cadastro"
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold !text-primary-fg transition-colors hover:bg-primary-hover"
                  >
                    Criar conta
                    <ArrowRight size={15} />
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

            {/* Mobile: busca some da barra principal para ganhar espaço; ação rápida + hambúrguer */}
            <div className="ml-auto flex items-center gap-1.5 md:hidden">
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => setMenuAberto(true)}
                  aria-label="Abrir conta"
                  className="flex h-11 w-11 items-center justify-center"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-white text-xs font-semibold">
                      {iniciais(userNome)}
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground cursor-pointer"
                aria-label="Abrir menu de navegação"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          {/* Busca — mobile, linha compacta dedicada */}
          <div className="px-4 pb-3 md:hidden">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar festa, pub, evento..."
                aria-label="Buscar festa, pub, evento"
                className="input-base h-11 rounded-full bg-background-secondary pl-9 text-sm border-transparent focus:bg-background focus:border-input-border-focus"
              />
            </div>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="hidden border-t border-border bg-background-secondary/60 md:block md:mx-4 lg:mx-8 xl:mx-auto xl:max-w-6xl">
            <div className="flex items-center px-6 py-2">
              <Link
                href="/auth/cadastro?redirect=/onboarding"
                className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-primary"
              >
                Você organiza eventos?
                <span className="text-primary font-medium">Cadastre sua casa de eventos</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Drawer mobile — cobre login/nav/conta em um único painel nativo */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuAberto(false)}
          />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-background border-l border-border shadow-card-hover overflow-y-auto z-10">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <img
  src={LogoVertix.src}
  alt="Vertix"
  className="h-6 w-[90px] object-contain"
/>
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-background-secondary hover:text-foreground cursor-pointer -mr-2"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 flex-col px-5 py-5">
              {isLoggedIn && (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background-secondary px-3.5 py-3.5 mb-5">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Perfil" className="h-11 w-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-white text-sm font-semibold shrink-0">
                      {iniciais(userNome)}
                    </span>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-medium truncate text-foreground">{userNome ?? 'Minha conta'}</p>
                    <p className="text-xs text-muted truncate">Sua conta ativa</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1">
                {isLoggedIn && temPainelAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuAberto(false);
                      window.location.href = '/admin';
                    }}
                    className="w-full flex min-h-11 items-center gap-3 rounded-xl border border-border bg-background-secondary px-3.5 text-sm font-medium text-primary text-left cursor-pointer"
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
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-muted hover:bg-background-secondary hover:text-foreground transition-colors"
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
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-muted hover:bg-background-secondary hover:text-foreground"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/auth/cadastro"
                      onClick={() => setMenuAberto(false)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-semibold !text-primary-fg"
                    >
                      Criar conta
                      <ArrowRight size={15} />
                    </Link>
                    <div className="my-2 border-t border-border" />
                    <Link
                      href="/auth/cadastro?redirect=/onboarding"
                      onClick={() => setMenuAberto(false)}
                      className="flex min-h-11 items-center gap-1.5 px-3.5 text-xs text-muted hover:text-primary"
                    >
                      Você organiza eventos? <span className="text-primary font-medium">Cadastre-se</span>
                    </Link>
                  </>
                )}
              </nav>

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-auto flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-error-fg hover:bg-error-bg cursor-pointer"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}