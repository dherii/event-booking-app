// app/admin/participantes/page.tsx
'use client';

import { useState } from 'react';
import { Users, ScanLine } from 'lucide-react';
import { TabelaInscritos }  from '@/src/features/admin/participantes/components/TabelaInscritos';
import { CheckinScanner }   from '@/src/features/admin/participantes/components/CheckinScanner';
import { MOCK_INSCRITOS }   from '@/src/features/admin/participantes/types';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'gestao' | 'checkin';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const TABS: TabConfig[] = [
  { id: 'gestao',  label: 'Gestão de Inscritos', icon: Users,   badge: String(MOCK_INSCRITOS.length) },
  { id: 'checkin', label: 'Modo Check-in',        icon: ScanLine                                      },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParticipantesPage() {
  const [tab, setTab] = useState<Tab>('gestao');

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Participantes</h1>
        <p className="text-sm text-muted mt-0.5">Gerencie inscrições e realize o credenciamento no dia do evento.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 -mb-px">
          {TABS.map(({ id, label, icon: Icon, badge }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground hover:border-border'
                  }
                `}
              >
                <Icon size={15} />
                {label}
                {badge && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-primary/10 text-primary' : 'bg-border text-muted'}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da aba */}
      {tab === 'gestao' && (
        <TabelaInscritos inscritos={MOCK_INSCRITOS} />
      )}

      {tab === 'checkin' && (
        <CheckinScanner inscritos={MOCK_INSCRITOS} />
      )}
    </div>
  );
}