'use client';

import { useState, useMemo } from 'react';
import { Users, ScanLine, CalendarCheck2, Filter } from 'lucide-react';
import { TabelaInscritos } from './TabelaInscritos';
import { CheckinScanner } from './CheckinScanner';
import { TabelaFrequencia } from './TabelaFrequencia';
import type { Inscrito } from '../types';

type Tab = 'gestao' | 'frequencia' | 'checkin';

export function ParticipantesTabs({ inscritos }: { inscritos: Inscrito[] }) {
  const [tab, setTab] = useState<Tab>('gestao');
  const [eventoSelecionado, setEventoSelecionado] = useState<string>('todos');

  const eventosUnicos = useMemo(() => {
    const map = new Map<string, string>();
    inscritos.forEach((i) => {
      if (i.eventoId && i.evento) {
        map.set(i.eventoId, i.evento);
      }
    });
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [inscritos]);

  const inscritosFiltrados = useMemo(() => {
    if (eventoSelecionado === 'todos') return inscritos;
    return inscritos.filter((i) => i.eventoId === eventoSelecionado);
  }, [inscritos, eventoSelecionado]);

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'gestao', label: 'Gestão de Inscritos', icon: Users, badge: String(inscritosFiltrados.length) },
    { id: 'frequencia', label: 'Lista de Frequência', icon: CalendarCheck2 },
    { id: 'checkin', label: 'Modo Check-in', icon: ScanLine },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2 sm:pb-0">
        <div className="flex gap-2 -mb-px overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon, badge }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon size={16} />
                {label}
                {badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {eventosUnicos.length > 0 && (
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Filter size={15} className="text-slate-400" />
            <select
              value={eventoSelecionado}
              onChange={(e) => setEventoSelecionado(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="todos">Todos os Eventos ({inscritos.length})</option>
              {eventosUnicos.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-6">
        {inscritosFiltrados.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center bg-white">
            <p className="text-sm font-medium text-slate-900">Nenhum participante encontrado.</p>
            <p className="text-xs text-slate-500 mt-1">
              {eventoSelecionado !== 'todos'
                ? 'Não há inscritos registrados para este evento específico.'
                : 'Assim que alguém comprar um ingresso, aparecerá aqui.'}
            </p>
          </div>
        ) : (
          <>
            {tab === 'gestao' && <TabelaInscritos inscritos={inscritosFiltrados} />}
            {tab === 'frequencia' && <TabelaFrequencia inscritos={inscritosFiltrados} />}
            {tab === 'checkin' && <CheckinScanner inscritos={inscritosFiltrados} />}
          </>
        )}
      </div>
    </>
  );
}