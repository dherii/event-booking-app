// src/features/cliente/components/MinhasInscricoesList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, XCircle, Clock, Ticket, UtensilsCrossed, Crown, Send, Copy, Check, Ban } from 'lucide-react';
import { cancelarMinhaInscricao, solicitarTransferencia, cancelarTransferencia } from '../actions';
import type { MinhaInscricao } from '../actions';

const ICONE_TIPO: Record<string, React.ElementType> = {
  ingresso: Ticket,
  mesa: UtensilsCrossed,
  camarote: Crown,
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PAGO:      { label: 'Pago',      className: 'bg-success-bg text-success-fg'  },
  PENDENTE:  { label: 'Pendente',  className: 'bg-warning-bg text-warning-fg'  },
  CANCELADO: { label: 'Cancelado', className: 'bg-error-bg text-error-fg'      },
  CORTESIA:  { label: 'Cortesia',  className: 'bg-primary/10 text-primary'    },
};

function formatCurrency(v: number) {
  if (v === 0) return 'Grátis';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function TransferenciaBox({
  inscricao,
  onCancelarTransferencia,
  cancelando,
}: {
  inscricao: MinhaInscricao;
  onCancelarTransferencia: () => void;
  cancelando: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/transferir/${inscricao.transferenciaToken}`
    : '';

  async function copiar() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
      <p className="text-xs text-primary">
        Envie esse link pra quem vai receber o ingresso. Ele só é transferido quando a pessoa aceitar.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-muted font-mono truncate"
        />
        <button
          onClick={copiar}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover text-xs font-medium transition-colors"
        >
          {copiado ? <Check size={12} className="text-success-fg" /> : <Copy size={12} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <button
        onClick={onCancelarTransferencia}
        disabled={cancelando}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-error-fg transition-colors disabled:opacity-50"
      >
        {cancelando ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
        Cancelar transferência
      </button>
    </div>
  );
}

export function MinhasInscricoesList({ inscricoes: initial }: { inscricoes: MinhaInscricao[] }) {
  const router = useRouter();
  const [inscricoes, setInscricoes] = useState(initial);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [transferindoId, setTransferindoId] = useState<string | null>(null);
  const [erroId, setErroId] = useState<{ id: string; mensagem: string } | null>(null);

  async function handleCancelar(inscricao: MinhaInscricao) {
    if (!confirm(`Cancelar sua inscrição em "${inscricao.eventoNome}"?`)) return;

    setCancelandoId(inscricao.id);
    setErroId(null);

    try {
      await cancelarMinhaInscricao(inscricao.id);
      setInscricoes((prev) => prev.map((i) => i.id === inscricao.id ? { ...i, status: 'CANCELADO', podecancelar: false } : i));
      router.refresh();
    } catch (err) {
      setErroId({ id: inscricao.id, mensagem: err instanceof Error ? err.message : 'Erro ao cancelar.' });
    } finally {
      setCancelandoId(null);
    }
  }

  async function handleSolicitarTransferencia(inscricao: MinhaInscricao) {
    setTransferindoId(inscricao.id);
    setErroId(null);

    try {
      const { token } = await solicitarTransferencia(inscricao.id);
      setInscricoes((prev) => prev.map((i) => i.id === inscricao.id ? { ...i, transferenciaToken: token } : i));
    } catch (err) {
      setErroId({ id: inscricao.id, mensagem: err instanceof Error ? err.message : 'Erro ao gerar transferência.' });
    } finally {
      setTransferindoId(null);
    }
  }

  async function handleCancelarTransferencia(inscricao: MinhaInscricao) {
    setTransferindoId(inscricao.id);
    try {
      await cancelarTransferencia(inscricao.id);
      setInscricoes((prev) => prev.map((i) => i.id === inscricao.id ? { ...i, transferenciaToken: null } : i));
    } catch (err) {
      setErroId({ id: inscricao.id, mensagem: err instanceof Error ? err.message : 'Erro ao cancelar transferência.' });
    } finally {
      setTransferindoId(null);
    }
  }

  if (inscricoes.length === 0) {
    return (
      <div className="clubber-card flex flex-col items-center py-16 text-center border-dashed">
        <Ticket size={32} className="text-muted-subtle mb-3" strokeWidth={1.3} />
        <p className="text-muted">Você ainda não tem nenhuma inscrição.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inscricoes.map((inscricao) => {
        const Icon = ICONE_TIPO[inscricao.loteTipo] ?? Ticket;
        const cfg = STATUS_CONFIG[inscricao.status] ?? STATUS_CONFIG.PENDENTE;
        const cancelando = cancelandoId === inscricao.id;
        const transferindo = transferindoId === inscricao.id;
        const erro = erroId?.id === inscricao.id ? erroId.mensagem : null;
        const podeTransferir = ['PAGO', 'CORTESIA'].includes(inscricao.status);

        return (
          <div key={inscricao.id} className="clubber-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold truncate">{inscricao.eventoNome}</p>
                <p className="text-sm text-muted mt-0.5">{fmtData(inscricao.eventoDataInicio)}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Icon size={15} className="text-primary" />
                {inscricao.loteNome}
              </div>
              <span className="event-price text-sm">{formatCurrency(inscricao.valor)}</span>
            </div>

            {erro && (
              <p className="text-xs text-error-fg bg-error-bg rounded-lg px-3 py-2">{erro}</p>
            )}

            {inscricao.transferenciaToken && (
              <TransferenciaBox
                inscricao={inscricao}
                onCancelarTransferencia={() => handleCancelarTransferencia(inscricao)}
                cancelando={transferindo}
              />
            )}

            {inscricao.status !== 'CANCELADO' && !inscricao.transferenciaToken && (
              <div className="flex gap-2 pt-1">
                {podeTransferir && (
                  <button
                    onClick={() => handleSolicitarTransferencia(inscricao)}
                    disabled={transferindo}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-muted text-sm font-medium hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-60"
                  >
                    {transferindo ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Transferir
                  </button>
                )}

                {inscricao.podecancelar ? (
                  <button
                    onClick={() => handleCancelar(inscricao)}
                    disabled={cancelando}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-error-fg/30 text-error-fg text-sm font-medium hover:bg-error-bg transition-colors disabled:opacity-60"
                  >
                    {cancelando ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    {cancelando ? 'Cancelando…' : 'Cancelar'}
                  </button>
                ) : (
                  <p className="flex-1 flex items-center gap-1.5 text-xs text-muted-subtle">
                    <Clock size={12} />
                    Cancelamento indisponível (menos de 48h ou prazo expirado)
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
