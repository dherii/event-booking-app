// src/features/admin/participantes/components/ParticipantesTabs.tsx
'use client';

import { useState } from 'react';
import { Users, ScanLine } from 'lucide-react';
import { TabelaInscritos } from './TabelaInscritos';
import { CheckinScanner }  from './CheckinScanner';
import type { Inscrito } from '../types';

type Tab = 'gestao' | 'checkin';

export function ParticipantesTabs({ inscritos }: { inscritos: Inscrito[] }) {
  const [tab, setTab] = useState<Tab>('gestao');

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'gestao',  label: 'Gestão de Inscritos', icon: Users,    badge: String(inscritos.length) },
    { id: 'checkin', label: 'Modo Check-in',        icon: ScanLine                                  },
  ];

  return (
    <>
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

      <div className="mt-6">
        {inscritos.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center">
            <p className="text-sm font-medium text-foreground">Nenhum participante ainda.</p>
            <p className="text-xs text-muted mt-1">Assim que alguém comprar um ingresso, aparece aqui.</p>
          </div>
        ) : (
          <>
            {tab === 'gestao'  && <TabelaInscritos inscritos={inscritos} />}
            {tab === 'checkin' && <CheckinScanner  inscritos={inscritos} />}
          </>
        )}
      </div>
    </>
  );
}
