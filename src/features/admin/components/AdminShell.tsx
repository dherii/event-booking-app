'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  Settings,
  Menu,
  X,
  ChevronRight,
  Bell,
  LogOut,
  ExternalLink,
  User,
  MoreVertical,
  Banknote
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface AdminShellProps {
  children: React.ReactNode;
  userNome: string;
  userEmail: string;
  estabelecimentoNome: string;
  userRole: string;
  headerAction?: React.ReactNode;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Eventos', href: '/admin/eventos', icon: CalendarDays },
  { label: 'Participantes', href: '/admin/participantes', icon: Users },
  { label: 'Financeiro', href: '/admin/financeiro', icon: Wallet },
  { label: 'Repasses', href: '/admin/repasses', icon: Banknote },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
];

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-150
        ${active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
      )}
      <Icon size={18} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
      <span>{item.label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
    </Link>
  );
}

function Sidebar({
  pathname,
  onClose,
  userNome,
  userEmail,
  estabelecimentoNome,
  userRole,
}: {
  pathname: string;
  onClose?: () => void;
  userNome: string;
  userEmail: string;
  estabelecimentoNome: string;
  userRole: string;
}) {
  const [menuUserAberto, setMenuUserAberto] = useState(false);
  const router = useRouter();

 async function handleLogout() {
    try {
      const res = await fetch('/auth/logout', { method: 'POST' });
      // Redireciona para a vitrine de ingressos (raiz /) após sair
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Erro ao sair:', error);
      router.push('/');
    }
  }

  return (
    <aside className="flex flex-col h-full w-60 bg-card border-r border-border px-3 py-5 relative">
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">{estabelecimentoNome.charAt(0).toUpperCase()}</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground truncate max-w-[9rem]">{estabelecimentoNome}</p>
            <p className="text-[11px] text-muted-foreground">Painel Admin</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.filter((item) => {
          if (item.href === '/admin/repasses' && userRole !== 'super_admin') return false;
          return true;
        }).map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Rodapé do Usuário com Menu Popover */}
      <div className="relative pt-4 border-t border-border">
        {menuUserAberto && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
            <div className="p-3 border-b border-border bg-accent/40">
              <p className="text-xs font-semibold text-foreground truncate">{userNome}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>

            <div className="p-1 space-y-0.5">
              <Link
                href="/"
                target="_blank"
                prefetch={false}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-accent transition-colors"
                onClick={() => setMenuUserAberto(false)}
              >
                <ExternalLink size={14} className="text-muted-foreground" />
                Ver Plataforma
              </Link>

              <Link
                href="/admin/configuracoes"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-accent transition-colors"
                onClick={() => setMenuUserAberto(false)}
              >
                <User size={14} className="text-muted-foreground" />
                Minha Conta
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 rounded-lg hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
              >
                <LogOut size={14} className="text-rose-500" />
                Sair da Conta
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuUserAberto(!menuUserAberto)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {iniciais(userNome)}
            </div>
            <div className="leading-tight overflow-hidden">
              <p className="text-xs font-medium text-foreground truncate">{userNome}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          <MoreVertical size={16} className="text-muted-foreground group-hover:text-foreground shrink-0 ml-1" />
        </button>
      </div>
    </aside>
  );
}

function Header({
  onMenuClick,
  pathname,
  userNome,
  headerAction,
}: {
  onMenuClick: () => void;
  pathname: string;
  userNome: string;
  headerAction?: React.ReactNode;
}) {
  const current = NAV_ITEMS.find((i) => i.href === pathname);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Título da Página Atual com Indicador */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-bold text-foreground">
            {current ? current.label : 'Painel'}
          </h1>
          <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            Ativo
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">

  {headerAction}

  {/* Notificações */}
  <button
    className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-border/40"
    aria-label="Notificações"
  >
    <Bell size={18} />

    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
  </button>

  <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-primary/10">
      {iniciais(userNome)}
    </div>

    <span className="text-xs font-semibold text-foreground hidden md:inline-block">
      {userNome.split(" ")[0]}
    </span>
  </div>


        
      </div>
    </header>
  );
}

// ─── Shell Principal ────────────────────────────────────────────────────────


export function AdminShell({
  children,
  userNome,
  userEmail,
  estabelecimentoNome,
  userRole,
  headerAction,
}: AdminShellProps) {

  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          pathname={pathname}
          userNome={userNome}
          userEmail={userEmail}
          estabelecimentoNome={estabelecimentoNome}
          userRole={userRole}
        />
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-40 flex w-60 lg:hidden">
            <Sidebar
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
              userNome={userNome}
              userEmail={userEmail}
              estabelecimentoNome={estabelecimentoNome}
              userRole={userRole}
            />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <Header
  onMenuClick={() => setMobileOpen(true)}
  pathname={pathname}
  userNome={userNome}
  headerAction={headerAction}
/>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}