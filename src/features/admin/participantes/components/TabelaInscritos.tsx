// src/features/admin/participantes/components/TabelaInscritos.tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, SlidersHorizontal, MoreVertical,
  Eye, CheckCircle, XCircle, ChevronDown, Loader2,
} from 'lucide-react';
import type { Inscrito, StatusPagamento } from '../types';
import { MOCK_EVENTOS } from '../types';
import { aprovarCortesia, cancelarInscricao } from '../actions';

const STATUS_CONFIG: Record<StatusPagamento, { label: string; className: string }> = {
  pago:      { label: 'Pago', className: 'bg-success-bg text-success-fg border border-success-fg/20' },
  pendente:  { label: 'Pendente', className: 'bg-warning-bg text-warning-fg border border-warning-fg/20' },
  cancelado: { label: 'Cancelado', className: 'bg-error-bg text-error-fg border border-error-fg/20' },
  cortesia:  { label: 'Cortesia', className: 'bg-primary/10 text-primary border border-primary/20' },
};

function StatusBadge({ status }: { status: StatusPagamento }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
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

interface AcoesMenuProps {
  inscrito: Inscrito;
  loading: boolean;
  onVerDetalhes: (i: Inscrito) => void;
  onAprovarCortesia: (i: Inscrito) => void;
  onCancelar: (i: Inscrito) => void;
}

function AcoesMenu({ inscrito, loading, onVerDetalhes, onAprovarCortesia, onCancelar }: AcoesMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        disabled={loading}
        className="p-1.5 rounded-lg text-muted-subtle hover:text-foreground hover:bg-background-secondary transition-all cursor-pointer disabled:opacity-50"
        aria-label="Ações"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 bg-card border border-border rounded-xl shadow-lg py-1 text-xs font-medium">
          <button
            className="w-full flex items-center gap-2 px-3.5 py-2 text-foreground hover:bg-background-secondary transition-colors cursor-pointer"
            onClick={() => { onVerDetalhes(inscrito); setOpen(false); }}
          >
            <Eye size={14} className="text-muted-subtle shrink-0" />
            Ver detalhes
          </button>

          {inscrito.status !== 'cortesia' && inscrito.status !== 'cancelado' && (
            <button
              className="w-full flex items-center gap-2 px-3.5 py-2 text-foreground hover:bg-background-secondary transition-colors cursor-pointer"
              onClick={() => { onAprovarCortesia(inscrito); setOpen(false); }}
            >
              <CheckCircle size={14} className="text-success-fg shrink-0" />
              Aprovar como cortesia
            </button>
          )}

          {inscrito.status !== 'cancelado' && (
            <>
              <div className="my-1 border-t border-border-light" />
              <button
                className="w-full flex items-center gap-2 px-3.5 py-2 text-error-fg hover:bg-error-bg transition-colors cursor-pointer"
                onClick={() => { onCancelar(inscrito); setOpen(false); }}
              >
                <XCircle size={14} className="shrink-0" />
                Cancelar inscrição
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DetalheModal({ inscrito, onClose }: { inscrito: Inscrito; onClose: () => void }) {
  const rows: [string, string][] = [
    ['CPF', inscrito.cpf],
    ['Telefone', inscrito.telefone],
    ['Evento', inscrito.evento],
    ['Atividade', inscrito.atividade],
    ['Lote', inscrito.lote],
    ['Valor', formatCurrency(inscrito.valor)],
    ['Código', inscrito.codigoIngresso],
    ['Inscrito em', formatDate(inscrito.criadoEm)],
    ['Check-in', inscrito.checkin ? `Sim — ${new Date(inscrito.checkinAt!).toLocaleString('pt-BR')}` : 'Não realizado'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{inscrito.nome}</h3>
            <p className="text-xs text-muted">{inscrito.email || 'E-mail não disponível'}</p>
          </div>
          <StatusBadge status={inscrito.status} />
        </div>

        <dl className="divide-y divide-border-light text-xs">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-2.5 gap-4">
              <dt className="text-muted font-medium shrink-0">{label}</dt>
              <dd className="text-foreground font-semibold text-right">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-background-secondary transition-all cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

interface TabelaInscritosProps {
  inscritos: Inscrito[];
}

export function TabelaInscritos({ inscritos }: TabelaInscritosProps) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento | ''>('');
  const [detalhe, setDetalhe] = useState<Inscrito | null>(null);
  const [lista, setLista] = useState<Inscrito[]>(inscritos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return lista.filter((i) => {
      const matchBusca = !q || i.nome.toLowerCase().includes(q) || i.cpf.includes(q) || i.email.toLowerCase().includes(q);
      const matchEvento = !filtroEvento || i.eventoId === filtroEvento;
      const matchStatus = !filtroStatus || i.status === filtroStatus;
      return matchBusca && matchEvento && matchStatus;
    });
  }, [lista, busca, filtroEvento, filtroStatus]);

  async function handleAprovarCortesia(inscrito: Inscrito) {
    setErro(null);
    setLoadingId(inscrito.id);
    try {
      await aprovarCortesia(inscrito.id);
      setLista((prev) => prev.map((i) => (i.id === inscrito.id ? { ...i, status: 'cortesia' } : i)));
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao aprovar cortesia.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCancelar(inscrito: Inscrito) {
    if (!confirm(`Cancelar a inscrição de ${inscrito.nome}? A vaga volta para o estoque.`)) return;

    setErro(null);
    setLoadingId(inscrito.id);
    try {
      await cancelarInscricao(inscrito.id);
      setLista((prev) => prev.map((i) => (i.id === inscrito.id ? { ...i, status: 'cancelado' } : i)));
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cancelar inscrição.');
    } finally {
      setLoadingId(null);
    }
  }

  const statusOpcoes: { value: StatusPagamento | ''; label: string }[] = [
    { value: '', label: 'Todos os status' },
    { value: 'pago', label: 'Pago' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'cortesia', label: 'Cortesia' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  return (
    <>
      {erro && (
        <p role="alert" className="mb-4 bg-error-bg border border-error-fg/20 text-error-fg text-xs font-medium px-4 py-3 rounded-xl">
          {erro}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
          <input
            type="text"
            className="input-base pl-10"
            placeholder="Buscar por nome, e-mail ou CPF…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            className="input-base appearance-none pr-9"
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
          >
            <option value="">Todos os eventos</option>
            {MOCK_EVENTOS.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
        </div>

        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
          <select
            className="input-base pl-8 pr-9 appearance-none"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusPagamento | '')}
          >
            {statusOpcoes.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
        </div>
      </div>

      <p className="text-xs text-muted font-medium mb-3">
        {filtrados.length} inscrito{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
      </p>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border-light bg-background-secondary/70 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-5 py-3.5">Participante</th>
                <th className="px-5 py-3.5">Evento</th>
                <th className="px-5 py-3.5">Lote</th>
                <th className="px-5 py-3.5">Valor</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Check-in</th>
                <th className="px-5 py-3.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-muted">
                    Nenhum inscrito encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtrados.map((inscrito) => (
                  <tr key={inscrito.id} className="hover:bg-background-secondary/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-foreground">{inscrito.nome}</p>
                      {inscrito.email && <p className="text-xs text-muted">{inscrito.email}</p>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-foreground">{inscrito.evento}</p>
                      <p className="text-xs text-muted">{inscrito.atividade}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">{inscrito.lote}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">
                      {formatCurrency(inscrito.valor)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={inscrito.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {inscrito.checkin ? (
                        <span className="flex items-center gap-1.5 text-success-fg text-xs font-semibold">
                          <CheckCircle size={14} />
                          {inscrito.checkinAt ? new Date(inscrito.checkinAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Sim'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-subtle">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <AcoesMenu
                        inscrito={inscrito}
                        loading={loadingId === inscrito.id}
                        onVerDetalhes={setDetalhe}
                        onAprovarCortesia={handleAprovarCortesia}
                        onCancelar={handleCancelar}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detalhe && <DetalheModal inscrito={detalhe} onClose={() => setDetalhe(null)} />}
    </>
  );
}