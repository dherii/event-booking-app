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
  PAGO:      { label: 'Pago',      className: 'bg-green-500/10 text-green-400'  },
  PENDENTE:  { label: 'Pendente',  className: 'bg-yellow-500/10 text-yellow-400' },
  CANCELADO: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400'      },
  CORTESIA:  { label: 'Cortesia', className: 'bg-blue-500/10 text-blue-400'    },
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
    <div className="bg-blue-950/40 border border-blue-900/50 rounded-lg p-3 space-y-2">
      <p className="text-xs text-blue-300">
        Envie esse link pra quem vai receber o ingresso. Ele só é transferido quando a pessoa aceitar.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 font-mono truncate"
        />
        <button
          onClick={copiar}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium transition-colors"
        >
          {copiado ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <button
        onClick={onCancelarTransferencia}
        disabled={cancelando}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
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
      <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
        <Ticket size={32} className="mx-auto text-gray-600 mb-3" strokeWidth={1.3} />
        <p className="text-gray-400">Você ainda não tem nenhuma inscrição.</p>
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
          <div key={inscricao.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{inscricao.eventoNome}</p>
                <p className="text-sm text-gray-400 mt-0.5">{fmtData(inscricao.eventoDataInicio)}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Icon size={15} className="text-blue-400" />
                {inscricao.loteNome}
              </div>
              <span className="text-sm font-bold text-green-400">{formatCurrency(inscricao.valor)}</span>
            </div>

            {erro && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
                {erro}
              </p>
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                  >
                    {transferindo ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Transferir
                  </button>
                )}

                {inscricao.podecancelar ? (
                  <button
                    onClick={() => handleCancelar(inscricao)}
                    disabled={cancelando}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-900/20 transition-colors disabled:opacity-60"
                  >
                    {cancelando ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    {cancelando ? 'Cancelando…' : 'Cancelar'}
                  </button>
                ) : (
                  <p className="flex-1 flex items-center gap-1.5 text-xs text-gray-500">
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
