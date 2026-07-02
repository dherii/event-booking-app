'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  Award,
  Settings,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     href: '/admin',               icon: LayoutDashboard },
  { label: 'Eventos',       href: '/admin/eventos',        icon: CalendarDays    },
  { label: 'Participantes', href: '/admin/participantes',  icon: Users           },
  { label: 'Financeiro',    href: '/admin/financeiro',     icon: Wallet          },
  { label: 'Certificados',  href: '/admin/certificados',   icon: Award           },
  { label: 'Configurações', href: '/admin/configuracoes',  icon: Settings        },
];

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
          : 'text-muted hover:text-foreground hover:bg-border'
        }
      `}
    >
      {/* Indicador ativo — pill lateral */}
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
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <aside className="flex flex-col h-full w-60 bg-card border-r border-border px-3 py-5">
      {/* Logo / Tenant */}
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">U</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">UniEventos</p>
            <p className="text-[11px] text-muted">Painel Admin</p>
          </div>
        </div>

        {/* Fechar no mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-foreground hover:bg-border transition-colors lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Rodapé da sidebar */}
      <div className="px-2 pt-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            CA
          </div>
          <div className="leading-tight overflow-hidden">
            <p className="text-xs font-medium text-foreground truncate">Centro Acadêmico</p>
            <p className="text-[11px] text-muted truncate">admin@unicatolica.edu.br</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header({ onMenuClick, pathname }: { onMenuClick: () => void; pathname: string }) {
  // Resolve label da rota atual para o breadcrumb
  const current = NAV_ITEMS.find((i) => i.href === pathname);

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-3">
        {/* Menu mobile */}
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-border transition-colors lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted">Admin</span>
          {current && current.href !== '/admin' && (
            <>
              <ChevronRight size={14} className="text-muted" />
              <span className="font-medium text-foreground">{current.label}</span>
            </>
          )}
        </div>
      </div>

      {/* Ações do header */}
      <div className="flex items-center gap-2">
        <button
          className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-border transition-colors"
          aria-label="Notificações"
        >
          <Bell size={18} />
          {/* Badge de notificação */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
          CA
        </div>
      </div>
    </header>
  );
}

// ─── Layout Principal ─────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* Sidebar — desktop (sempre visível) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar pathname={pathname} />
      </div>

      {/* Sidebar — mobile (drawer com overlay) */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-40 flex lg:hidden">
            <Sidebar pathname={pathname} onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} pathname={pathname} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}