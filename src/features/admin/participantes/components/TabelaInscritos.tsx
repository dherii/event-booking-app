// src/features/admin/participantes/components/TabelaInscritos.tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, SlidersHorizontal, MoreVertical,
  Eye, CheckCircle, XCircle, ChevronDown,
} from 'lucide-react';
import type { Inscrito, StatusPagamento } from '../types';
import { MOCK_EVENTOS } from '../types';

// ─── Helpers de exibição ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusPagamento, { label: string; className: string }> = {
  pago:      { label: 'Pago',      className: 'bg-success-bg text-success-fg'                                              },
  pendente:  { label: 'Pendente',  className: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'   },
  cancelado: { label: 'Cancelado', className: 'bg-error-bg text-error-fg'                                                  },
  cortesia:  { label: 'Cortesia',  className: 'bg-primary/10 text-primary'                                                 },
};

function StatusBadge({ status }: { status: StatusPagamento }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function formatCurrency(v: number) {
  if (v === 0) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ─── Menu de ações (dropdown) ─────────────────────────────────────────────────

interface AcoesMenuProps {
  inscrito: Inscrito;
  onVerDetalhes:     (i: Inscrito) => void;
  onAprovarCortesia: (i: Inscrito) => void;
  onCancelar:        (i: Inscrito) => void;
}

function AcoesMenu({ inscrito, onVerDetalhes, onAprovarCortesia, onCancelar }: AcoesMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-border transition-colors"
        aria-label="Ações"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 bg-card border border-border rounded-xl shadow-lg py-1 text-sm">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-foreground hover:bg-border transition-colors"
            onClick={() => { onVerDetalhes(inscrito); setOpen(false); }}
          >
            <Eye size={15} className="text-muted shrink-0" />
            Ver detalhes
          </button>

          {inscrito.status !== 'cortesia' && inscrito.status !== 'cancelado' && (
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-foreground hover:bg-border transition-colors"
              onClick={() => { onAprovarCortesia(inscrito); setOpen(false); }}
            >
              <CheckCircle size={15} className="text-success-fg shrink-0" />
              Aprovar como cortesia
            </button>
          )}

          {inscrito.status !== 'cancelado' && (
            <>
              <div className="my-1 border-t border-border" />
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-error-fg hover:bg-error-bg transition-colors"
                onClick={() => { onCancelar(inscrito); setOpen(false); }}
              >
                <XCircle size={15} className="shrink-0" />
                Cancelar / Estornar Pix
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Modal de detalhes ────────────────────────────────────────────────────────

function DetalheModal({ inscrito, onClose }: { inscrito: Inscrito; onClose: () => void }) {
  const rows: [string, string][] = [
    ['CPF',              inscrito.cpf],
    ['Telefone',         inscrito.telefone],
    ['Evento',           inscrito.evento],
    ['Atividade',        inscrito.atividade],
    ['Lote',             inscrito.lote],
    ['Valor',            formatCurrency(inscrito.valor)],
    ['Código',           inscrito.codigoIngresso],
    ['Inscrito em',      formatDate(inscrito.criadoEm)],
    ['Check-in',         inscrito.checkin ? `Sim — ${new Date(inscrito.checkinAt!).toLocaleString('pt-BR')}` : 'Não realizado'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{inscrito.nome}</h3>
            <p className="text-sm text-muted">{inscrito.email}</p>
          </div>
          <StatusBadge status={inscrito.status} />
        </div>

        <dl className="divide-y divide-border text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 gap-4">
              <dt className="text-muted shrink-0">{label}</dt>
              <dd className="text-foreground text-right">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-border transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface TabelaInscritosProps {
  inscritos: Inscrito[];
}

export function TabelaInscritos({ inscritos }: TabelaInscritosProps) {
  const [busca,         setBusca]         = useState('');
  const [filtroEvento,  setFiltroEvento]  = useState('');
  const [filtroStatus,  setFiltroStatus]  = useState<StatusPagamento | ''>('');
  const [detalhe,       setDetalhe]       = useState<Inscrito | null>(null);
  const [lista,         setLista]         = useState<Inscrito[]>(inscritos);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return lista.filter((i) => {
      const matchBusca  = !q || i.nome.toLowerCase().includes(q) || i.cpf.includes(q) || i.email.toLowerCase().includes(q);
      const matchEvento = !filtroEvento || i.eventoId === filtroEvento;
      const matchStatus = !filtroStatus || i.status === filtroStatus;
      return matchBusca && matchEvento && matchStatus;
    });
  }, [lista, busca, filtroEvento, filtroStatus]);

  function aprovarCortesia(inscrito: Inscrito) {
    setLista((prev) => prev.map((i) => i.id === inscrito.id ? { ...i, status: 'cortesia' } : i));
  }

  function cancelar(inscrito: Inscrito) {
    if (!confirm(`Cancelar a inscrição de ${inscrito.nome}? Esta ação não pode ser desfeita.`)) return;
    setLista((prev) => prev.map((i) => i.id === inscrito.id ? { ...i, status: 'cancelado' } : i));
  }

  const statusOpcoes: { value: StatusPagamento | ''; label: string }[] = [
    { value: '',          label: 'Todos os status' },
    { value: 'pago',      label: 'Pago'            },
    { value: 'pendente',  label: 'Pendente'         },
    { value: 'cortesia',  label: 'Cortesia'         },
    { value: 'cancelado', label: 'Cancelado'        },
  ];

  return (
    <>
      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Busca */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            className="input-base pl-9 text-sm"
            placeholder="Buscar por nome, e-mail ou CPF…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Filtro por evento */}
        <div className="relative">
          <select
            className="input-base text-sm pr-8 appearance-none"
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
          >
            <option value="">Todos os eventos</option>
            {MOCK_EVENTOS.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* Filtro por status */}
        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <select
            className="input-base text-sm pl-8 pr-8 appearance-none"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusPagamento | '')}
          >
            {statusOpcoes.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      {/* Contagem */}
      <p className="text-xs text-muted mb-3">
        {filtrados.length} inscrito{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
      </p>

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                {['Participante', 'Evento', 'Lote', 'Valor', 'Status', 'Check-in', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                    Nenhum inscrito encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtrados.map((inscrito) => (
                  <tr key={inscrito.id} className="hover:bg-border/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-foreground">{inscrito.nome}</p>
                      <p className="text-xs text-muted">{inscrito.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-foreground">{inscrito.evento}</p>
                      <p className="text-xs text-muted">{inscrito.atividade}</p>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{inscrito.lote}</td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {formatCurrency(inscrito.valor)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={inscrito.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {inscrito.checkin ? (
                        <span className="flex items-center gap-1.5 text-success-fg text-xs font-medium">
                          <CheckCircle size={13} />
                          {inscrito.checkinAt ? new Date(inscrito.checkinAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Sim'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AcoesMenu
                        inscrito={inscrito}
                        onVerDetalhes={setDetalhe}
                        onAprovarCortesia={aprovarCortesia}
                        onCancelar={cancelar}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalhes */}
      {detalhe && <DetalheModal inscrito={detalhe} onClose={() => setDetalhe(null)} />}
    </>
  );
}