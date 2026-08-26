// app/checkout/[id]/page.tsx
// Página de exibição do QR Code Pix gerado pela MisticPay.
// Busca os dados da inscrição pelo ID e renderiza:
//   - Imagem do QR Code (qrCodeBase64 salvo no banco)
//   - Código Pix copia e cola (txid_pix)
//   - Polling automático a cada 5s consultando a API MisticPay
//   - Feedback visual ao detectar pagamento confirmado

'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Copy, Check, Loader2, Clock, AlertCircle } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusPagamento = 'PENDENTE' | 'PAGO' | 'FALHA' | 'CANCELADO';

interface DadosCheckout {
  id:              string;
  status_pagamento: StatusPagamento;
  txid_pix:        string | null;   // copyPaste
  qr_code_base64:  string | null;
  lotes: {
    preco: number;
    eventos: {
      nome: string;
    };
  };
}

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function EstadoPago({ onContinuar }: { onContinuar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center py-8">
      <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center">
        <CheckCircle size={40} className="text-success-fg" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Pagamento confirmado!</h2>
        <p className="text-sm text-muted mt-1">Seu ingresso foi gerado com sucesso.</p>
      </div>
      <button
        onClick={onContinuar}
        className="w-full py-3 rounded-xl bg-primary text-primary-fg font-semibold text-sm hover:bg-primary-hover transition-colors"
      >
        Ver meu ingresso
      </button>
    </div>
  );
}

function EstadoFalha() {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-8">
      <div className="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center">
        <AlertCircle size={32} className="text-error-fg" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Pagamento não confirmado</h2>
        <p className="text-sm text-muted mt-1">O prazo expirou ou houve um problema. Tente novamente.</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const { id } = use(params); // <-- CORREÇÃO 2: Extraindo com o hook use()

  const [dados,       setDados]       = useState<DadosCheckout | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [copiado,     setCopiado]     = useState(false);
  const [polling,     setPolling]     = useState(true);
  // Tempo restante (15 minutos para o QR Code expirar — conservador)
  const [segundos,    setSegundos]    = useState(15 * 60);
  const [erroBusca,   setErroBusca]   = useState<string | null>(null);

  // ── Busca dados da inscrição no backend ──────────────────────────────────
  const buscarInscricao = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkout/${id}/status`);
      if (!res.ok) throw new Error('Inscrição não encontrada.');
      const data: DadosCheckout = await res.json();
      setDados(data);

      // Para o polling se pago ou com falha
      if (data.status_pagamento === 'PAGO' || data.status_pagamento === 'FALHA') {
        setPolling(false);
      }
    } catch (err) {
      setErroBusca(err instanceof Error ? err.message : 'Erro ao carregar dados.');
    } finally {
      setLoadingPage(false);
    }
  }, [id]);

  // ── Carrega na montagem ───────────────────────────────────────────────────
  useEffect(() => {
    buscarInscricao();
  }, [buscarInscricao]);

  // ── Polling a cada 5s enquanto PENDENTE ──────────────────────────────────
  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(() => {
      buscarInscricao();
    }, 5000);

    return () => clearInterval(interval);
  }, [polling, buscarInscricao]);

  // ── Contador regressivo ───────────────────────────────────────────────────
  useEffect(() => {
    if (!polling || dados?.status_pagamento !== 'PENDENTE') return;

    const timer = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          setPolling(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [polling, dados?.status_pagamento]);

  // ── Copia o código Pix ────────────────────────────────────────────────────
  async function copiarCodigo() {
    if (!dados?.txid_pix) return;
    await navigator.clipboard.writeText(dados.txid_pix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  // ── Formata o contador ────────────────────────────────────────────────────
  const minutos = Math.floor(segundos / 60);
  const segs    = segundos % 60;
  const tempoStr = `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;

  // ─── Renderização ─────────────────────────────────────────────────────────

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-muted" />
      </div>
    );
  }

  if (erroBusca || !dados) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto text-error-fg mb-3" />
          <p className="text-sm text-muted">{erroBusca ?? 'Não foi possível carregar o pedido.'}</p>
        </div>
      </div>
    );
  }

  const nomeEvento = dados.lotes?.eventos?.nome ?? 'Evento';
  const preco      = dados.lotes?.preco ?? 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-5">

        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground">{nomeEvento}</h1>
          <p className="text-sm text-muted mt-0.5">
            {preco > 0
              ? `R$ ${preco.toFixed(2).replace('.', ',')} via Pix`
              : 'Ingresso gratuito'
            }
          </p>
        </div>

        {/* Conteúdo por status */}
        {dados.status_pagamento === 'PAGO' && (
          <EstadoPago onContinuar={() => router.push('/minhas-inscricoes')} />
        )}

        {dados.status_pagamento === 'FALHA' && <EstadoFalha />}

        {dados.status_pagamento === 'PENDENTE' && (
          <>
            {/* Contador regressivo */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <Clock size={15} />
              <span>
                {segundos > 0
                  ? `QR Code expira em ${tempoStr}`
                  : 'QR Code expirado — gere um novo pedido.'
                }
              </span>
            </div>

            {/* QR Code */}
            {dados.qr_code_base64 ? (
              <div className="flex justify-center">
                <img
                  src={dados.qr_code_base64}
                  alt="QR Code Pix"
                  className="w-52 h-52 rounded-xl border border-border"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-52 bg-border/30 rounded-xl">
                <p className="text-xs text-muted">QR Code indisponível — use o código abaixo.</p>
              </div>
            )}

            {/* Copia e cola */}
            {dados.txid_pix && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                  Pix Copia e Cola
                </p>
                <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
                  <p className="flex-1 text-xs text-foreground font-mono truncate">
                    {dados.txid_pix}
                  </p>
                  <button
                    onClick={copiarCodigo}
                    className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                      copiado
                        ? 'bg-success-bg text-success-fg'
                        : 'text-muted hover:text-foreground hover:bg-border'
                    }`}
                    aria-label="Copiar código"
                  >
                    {copiado ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                {copiado && (
                  <p className="text-xs text-success-fg text-center">Código copiado!</p>
                )}
              </div>
            )}

            {/* Status de aguardo */}
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted">
              <Loader2 size={15} className="animate-spin" />
              <span>Aguardando confirmação do pagamento…</span>
            </div>

            <p className="text-center text-[11px] text-muted leading-relaxed">
              Abra o app do seu banco, escolha <strong>Pix</strong> e escaneie o QR Code
              ou cole o código acima. O pagamento é confirmado em segundos.
            </p>
          </>
        )}
      </div>
    </div>
  );
}