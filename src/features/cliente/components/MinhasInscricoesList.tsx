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
  CORTESIA:  { label: 'Cortesia',  className: 'bg-primary/10 text-primary'     },
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
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 mt-2">
      <p className="text-sm text-primary font-medium">
        Envie esse link pra quem vai receber o ingresso. A transferência será concluída assim que a pessoa aceitar.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          readOnly
          value={link}
          className="input-base flex-1 font-mono text-sm truncate bg-background"
        />
        <button
          onClick={copiar}
          className="clubber-chip shrink-0 w-full sm:w-auto"
        >
          {copiado ? <Check size={16} className="text-success-fg" /> : <Copy size={16} />}
          {copiado ? 'Copiado' : 'Copiar Link'}
        </button>
      </div>
      <button
        onClick={onCancelarTransferencia}
        disabled={cancelando}
        className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted hover:text-error-fg transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-0 w-full sm:w-auto mt-2 sm:mt-0"
      >
        {cancelando ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
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
      <div className="clubber-card flex flex-col items-center py-16 text-center border-dashed border-2">
        <Ticket size={40} className="text-muted-subtle mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-foreground">Nenhum ingresso encontrado</h3>
        <p className="text-muted mt-2">Você ainda não tem nenhuma inscrição ativa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inscricoes.map((inscricao) => {
        const Icon = ICONE_TIPO[inscricao.loteTipo] ?? Ticket;
        const cfg = STATUS_CONFIG[inscricao.status] ?? STATUS_CONFIG.PENDENTE;
        const cancelando = cancelandoId === inscricao.id;
        const transferindo = transferindoId === inscricao.id;
        const erro = erroId?.id === inscricao.id ? erroId.mensagem : null;
        const podeTransferir = ['PAGO', 'CORTESIA'].includes(inscricao.status);

        return (
          <div key={inscricao.id} className="clubber-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-lg truncate">{inscricao.eventoNome}</h3>
                <p className="text-sm text-muted mt-1">{fmtData(inscricao.eventoDataInicio)}</p>
              </div>
              <span className={`inline-flex items-center self-start text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-border pt-4 gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon size={16} className="text-primary" />
                {inscricao.loteNome}
              </div>
              <span className="event-price text-base">{formatCurrency(inscricao.valor)}</span>
            </div>

            {erro && (
              <p className="text-sm text-error-fg bg-error-bg rounded-lg px-4 py-3 font-medium">{erro}</p>
            )}

            {inscricao.transferenciaToken && (
              <TransferenciaBox
                inscricao={inscricao}
                onCancelarTransferencia={() => handleCancelarTransferencia(inscricao)}
                cancelando={transferindo}
              />
            )}

            {inscricao.status !== 'CANCELADO' && !inscricao.transferenciaToken && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {podeTransferir && (
                  <button
                    onClick={() => handleSolicitarTransferencia(inscricao)}
                    disabled={transferindo}
                    className="clubber-button flex-1"
                  >
                    {transferindo ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Transferir Ingresso
                  </button>
                )}

                {inscricao.podecancelar ? (
                  <button
                    onClick={() => handleCancelar(inscricao)}
                    disabled={cancelando}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-lg border border-error-fg/30 text-error-fg bg-transparent hover:bg-error-bg text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {cancelando ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    {cancelando ? 'Cancelando…' : 'Cancelar'}
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center sm:justify-start gap-2 min-h-[42px] px-3 py-2 bg-background-tertiary rounded-lg border border-border">
                    <Clock size={14} className="text-muted-subtle shrink-0" />
                    <span className="text-xs text-muted font-medium text-center sm:text-left">
                      Cancelamento indisponível (menos de 48h ou expirado)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}