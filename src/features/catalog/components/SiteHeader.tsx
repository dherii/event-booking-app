'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Ticket, User, LayoutDashboard, ArrowRight, Menu, X,
} from 'lucide-react';

interface SiteHeaderProps {
  isLoggedIn: boolean;
  temPainelAdmin: boolean;
}

export function SiteHeader({ isLoggedIn, temPainelAdmin }: SiteHeaderProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
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
              placeholder="Buscar festa, pub, evento..."
              className="input-base h-10 rounded-full border-border bg-card/70 pl-10 pr-4 text-sm placeholder:text-muted-subtle focus:border-primary"
              disabled
            />
          </div>
        </div>

        {/* Ações — desktop */}
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {isLoggedIn && temPainelAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:border-primary/50 hover:bg-primary/15 hover:shadow-neon"
            >
              <LayoutDashboard size={16} />
              Painel Admin
            </Link>
          )}

          {isLoggedIn && (
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

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:border-accent-purple hover:text-foreground">
            <User size={16} />
          </div>
        </div>

        {/* Botão hambúrguer — só mobile */}
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
            placeholder="Buscar festa, pub, evento..."
            className="input-base h-10 rounded-full bg-card pl-9 text-sm"
            disabled
          />
        </div>
      </div>

      {/* Link organizadores — desktop/tablet (mobile fica dentro do drawer) */}
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

      {/* ─── Drawer mobile ─────────────────────────────────────────── */}
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
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
